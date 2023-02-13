const mongoose = require("mongoose");

const likeSchema = mongoose.Schema({
  likeState: Boolean,
  likeCount: Number,
})

const dislikeSchema = mongoose.Schema({
  dislikeCount: Number,
  dislikeState: Boolean,
})

const tweetSchema = mongoose.Schema({
  tweet: String,
  like: [likeSchema],
  dislike: [dislikeSchema]
 })

const userSchema = mongoose.Schema({
  firstname: String,
  username: String,
  password: String,
  token: String,
  tweet: [tweetSchema]
});





const User = mongoose.model("users", userSchema);
module.exports = User;
