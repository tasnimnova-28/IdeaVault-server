const express = require("express");
const router = express.Router();
const Idea = require("../models/Idea");

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