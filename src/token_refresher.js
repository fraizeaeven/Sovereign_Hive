const { Client } = require('pg');
const axios = require('axios');
require('dotenv').config();

/**
 * Sovereign Hive: Token Refresher
 * Refreshes long-lived Meta tokens before they expire (usually every 60 days).
 */

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function refreshTokens() {
    try {
        await client.connect();
        console.log('🔄 Token Refresher: Checking for expiring tokens...');

        // Find tokens updated more than 45 days ago
        const query = `
            SELECT id, username, access_token 
            FROM accounts 
            WHERE updated_at < NOW() - INTERVAL '45 days'
            AND status = 'active';
        `;

        const res = await client.query(query);

        if (res.rows.length === 0) {
            console.log('✅ All tokens are fresh.');
            return;
        }

        console.log(`📡 Found ${res.rows.length} tokens to refresh.`);

        for (const account of res.rows) {
            try {
                console.log(`[${account.username}] Refreshing token...`);
                
                const response = await axios.get('https://graph.threads.net/refresh_access_token', {
                    params: {
                        grant_type: 'th_refresh_token',
                        access_token: account.access_token
                    }
                });

                const newToken = response.data.access_token;

                if (newToken) {
                    await client.query(
                        'UPDATE accounts SET access_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                        [newToken, account.id]
                    );
                    console.log(`✅ [${account.username}] Token refreshed successfully.`);
                }
            } catch (err) {
                console.error(`❌ [${account.username}] Refresh failed:`, err.response ? err.response.data : err.message);
            }
        }

    } catch (err) {
        console.error('❌ Token Refresher Error:', err.message);
    } finally {
        await client.end();
    }
}

refreshTokens();
