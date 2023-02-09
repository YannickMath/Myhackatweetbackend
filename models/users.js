const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
  tweet: String,
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
