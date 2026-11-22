
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const ideaRoutes = require("./routes/ideaRoutes");
const admin = require("./firebaseAdmin");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/ideas", ideaRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("IdeaVault Server is Running!");
});

// Firebase Admin test route
app.get("/test-firebase", (req, res) => {
  res.json({
    message: "Firebase Admin is initialized successfully!",
    projectId: admin.options.projectId,
  });
});

// Connect MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`IdeaVault server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
  });
