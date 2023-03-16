const mongoose = require("mongoose");

const answerSchema = mongoose.Schema({
username : String,
answer: String,
createdAt: {type: Date, default: Date.now }
})

const commentSchema = mongoose.Schema({
  comment: String,
  username: String,
  createdAt: { type: Date, default: Date.now },
  answers:[answerSchema]
});

const likeSchema = mongoose.Schema({
  likeState: Boolean,
  likeCount: Number,
  likedBy: [],
});

const dislikeSchema = mongoose.Schema({
  dislikeCount: Number,
  dislikeState: Boolean,
  dislikedBy: [],
});

const tweetSchema = mongoose.Schema({
  tweet: String,
  comments: [commentSchema],
  like: likeSchema,
  dislike: dislikeSchema,
  createdAt: { type: Date, default: Date.now },
});

const userSchema = mongoose.Schema({
  firstname: String,
  username: String,
  password: String,
  token: String,
  photo: {
    type: String,
    default:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTem4S8Q0RNfdE9VGHV8nH9HyJMuZ5tE1PIg&usqp=CAU",
  },
  tweet: [tweetSchema],
});

const User = mongoose.model("users", userSchema);
module.exports = User;
