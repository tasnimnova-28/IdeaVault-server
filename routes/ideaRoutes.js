const express = require("express");
const router = express.Router();
const Idea = require("../models/Idea");

// GET 6 trending ideas
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


// GET all ideas
router.get("/", async (req, res) => {
  try {
    const ideas = await Idea.find().sort({ createdAt: -1 });
    res.status(200).json(ideas);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ideas" });
  }
});

// GET single idea
router.get("/:id", async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    res.status(200).json(idea);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch idea" });
  }
});

// CREATE new idea
router.post("/", async (req, res) => {
  try {
    const newIdea = new Idea(req.body);
    const savedIdea = await newIdea.save();

    res.status(201).json(savedIdea);
  } catch (error) {
    res.status(400).json({ message: "Failed to create idea" });
  }
});

// UPDATE idea
router.put("/:id", async (req, res) => {
  try {
    const updatedIdea = await Idea.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedIdea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    res.status(200).json(updatedIdea);
  } catch (error) {
    res.status(400).json({ message: "Failed to update idea" });
  }
});

// LIKE / UNLIKE an idea
router.post("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({
        message: "Idea not found",
      });
    }

    // Check whether this user already liked the idea
    const alreadyLiked = idea.likes.includes(userId);

    if (alreadyLiked) {
      // Remove the like
      idea.likes = idea.likes.filter((id) => id !== userId);
    } else {
      // Add the like
      idea.likes.push(userId);
    }

    await idea.save();

    res.status(200).json({
      message: alreadyLiked ? "Like removed" : "Idea liked",
      idea,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update like",
    });
  }
});


// ADD a comment
router.post("/:id/comments", async (req, res) => {
  try {
    const { userId, userName, text } = req.body;

    if (!userId || !userName || !text?.trim()) {
      return res.status(400).json({
        message: "User information and comment text are required",
      });
    }

    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    idea.comments.push({
      userId,
      userName,
      text: text.trim(),
    });

    await idea.save();

    res.status(201).json(idea);
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// EDIT a comment
router.put("/:id/comments/:commentId", async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text?.trim()) {
      return res.status(400).json({
        message: "User ID and comment text are required",
      });
    }

    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    const comment = idea.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({
        message: "You can only edit your own comments",
      });
    }

    comment.text = text.trim();

    await idea.save();

    res.status(200).json(idea);
  } catch (error) {
    res.status(500).json({ message: "Failed to update comment" });
  }
});

// DELETE a comment
router.delete("/:id/comments/:commentId", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    const comment = idea.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    comment.deleteOne();

    await idea.save();

    res.status(200).json(idea);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment" });
  }
});


// DELETE idea
router.delete("/:id", async (req, res) => {
  try {
    const deletedIdea = await Idea.findByIdAndDelete(req.params.id);

    if (!deletedIdea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    res.status(200).json({ message: "Idea deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete idea" });
  }
});

module.exports = router;