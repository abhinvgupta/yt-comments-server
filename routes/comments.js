const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const { generateCommentsSummary } = require("../services/openai");
router.get("/", (req, res) => {
    // get video id from request
    let videoUrl = req.query.videoUrl;
    // parse url to get video id

    if (!videoUrl) {
        return res.status(400).json({ error: "Video ID is required" });
    }
    const videoId = videoUrl.split("v=")[1];
    console.log(videoId, "videoId");
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
                return {
                    text: item.snippet.topLevelComment.snippet.textDisplay,
                    likes: item.snippet.topLevelComment.snippet.likeCount,
                };
            });
            let nextPageToken = response.data.nextPageToken;

            while (comments.length < 10000) {
                console.log(comments.length);
                await axios({
                    method: "get",
                    url: "https://www.googleapis.com/youtube/v3/commentThreads",
                    params: {
                        part: "snippet",
                        videoId: videoId,
                        key: "AIzaSyDo-fa_R-wT47u92A1Sbr7bUTimUOe046k",
                        maxResults: 100,
                        pageToken: nextPageToken,
                    },
                }).then(function(response) {
                    console.log(response.data);
                    nextPageToken = response.data.nextPageToken;
                    const nextComments = response.data.items.map((item) => {
                        return {
                            text: item.snippet.topLevelComment.snippet.textDisplay,
                            likes: item.snippet.topLevelComment.snippet.likeCount,
                        };
                    });
                    comments = comments.concat(nextComments);
                });
            }
            console.log(comments.length);
            comments.sort((a, b) => b.likes - a.likes);
            // get top 100 comments
            const topComments = comments.slice(0, 100);
            const topCommentsText = topComments.map((comment) => comment.text);
            // send to ai
            const aiSummary = await generateCommentsSummary(topCommentsText);
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