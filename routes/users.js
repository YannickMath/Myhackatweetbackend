var express = require("express");
var router = express.Router();
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const User = require("../models/users");
require("../models/connection");
const { checkBody } = require("../modules/checkBody");

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
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  const { username, password } = req.body;
  const data = await User.findOne({ username });
  if (data) {
    const isPasswordMatch = await bcrypt.compare(password, data.password);
    if (!isPasswordMatch) {
      res.json({ result: true, user: data.username });
    } else {
      res.json({ result: false, error: "Account not valid" });
    }
  }
});

module.exports = router;
