
const express = require("express");
const router = express.Router();

const Idea = require("../models/Idea");
const verifyToken = require("../middleware/verifyToken");

// Only allow these fields to be created or updated by the frontend
const getIdeaFields = (body) => {
  const allowedFields = [
    "title",
    "shortDescription",
    "detailedDescription",
    "category",
    "tags",
    "imageUrl",
    "budget",
    "targetAudience",
    "problemStatement",
    "proposedSolution",
  ];

  const ideaData = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      ideaData[field] = body[field];
    }
  });

  return ideaData;
};


// GET 6 trending ideas (PUBLIC)
router.get("/trending", async (req, res) => {
  try {
    const trendingIdeas = await Idea.aggregate([
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
        },
      },
      {
        $sort: {
          likesCount: -1,
          createdAt: -1,
        },
      },
      {
        $limit: 6,
      },
    ]);

    res.status(200).json(trendingIdeas);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch trending ideas",
    });
  }
});


// GET all ideas (PUBLIC)
router.get("/", async (req, res) => {
  try {
const ideas = await Idea.find().select("-authorEmail").sort({ createdAt: -1 });
    res.status(200).json(ideas);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch ideas",
    });
  }
});


// GET single idea (PUBLIC)
router.get("/:id", async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).select("-authorEmail");

    if (!idea) {
      return res.status(404).json({
        message: "Idea not found",
      });
    }

    res.status(200).json(idea);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch idea",
    });
  }
});

// CREATE new idea (LOGIN REQUIRED)
router.post("/", verifyToken, async (req, res) => {
  try {
    const newIdea = new Idea({
      ...getIdeaFields(req.body),

      // Identity comes from the verified Firebase token
      authorId: req.user.uid,
      authorName: req.user.name || req.user.email || "User",
      authorEmail: req.user.email,

      // Never accept likes or comments from the request body
      likes: [],
      comments: [],
    });

    const savedIdea = await newIdea.save();

    res.status(201).json(savedIdea);
  } catch (error) {
    console.error("Create idea error:", error.message);

    res.status(400).json({
      message: "Failed to create idea",
    });
  }
});


// UPDATE idea (OWNER ONLY)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({
        message: "Idea not found",
      });
    }

    if (idea.authorId !== req.user.uid) {
      return res.status(403).json({
        message: "You can only edit your own ideas",
      });
    }

    const updatedIdea = await Idea.findByIdAndUpdate(
      req.params.id,
      { $set: getIdeaFields(req.body) },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedIdea);
  } catch (error) {
    console.error("Update idea error:", error.message);

    res.status(400).json({
      message: "Failed to update idea",
    });
  }
});


// LIKE / UNLIKE an idea (LOGIN REQUIRED)
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({
        message: "Idea not found",
      });
    }

    const alreadyLiked = idea.likes.includes(userId);

    if (alreadyLiked) {
      idea.likes = idea.likes.filter((id) => id !== userId);
    } else {
      idea.likes.push(userId);
    }

    await idea.save();

    res.status(200).json({
      message: alreadyLiked ? "Like removed" : "Idea liked",
      idea,
    });
  } catch (error) {
    console.error("Like error:", error.message);

    res.status(500).json({
      message: "Failed to update like",
    });
  }
});


// ADD a comment (LOGIN REQUIRED)
router.post("/:id/comments", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({
        message: "Idea not found",
      });
    }

    idea.comments.push({
      userId: req.user.uid,
      userName: req.user.name || req.user.email || "User",
      text: text.trim(),
    });

    await idea.save();

    res.status(201).json(idea);
  } catch (error) {
    console.error("Add comment error:", error.message);

    res.status(500).json({
      message: "Failed to add comment",
    });
  }
});


// EDIT a comment (COMMENT OWNER ONLY)
router.put("/:id/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({
        message: "Idea not found",
      });
    }

    const comment = idea.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.userId !== req.user.uid) {
      return res.status(403).json({
        message: "You can only edit your own comments",
      });
    }

    comment.text = text.trim();

    await idea.save();

    res.status(200).json(idea);
  } catch (error) {
    console.error("Edit comment error:", error.message);

    res.status(500).json({
      message: "Failed to update comment",
    });
  }
});


// DELETE a comment (COMMENT OWNER ONLY)
router.delete("/:id/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({
        message: "Idea not found",
      });
    }

    const comment = idea.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.userId !== req.user.uid) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    comment.deleteOne();

    await idea.save();

    res.status(200).json(idea);
  } catch (error) {
    console.error("Delete comment error:", error.message);

    res.status(500).json({
      message: "Failed to delete comment",
    });
  }
});


// DELETE idea (OWNER ONLY)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({
        message: "Idea not found",
      });
    }

    if (idea.authorId !== req.user.uid) {
      return res.status(403).json({
        message: "You can only delete your own ideas",
      });
    }

    await idea.deleteOne();

    res.status(200).json({
      message: "Idea deleted successfully",
    });
  } catch (error) {
    console.error("Delete idea error:", error.message);

    res.status(500).json({
      message: "Failed to delete idea",
    });
  }
});


module.exports = router;
