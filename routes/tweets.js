var express = require('express');
var router = express.Router();
const Tweet = require("../models/tweets")

router.post('/tweet', async function (req, res) {
    const tweet = req.body.tweet
    const savedNewTweet = await tweet.save()
    res.json({result: true, tweet: savedNewTweet})
   
})