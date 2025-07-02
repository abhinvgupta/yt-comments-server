const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const { generateCommentsSummary } = require("../services/openai");
router.get("/", (req, res) => {
    console.log("Hello World");
    console.log(req.body, "body");
    // get video id from request
    const videoId = req.query.videoId;
    if (!videoId) {
        return res.status(400).json({ error: "Video ID is required" });
    }
    return axios({
            method: "get",
            url: "https://www.googleapis.com/youtube/v3/commentThreads",
            params: {
                part: "snippet",
                videoId: videoId,
                key: "AIzaSyDo-fa_R-wT47u92A1Sbr7bUTimUOe046k",
                maxResults: 100,
            },
        })
        .then(async function(response) {
            console.log("response");
            console.log(response.data);

            let comments = response.data.items.map((item) => {
                return item.snippet.topLevelComment.snippet.textDisplay;
            });
            let nextPageToken = response.data.nextPageToken;

            while (comments.length < 1000) {
                console.log(comments.length);
                await axios({
                    method: "get",
                    url: "https://www.googleapis.com/youtube/v3/commentThreads",
                    params: {
                        part: "snippet",
                        videoId: "gnEomCyqrjQ",
                        key: "AIzaSyDo-fa_R-wT47u92A1Sbr7bUTimUOe046k",
                        maxResults: 10000,
                        pageToken: nextPageToken,
                    },
                }).then(function(response) {
                    console.log(response.data);
                    nextPageToken = response.data.nextPageToken;
                    const nextComments = response.data.items.map((item) => {
                        return item.snippet.topLevelComment.snippet.textDisplay;
                    });
                    comments = comments.concat(nextComments);
                });
            }
            console.log(comments.length);
            // send to ai
            const aiSummary = await generateCommentsSummary(comments);
            console.log(aiSummary, "ai summary");
            res.json({
                aiSummary: aiSummary,
                length: comments.length,
            });
        })
        .catch(function(error) {
            console.log(error);
        });
    res.send("Hello World");
});

module.exports = router;