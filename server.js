
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("IdeaVault Server is Running!");
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
