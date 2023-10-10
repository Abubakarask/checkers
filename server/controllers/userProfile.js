const fs = require("fs");
// Using the sharp library for image processing
const sharp = require("sharp");

// use multer to get image and store it as buffer in DB
async function uploadDp(req, res) {
  try {
    const user = req.user;

    /*   
    save image in/as buffer in database
    Use sharp to process the uploaded image
    Resize the image to 250x250 pixels and convert to png
    */
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    user.profile_picture = buffer;
    await user.save();

    res.send({
      status: 200,
      user,
      message: "User uploaded a profile picture!",
    });
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
}

// Deleting a profile picture
async function deleteDp(req, res) {
  try {
    const user = req.user;

    // put/replace user's current dp with default photo
    user.profile_picture = fs.readFileSync("assets/images/default-dp.png");

    await user.save();

    res.status(200).send({
      status: 200,
      user,
      message: "User has successfully deleted his profile picture.",
    });
  } catch (err) {
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
}

// getting a profile picture
async function getDp(req, res) {
  try {
    res.set("Content-Type", "image/png");
    res.status(200).send(req.user.profile_picture);
  } catch (err) {
    res.staus(500).send({ status: 500, message: "Internal Server Error" });
  }
}

module.exports = {
  uploadDp,
  getDp,
  deleteDp,
};
