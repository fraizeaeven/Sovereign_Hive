const { Client } = require('pg');
require('dotenv').config();

/**
 * Sovereign Hive: Status Report (The War Room)
 * Provides a snapshot of the 500-account fleet health.
 */

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function runReport() {
    try {
        await client.connect();
        console.log('🏛️  --- SOVEREIGN HIVE: WAR ROOM REPORT ---');

        // 1. Account Summary
        const accRes = await client.query(`
            SELECT status, COUNT(*) as count 
            FROM accounts 
            GROUP BY status;
        `);
        console.log('\n👤 Account Status:');
        accRes.rows.forEach(r => console.log(`   • ${r.status.toUpperCase()}: ${r.count}`));

        // 2. Content Vault Summary
        const vaultRes = await client.query(`
            SELECT status, COUNT(*) as count 
            FROM content_vault 
            GROUP BY status;
        `);
        console.log('\n📦 Content Vault:');
        vaultRes.rows.forEach(r => console.log(`   • ${r.status.toUpperCase()}: ${r.count}`));

        // 3. Last 24h Activity
        const logsRes = await client.query(`
            SELECT action, level, COUNT(*) as count 
            FROM system_logs 
            WHERE timestamp > NOW() - INTERVAL '24 hours'
            GROUP BY action, level;
        `);
        console.log('\n⚡ Last 24h System Activity:');
        logsRes.rows.forEach(r => console.log(`   [${r.level.toUpperCase()}] ${r.action}: ${r.count}`));

        // 4. Analytics Pulse
        const totalLikes = await client.query('SELECT SUM(likes) as total FROM analytics');
        const totalReplies = await client.query('SELECT SUM(replies) as total FROM analytics');
        console.log('\n📊 Engagement Pulse:');
        console.log(`   • Total Likes: ${totalLikes.rows[0].total || 0}`);
        console.log(`   • Total Replies: ${totalReplies.rows[0].total || 0}`);

        console.log('\n------------------------------------------');

    } catch (err) {
        console.error('❌ Report Error:', err.message);
    } finally {
        await client.end();
    }
}

runReport();
