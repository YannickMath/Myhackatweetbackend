const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  comment: String,
  username: String,
});
const likeSchema = mongoose.Schema({
  likeState: Boolean,
  likeCount: Number,
});

const dislikeSchema = mongoose.Schema({
  dislikeCount: Number,
  dislikeState: Boolean,
});

const tweetSchema = mongoose.Schema({
  tweet: String,
  comments: [commentSchema],
  like: likeSchema,
  dislike: dislikeSchema,
  createdAt: { type: Date, default: Date.now }
});

const userSchema = mongoose.Schema({
  
  firstname: String,
  username: String,
  password: String,
  token: String,
  photo: String, 
  tweet: [tweetSchema],
});

const User = mongoose.model("users", userSchema);
module.exports = User;
