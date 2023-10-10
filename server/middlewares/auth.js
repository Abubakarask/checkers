const jwt = require("jsonwebtoken");
const User = require("../models/user");

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .send({ status: 401, message: "Please login first" });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    const user = await User.findOne({
      _id: decoded._id,
    });

    if (!user) throw new Error();
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res
      .status(401)
      .send({ status: 401, message: "User could not be authenticated." });
  }
};

module.exports = { isAuthenticated };
