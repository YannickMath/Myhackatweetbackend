var express = require("express");
var router = express.Router();
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const User = require("../models/users");
require("../models/connection");
const { checkBody } = require("../modules/checkBody");

router.post("/signup", async function (req, res) {
  if (!checkBody(req.body, ["firstname", "username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  const { firstname, username, password } = req.body;

  const data = await User.findOne({ username, firstname });
  if (data === null) {
    const hash = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname: firstname,
      username: username,
      password: hash,
      token: uid2(32),
    });
    const savedUser = await newUser.save();
    res.json({ results: true, user: savedUser });
  } else {
    res.json({
      results: false,
      error: "Please try with other firstname/username !",
    });
  }
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
if (isPasswordMatch) {
res.json({ results: true, user: data });
} else {
res.json({ results: false, error: "Account not valid" });
}
} else {
res.json({ results: false, error: "Account not valid" });
}
});

module.exports = router;
