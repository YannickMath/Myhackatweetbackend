const mongoose = require("mongoose");

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
  comment: String,
  like: likeSchema,
  dislike: dislikeSchema,
  createdAt: { type: Date, default: Date.now }
});

const userSchema = mongoose.Schema({
  
  firstname: String,
  username: String,
  password: String,
  token: String,
  photo: {type: String, default:"https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166__340.jpg"},
  tweet: [tweetSchema],
});

const User = mongoose.model("users", userSchema);
module.exports = User;
