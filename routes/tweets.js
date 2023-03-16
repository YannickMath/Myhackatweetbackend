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
    ]);

    res.json({ result: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, message: "Error fetching tweets" });
  }
});

router.get("/comments/:tweetId", async (req, res) => {
  try {
    const tweetId = mongoose.Types.ObjectId(req.params.tweetId);
    const tweet = await User.findOne({ "tweet._id": tweetId });
    if (!tweet) {
      res.json({ result: false, error: "No tweet found with the specified ID" });
      return;
    }
    const tweetsWithComments = await User.aggregate([
      // Filter for the tweet with the specified tweetId
      { $match: { "tweet._id": tweetId } },
      // Unwind the "tweet" array
      { $unwind: "$tweet" },
      // Unwind the "comments" array
      { $unwind: "$tweet.comments" },
      //$sort permet le tri , l'indice -1 indique par odre décroissant
      { $sort: { "tweet.comments.createdAt": -1 } },
      // Project the fields you want to retrieve
      {
        $project: {
          _id: "$tweet.comments._id",
          // tweet: "$tweet.tweet",
          comment: "$tweet.comments.comment",
          username: "$tweet.comments.username",
          createdAt: "$tweet.comments.createdAt",
          answers: "$tweet.comments.answers"
        }
      }
    ]);
    res.json({ result: true, tweetsWithComments });
  } catch (err) {
    console.log(err);
    res.json({ result: false, error: err.message });
  }
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

router.post("/tweetComment/:tweet_Id", async function (req, res) {
  const newComment = req.body.comment;
  const username = req.body.username;
  const tweet_Id = req.params.tweet_Id;

  try {
    const updatedUser = await User.findOneAndUpdate(
      {"tweet._id": tweet_Id},
      {
        $push: {
          "tweet.$.comments": {
            comment: newComment,
            username: username,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );
    if (updatedUser) {
      res.json({ result: true, updatedUser });
    }
  } catch (err) {
    res.json({ result: false, error: err });
  }
});

router.post("/commentAnswer/:commentId", async function (req, res) {
  const newAnswer = {
    username: req.body.username,
    answer: req.body.answer,
  };

  try {
    const updatedUser = await User.findOneAndUpdate(
      { "tweet.comments._id": req.params.commentId },
      {
        $push: {
          "tweet.$.comments.$[comment].answers": {
            $each: [newAnswer],
            $sort: { createdAt: -1 },
          },
        },
      },
      {
        arrayFilters: [{ "comment._id": req.params.commentId }],
        new: true,
      }
    );
    if (updatedUser) {
      res.json({ result: true, updatedUser });
    }
  } catch (err) {
    res.json({ result: false, error: err });
  }
});

router.get("/commentAnswers/:comment_id", async function(req, res) {
  const comment_id = req.params.comment_id;
  try {
    const user = await User.findOne({
      "tweet.comments._id": comment_id
    });
    if (user) {
      const tweet = user.tweet.find((t) => t.comments.some((c) => c._id == comment_id));
      const comment = tweet.comments.find((c) => c._id == comment_id);
      const answers = comment.answers;
      res.json({ result: true, answers });
    } else {
      res.json({ result: false, message: "No user found" });
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

  if (
    tweet.like.likedBy.includes(user.token) &&
    !tweet.dislike.dislikedBy.includes(user.token)
  ) {
    // Si l'utilisateur a déjà aimé le tweet, retirer le like
    tweet.like.likedBy = tweet.like.likedBy.filter(
      (token) => token !== user.token
    );
    tweet.like.likeCount--;
  } else if (!tweet.dislike.dislikedBy.includes(user.token)) {
    // Sinon, ajouter le like
    tweet.like.likedBy.push(user.token);
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

  if (
    tweet.dislike.dislikedBy.includes(user.token) &&
    !tweet.like.likedBy.includes(user.token)
  ) {
    tweet.dislike.dislikedBy = tweet.dislike.dislikedBy.filter(
      (u) => u !== user.token
    );
    tweet.dislike.dislikeCount--;
  } else if (!tweet.like.likedBy.includes(user.token)) {
    if (tweet.like.likedBy.includes(user.token)) {
      tweet.like.likedBy = tweet.like.likedBy.filter((u) => u !== user.token);
      tweet.like.likeCount--;
    }
    tweet.dislike.dislikedBy.push(user.token);
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
