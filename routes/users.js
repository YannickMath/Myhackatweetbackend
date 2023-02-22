var express = require("express");
var router = express.Router();
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const User = require("../models/users");
require("../models/connection");
const { checkBody } = require("../modules/checkBody");
const { urlencoded } = require("express");

router.post("/signup", async (req, res) => {
  if (!checkBody(req.body, ["firstname", "username", "password"])) {
    return res.json({ result: false, error: "Missing or empty fields" });
  }

  const { firstname, username, password } = req.body;
  const existingUser = await User.findOne({ username, firstname });

  if (existingUser) {
    return res.json({
      result: false,
      error: "User with that username and/or firstname already exists!",
    });
  }

  const hash = await bcrypt.hash(password, 10);
  const newUser = new User({
    firstname,
    username,
    password: hash,
    token: uid2(32),
    
  });

  const savedUser = await newUser.save();
  res.json({ result: true, user: savedUser });
});



router.post("/signin", async function (req, res) {
  if (!checkBody(req.body, ["username", "password"])) {
    return res.status(400).json({ result: false, error: "Missing or empty fields" });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log(res.json)
      return res.status(401).json({ result: false, error: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ result: false, error: "Incorrect password" });
    }

    return res.json({ result: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, error: "Internal server error" });
  }
});

router.post("/photo/:token", async function (req, res) {
  const token = req.params.token
  try {
    const user = await User.findOneAndUpdate(
      { token},
      { 
        $push: {
          photo: {
            photo: imageUrl
          },
        },
      },
      { new: true });
      if (data) {
        res.json({ result: true, tweet: updatedUser });
        console.log("DATARESULT", tweet.updatedUser)
        console.log("RESULT", result)
      }
    } catch (err) {
      res.json({ result: false, error: err });
    }
});


module.exports = router;
