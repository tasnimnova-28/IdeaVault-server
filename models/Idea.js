
const mongoose = require("mongoose");

// Schema for comments
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Schema for startup ideas
const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
    },

    detailedDescription: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    imageUrl: {
      type: String,
      default: "",
    },

    budget: {
      type: Number,
      default: 0,
    },

    targetAudience: {
      type: String,
      default: "",
    },

    problemStatement: {
      type: String,
      default: "",
    },

    proposedSolution: {
      type: String,
      default: "",
    },

    authorId: {
      type: String,
      required: true,
    },

    authorName: {
      type: String,
      required: true,
    },

    authorEmail: {
      type: String,
      required: true,
    },

    likes: {
      type: [String],
      default: [],
    },

    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Create model
const Idea = mongoose.model("Idea", ideaSchema);

module.exports = Idea;
