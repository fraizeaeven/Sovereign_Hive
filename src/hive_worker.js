const { Worker } = require('bullmq');
const { Client } = require('pg');
const { connection, HIVE_QUEUE_NAME } = require('./queue_manager');
const { publishThread } = require('./threads_api_util');
require('dotenv').config();

/**
 * Sovereign Hive: Worker (The Muscles)
 * Listens to the Redis queue and executes publishing/engagement tasks.
 */

const pgClient = new Client({
    connectionString: process.env.DATABASE_URL
});

async function startWorker() {
    await pgClient.connect();
    console.log('🦾 Hive Worker Started. Waiting for jobs...');

    const worker = new Worker(HIVE_QUEUE_NAME, async (job) => {
        const { type, vaultId, accountId, username } = job.data;
        
        console.log(`[Job ${job.id}] Processing ${type} for ${username}...`);

        try {
            if (type === 'PUBLISH_THREAD') {
                // Execute Publishing
                const metaPostId = await publishThread(job.data);

                // Update Database on Success
                await pgClient.query(
                    'UPDATE content_vault SET status = $1, published_at = CURRENT_TIMESTAMP, meta_post_id = $2 WHERE id = $3',
                    ['published', metaPostId, vaultId]
                );

                // Initialize Analytics record
                await pgClient.query(
                    'INSERT INTO analytics (post_id) VALUES ($1) ON CONFLICT DO NOTHING',
                    [vaultId]
                );

                console.log(`✅ [Job ${job.id}] Successfully published post for ${username}. Meta ID: ${metaPostId}`);
                
                // Log to system_logs
                await pgClient.query(
                    'INSERT INTO system_logs (worker_id, account_id, action, message) VALUES ($1, $2, $3, $4)',
                    [process.env.HOSTNAME || 'local-worker', accountId, 'PUBLISH', `Successfully published post ${vaultId}`]
                );
            }

        } catch (error) {
            console.error(`❌ [Job ${job.id}] Failed: ${error.message}`);

            // Update Database on Failure
            await pgClient.query(
                'UPDATE content_vault SET status = $1, error_log = $2 WHERE id = $3',
                ['failed', error.message, vaultId]
            );

            // Log Error
            await pgClient.query(
                'INSERT INTO system_logs (worker_id, account_id, action, level, message) VALUES ($1, $2, $3, $4, $5)',
                [process.env.HOSTNAME || 'local-worker', accountId, 'PUBLISH_ERROR', 'error', error.message]
            );

            throw error; // Re-throw to allow BullMQ to handle retries
        }
    }, {
        connection,
        concurrency: 5 // Process up to 5 jobs simultaneously per worker process
    });

    worker.on('failed', (job, err) => {
        console.error(`[Job ${job.id}] Job failed after retries: ${err.message}`);
    });
}

startWorker();
