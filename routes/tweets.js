const { response } = require("express");
const e = require("express");
var express = require("express");
// const { response } = require("../app");
var router = express.Router();
const User = require("../models/users");
require("../models/connection");
const mongoose = require("mongoose");


router.get("/", async (req, res) => {
  try {
    const user = await User.aggregate([
      // $unwind permet de déroulé l'ensemble de tous les tweets
      { $unwind: "$tweet" },
      //$sort permet le tri , l'indice -1 indique par odre décroissant
      { $sort: { "tweet.createdAt": -1 } },
      //$project permet de projeter seulement les champs tweet et createdAt et exclure le champ _id.
      //$replaceRoot permet 
    ]);

    res.json({ result: true, user });
    console.log ('USER', user)
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, message: "Error fetching tweets" });
  }
});





router.post("/tweet/:token", async function (req, res) {
  const newTweet = req.body.tweet;
  const token = req.params.token;
  // const createdAt = new Date();
  // const formattedDate = createdAt.toLocaleString('en-US', { timeZone: 'UTC' });

  try {
    const updatedUser = await User.findOneAndUpdate(
      { token },
      {
        $push: {
          tweet: {
            tweet: newTweet,
            like: { likeCount: 0, likeState: true },
            dislike: { dislikeCount: 0, dislikeState: true },
            createdAt: new Date(),
          },
        },
      },
      { new: true }
      );
      if (data) {
        res.json({ result: true, tweet: updatedUser });
      }
    } catch (err) {
      res.json({ result: false, error: err });
    }
});

router.put("/likeTweet/:userToken/:tweetId", async (req, res) => {
  const userToken = req.params.userToken;
  const tweetId = req.params.tweetId;

  const user = await User.findOne({ token: userToken });
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

router.put("/dislikeTweet/:userToken/:tweetId", async (req, res) => {
  const userToken = req.params.userToken;
  const tweetId = req.params.tweetId;

  const user = await User.findOne({ token: userToken });
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
    const updatedUser = await User.findOneAndUpdate(
      { token: userToken },
      { $pull: { tweet: { _id: tweetId } } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ result: false, error: "User not found" });
    }
    res.json({ result: true, tweet: updatedUser.tweet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, error: err.message });
  }
});

module.exports = router;
