const { response } = require("express");
const e = require("express");
var express = require("express");
// const { response } = require("../app");
var router = express.Router();
const User = require("../models/users");
require("../models/connection");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const user = await User.find();
  res.json({ result: true, user });
  // console.log("USER", user);
});

router.post("/tweet/:token", async function (req, res) {
  const newTweet = req.body.tweet;
  const token = req.params.token;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { token },
      {
        $push: {
          tweet: {
            tweet: newTweet,
            like: [{ likeCount: 0, likeState: true }],
            dislike: [{ dislikeCount: 0, dislikeState: true }],
          },
        },
      },
      { new: true }
    );
    res.json({ result: true, tweet: updatedUser });
  } catch (err) {
    res.json({ result: false, error: err });
  }
});


router.get("/likeTweet/:userId/:tweetId", async (req, res) => {
  const userId = req.params.userId;
  const tweetId = req.params.tweetId;
console.log ('TWEETID', typeof tweetId)
  const data = await User.findOne({ _id: userId}, {
$set : { "tweet.$.like": {likeState: false}
  } });
  const returnTweet = data.tweet.map((e) => e._id )
  if (data) {
    res.json({ result: true, data: returnTweet.filter((e)=> e === e.tweet)});
  }

});

router.put("/deleteTweet/:token/:tweetId", async (req, res) => {
  const userToken = req.params.token;
  const tweetId = req.params.tweetId;
  try {
    const deletedTweet = await User.findOneAndUpdate(
      { token: userToken, tweetId },
      { $pull: { tweet: { tweet: tweetId } } },
      { new: true }
    );
    console.log("TWEETID", tweetId);
    res.json({ result: true, tweet: deletedTweet });
    // console.log('TWEET', tweet)
  } catch (err) {
    res.json({ result: false, error: err });
  }
});

module.exports = router;
