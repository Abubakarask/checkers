const path = require("path");
const express = require("express");
const cors = require("cors");
const { connectToDB } = require("./database/db");

const publicDirectoryPath = path.join(__dirname, "../public");
const app = express();

(async () => {
  await connectToDB();
})();

// middlewares
app.use(express.json());
app.use(cors());
app.use(express.static(publicDirectoryPath));

module.exports = app;
