async function getGame(req, res) {
  try {
    res.send({ status: 200, message: "Success" });
  } catch (err) {
    res.status(500).send({ status: 500, message: "Something went wrong." });
  }
}

module.exports = {
  getGame,
};
