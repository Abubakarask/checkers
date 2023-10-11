const express = require("express");
const multer = require("multer");
const { isAuthenticated } = require("../middlewares/auth");
const { getGame } = require("../controllers/game");
const {
  addUser,
  userLogin,
  userLogout,
  myProfile,
  updateUser,
  updateUserRecord,
  deleteMe,
} = require("../controllers/user");
const { deleteDp, getDp, uploadDp } = require("../controllers/userProfile");

const router = new express.Router();

// Access The Game page
router.get("/game", isAuthenticated, getGame);

// user-routes
router.post("/users/signup", addUser);
router.post("/users/login", userLogin);
router.post("/users/me/logout", isAuthenticated, userLogout);
router.get("/users/me", isAuthenticated, myProfile);
router.post("/users/me/update", isAuthenticated, updateUser);
router.post("/users/me/record", isAuthenticated, updateUserRecord);
router.delete("/users/me", isAuthenticated, deleteMe);

// Assign Multer for file storage from playload
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png)$/))
      return cb(new Error("Please upload an image."));
    cb(undefined, true);
  },
});

// User profile picture routes
router.post(
  "/users/me/profile_picture",
  isAuthenticated,
  upload.single("profile_picture"),
  uploadDp
);
router.delete("/users/me/profile_picture", isAuthenticated, deleteDp);
router.get("/users/me/profile_picture", isAuthenticated, getDp);

module.exports = router;
