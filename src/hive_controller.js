const { Client } = require('pg');
const { hiveQueue } = require('./queue_manager');
require('dotenv').config();

/**
 * Sovereign Hive: Controller (The Brain)
 * This process scans the database for scheduled content and dispatches jobs to Redis.
 */

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function scanAndDispatch() {
    try {
        console.log('📡 Hive Controller: Scanning for scheduled posts...');
        
        // Fetch posts that are 'scheduled' and due now
        const query = `
            SELECT v.id, v.account_id, v.content, v.media_urls, v.framework, v.topic, 
                   a.username, a.meta_user_id, a.access_token, a.proxy_url
            FROM content_vault v
            JOIN accounts a ON v.account_id = a.id
            WHERE v.status = 'scheduled' 
            AND v.scheduled_for <= CURRENT_TIMESTAMP
            LIMIT 50; -- Batch size per scan
        `;

        const res = await client.query(query);

        if (res.rows.length === 0) {
            console.log('😴 No posts due for publishing.');
            return;
        }

        console.log(`🚀 Found ${res.rows.length} posts to dispatch.`);

        for (const post of res.rows) {
            // Update status to 'publishing' to prevent double-dispatch
            await client.query('UPDATE content_vault SET status = $1 WHERE id = $2', ['publishing', post.id]);

            // Add to Redis Queue
            await hiveQueue.add(`post_${post.username}_${post.id}`, {
                type: 'PUBLISH_THREAD',
                vaultId: post.id,
                accountId: post.account_id,
                username: post.username,
                metaUserId: post.meta_user_id,
                accessToken: post.access_token,
                proxyUrl: post.proxy_url,
                content: post.content,
                mediaUrls: post.media_urls,
                framework: post.framework
            }, {
                attempts: 3, // Retry up to 3 times on failure
                backoff: {
                    type: 'exponential',
                    delay: 5000 // Start with 5s delay
                }
            });

            console.log(`📦 Dispatched post [${post.id}] for [${post.username}] to Hive Queue.`);
        }

    } catch (err) {
        console.error('❌ Controller Error:', err.message);
    }
}

async function startController() {
    console.log('🧠 Sovereign Hive Controller Started.');
    await client.connect();

    // Run every 60 seconds
    setInterval(scanAndDispatch, 60000);
    
    // Run immediately on start
    scanAndDispatch();
}

startController();
