const chalk = require("chalk");
const bcrypt = require("bcrypt");
const User = require("../models/user");

async function addUser(req, res) {
  try {
    const { email, username } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res
        .status(400)
        .send({ status: 400, message: "Email already Exits" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res
        .status(400)
        .send({ status: 400, message: "Username already Exits" });
    }

    const user = new User(req.body);
    const token = await user.generateAuthToken();
    await user.save();

    console.log(chalk.green("New user has signed up!"));
    res.status(201).send({
      status: 201,
      user,
      token,
      message: "User Registered Successfully",
    });
  } catch (err) {
    res.status(400).send({ status: 400, message: err.message });
  }
}

async function updateUser(req, res) {
  try {
    const user = req.user;
    const updates = Object.keys(req.body);

    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();
    res.send({
      status: 200,
      user,
      message: "User updated successfully",
    });
  } catch (err) {
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
}

// use win loss of a user
async function updateUserRecord(req, res) {
  try {
    const user = req.user;
    const update = Object.keys(req.body);

    user.rating[update] = req.body[update];
    await user.save();
    res.send({
      status: 200,
      rating: user.rating,
      message: "User record updated successfully",
    });
  } catch (err) {
    res.status(500).send({ status: 500, message: "Internal Server Error" });
  }
}

async function userLogin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error("Email Not Registered");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Unable to login");

    const token = await user.generateAuthToken();

    res.status(200).send({
      status: 200,
      user,
      token,
      message: "User Logged in successfully",
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
}

async function userLogout(req, res) {
  try {
    const user = req.user;
    const token = req.token;

    // set token to NA, as it required can't do it null
    user.token = "NA";
    await user.save();

    console.log(`${user.username} Logged Out`);

    res.status(200).send({
      status: 200,
      message: "User logged out.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: 500,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

async function myProfile(req, res) {
  try {
    const user = req.user;

    res.status(200).send({ status: 200, user });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: 500,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

async function deleteMe(req, res) {
  try {
    const user = req.user;
    await user.remove();

    console.log(chalk.red("A user has deleted his account!"));

    res.send({
      status: 200,
      message: "Your account has been deleted",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: 500,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

module.exports = {
  addUser,
  updateUser,
  userLogin,
  userLogout,
  myProfile,
  deleteMe,
  updateUserRecord,
};
