const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

/**
 * Sovereign Hive: Threads API Utility
 * Optimized for stateless worker execution with proxy support.
 */

async function publishThread(data) {
    const { metaUserId, accessToken, proxyUrl, content, mediaUrls } = data;
    
    // Configure Proxy if provided
    const axiosConfig = {};
    if (proxyUrl) {
        axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
        axiosConfig.proxy = false; // Important: Tell axios to use the agent instead of internal proxy logic
    }

    try {
        console.log(`[Worker] Creating container for ${data.username}...`);
        
        // Step 1: Create Container
        const containerRes = await axios.post(
            `https://graph.threads.net/v1.0/${metaUserId}/threads`,
            null,
            {
                params: {
                    media_type: 'TEXT',
                    text: content,
                    access_token: accessToken
                },
                ...axiosConfig
            }
        );

        const containerId = containerRes.data.id;
        console.log(`[Worker] Container created: ${containerId}. Waiting 10s...`);

        // Wait for Meta to process (standard delay)
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Step 2: Publish
        const publishRes = await axios.post(
            `https://graph.threads.net/v1.0/${metaUserId}/threads_publish`,
            null,
            {
                params: {
                    creation_id: containerId,
                    access_token: accessToken
                },
                ...axiosConfig
            }
        );

        return publishRes.data.id;

    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        throw new Error(`Meta API Error: ${errorMsg}`);
    }
}

module.exports = { publishThread };
