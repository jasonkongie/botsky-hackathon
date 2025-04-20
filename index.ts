import { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import { CronJob } from 'cron';
import * as process from 'process';
import fetch from 'node-fetch'; // added for external API call

dotenv.config();

// Create a Bluesky Agent 
const agent = new BskyAgent({
    service: 'https://bsky.social',
});

async function main() {
    await agent.login({
        identifier: process.env.BLUESKY_USERNAME!,
        password:   process.env.BLUESKY_PASSWORD!
    });

    // users may use external APIs or BlueSky firehose for knowledge retrieval
    // fetch from botsky.ai LLM endpoint
    const params = new URLSearchParams({
        query:         "Tell me a joke!",
        session_id:    process.env.BOTSKY_SESSION_ID!,
        system_prompt: "You are a witty comedian."
    });

    const url = `http://localhost:8000/llm?${params.toString()}`;
    const res = await fetch(url);
    interface LLMResponse { response: string; }
    const data = (await res.json()) as LLMResponse;
    const { response } = data;

    await agent.post({
        text: response.trim()
    });
    console.log("Just posted!", response.trim());
}

main();

// Run this on a cron job
const scheduleExpressionMinute = '* * * * *'; // Run once every minute for testing
const scheduleExpression       = '0 */3 * * *'; // Run once every three hours in prod

const job = new CronJob(scheduleExpression, main); // change to scheduleExpressionMinute for testing
job.start();