// import dotenv from "dotenv";
// dotenv.config();
// process.loadEnvFile();

import fs from "fs";
import axios from "axios";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log(OPENAI_API_KEY, "OPENAI_API_KEY");

import OpenAI from "openai";
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function generateCommentsSummary(comments) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
                role: "system",
                content: "You are receiving a list of comments from a YouTube video. You are to generate a summary in less than 200 words. Also specify the different viewpoints in the comments.",
            },
            {
                role: "user",
                content: comments.join("\n"), // ✅ combine into a single string
            },
        ],
    });

    console.log(response, "res");
    return response.choices[0].message.content;
}