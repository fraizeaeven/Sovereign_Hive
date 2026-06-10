const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

/**
 * Sovereign Hive: Threads API Utility
 * Optimized for stateless worker execution with proxy support.
 */

async function publishThread(data) {
    const { metaUserId, accessToken, proxyUrl, content, mediaUrls } = data;
    const publicBaseUrl = process.env.PUBLIC_URL || 'http://your-vps-ip:3000';
    
    // Configure Proxy if provided
    const axiosConfig = {};
    if (proxyUrl) {
        axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
        axiosConfig.proxy = false;
    }

    try {
        console.log(`[Worker] Creating container for ${data.username}...`);
        
        let containerId;

        if (mediaUrls && mediaUrls.length > 0) {
            // HANDLE MEDIA POST
            const mediaUrl = `${publicBaseUrl}/media/${mediaUrls[0]}`; // Get first media item
            const isVideo = mediaUrl.match(/\.(mp4|mov|avi)$/i);

            const containerParams = {
                media_type: isVideo ? 'VIDEO' : 'IMAGE',
                access_token: accessToken,
                text: content
            };

            if (isVideo) {
                containerParams.video_url = mediaUrl;
            } else {
                containerParams.image_url = mediaUrl;
            }

            const containerRes = await axios.post(
                `https://graph.threads.net/v1.0/${metaUserId}/threads`,
                null,
                { params: containerParams, ...axiosConfig }
            );
            containerId = containerRes.data.id;
        } else {
            // HANDLE TEXT-ONLY POST
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
            containerId = containerRes.data.id;
        }

        console.log(`[Worker] Container created: ${containerId}. Waiting 15s for processing...`);

        // Wait for Meta to process (Media takes longer than text)
        await new Promise(resolve => setTimeout(resolve, 15000));

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
