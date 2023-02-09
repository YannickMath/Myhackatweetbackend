var express = require("express");
var router = express.Router();
const User = require("../models/users");
require("../models/connection");

router.get("/", async (req, res) => {
const user = await User.find()
res.json({result: true, user})
});

router.post("/tweet/:token", async function (req, res) {
  const newTweet = req.body.tweet
const token = req.params.token

  try {
    const updatedUser = await User.findOneAndUpdate(
      { token },
     
      { $push: { tweet: {tweet: newTweet}} },
      { new: true }
    );
    res.json({ result: true, tweet: updatedUser });
  } catch (err) {
    res.json({ result: false, error: err });
  }
});

module.exports = router;
