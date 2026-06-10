const { Queue, Worker, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');
require('dotenv').config();

// Redis Connection Details
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});

// Name of our task queue
const HIVE_QUEUE_NAME = 'sovereign_hive_tasks';

// Initialize the Queue
const hiveQueue = new Queue(HIVE_QUEUE_NAME, { connection });

console.log('🐝 Hive Queue Manager Initialized.');

module.exports = {
    hiveQueue,
    connection,
    HIVE_QUEUE_NAME
};
