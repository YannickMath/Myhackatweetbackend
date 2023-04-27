var express = require("express");
var router = express.Router();
const User = require("../models/users");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
// require("../models/connection");
// const checkBody = require("../modules/checkBody")
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// configuration de cloudinary avec vos identifiants d'API
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ dest: '/tmp/' });

const fs = require("fs");

router.post("/photo/:token", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier sélectionné" });
    }

    const result = await cloudinary.uploader.upload(req.file.path);
    const user = await User.findOneAndUpdate(
      { token: req.params.token },
      { photo: result.secure_url },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Supprimer le fichier du disque
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
      }
    });

    res.json({ result: true, user });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
});

router.get("/photoUser/:token", async (req, res) => {
  const token = req.params.token;
  const user = await User.findOne({ token });
  if (user) {
    res.json({ result: true, profilePicture: user.photo });
  } else {
    res.json({ result: false, error: "User has no profile picture" });
  }
});

router.post("/signup", async (req, res) => {
  // if (!checkBody(req.body, ["firstname", "username", "password"])) {
  //   return res.json({ result: false, error: "Missing or empty fields" });
  // }

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
  // if (!checkBody(req.body, ["username", "password"])) {
  //   return res
  //     .status(400)
  //     .json({ result: false, error: "Missing or empty fields" });
  // }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log(res.json);
      return res.status(401).json({ result: false, error: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ result: false, error: "Incorrect password" });
    }

    return res.json({ result: true, user });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ result: false, error: "Internal server error" });
  }
});

module.exports = router;
