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
            like: { likeCount: 0, likeState: true },
            dislike: { dislikeCount: 0, dislikeState: true },
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

router.put("/likeTweet/:userId/:tweetId", async (req, res) => {
  const userId = req.params.userId;
  const tweetId = req.params.tweetId;

  const user = await User.findOne({ _id: userId });
  if (!user) return res.json({ result: false, message: "User not found" });

  const tweetIndex = user.tweet.findIndex((e) => e._id == tweetId);
  if (tweetIndex === -1)
    return res.json({ result: false, message: "Tweet not found" });

    const tweet = user.tweet[tweetIndex];

    if (!tweet.like.likeState) {
      tweet.like.likeState = true;
      tweet.like.likeCount = 1;
    } else {
      tweet.like.likeCount++;
    }

  await user.save();

  res.json({ result: true, data: user.tweet[tweetIndex] });
});

router.put("/dislikeTweet/:userId/:tweetId", async (req, res) => {
  const userId = req.params.userId;
  const tweetId = req.params.tweetId;

  const user = await User.findById(userId);
  if (!user) return res.json({ result: false, message: "User not found" });

  const tweetIndex = user.tweet.findIndex((e) => e._id == tweetId);
  if (tweetIndex === -1)
    return res.json({ result: false, message: "Tweet not found" });

    const tweet = user.tweet[tweetIndex];

    if (!tweet.dislike.dislikeState) {
      tweet.dislike.dislikeState = true;
      tweet.dislike.dislikeCount = 1;
    } else {
      tweet.dislike.dislikeCount++;
    }

  await user.save();

  res.json({ result: true, data: user.tweet[tweetIndex] });
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
