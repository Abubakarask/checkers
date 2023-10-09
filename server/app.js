const path = require("path");
const express = require("express");
const cors = require("cors");
require("./database/mongoose");

const publicDirectoryPath = path.join(__dirname, "../public");
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(publicDirectoryPath));

module.exports = app;
