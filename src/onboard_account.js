const { Client } = require('pg');
require('dotenv').config();

/**
 * Sovereign Hive: Account Onboarding Script
 * This tool registers a new Threads account into the PostgreSQL database.
 * Usage: node onboard_account.js <username> <meta_user_id> <access_token> <proxy_url>
 */

const args = process.argv.slice(2);
if (args.length < 4) {
    console.error('❌ Usage: node onboard_account.js <username> <meta_user_id> <access_token> <proxy_url>');
    process.exit(1);
}

const [username, meta_user_id, access_token, proxy_url] = args;

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function onboardAccount() {
    try {
        await client.connect();
        console.log(`🐝 Onboarding account: [${username}]...`);

        const query = `
            INSERT INTO accounts (username, meta_user_id, access_token, proxy_url)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) DO UPDATE SET
                meta_user_id = EXCLUDED.meta_user_id,
                access_token = EXCLUDED.access_token,
                proxy_url = EXCLUDED.proxy_url,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id;
        `;

        const res = await client.query(query, [username, meta_user_id, access_token, proxy_url]);
        const accountId = res.rows[0].id;

        console.log(`✅ Success! Account [${username}] registered with ID: ${accountId}`);
        
        // Initialize an empty persona record for this account
        const personaQuery = `
            INSERT INTO personas (account_id)
            VALUES ($1)
            ON CONFLICT (account_id) DO NOTHING;
        `;
        await client.query(personaQuery, [accountId]);
        console.log(`👤 Persona slot initialized for [${username}].`);

    } catch (err) {
        console.error('❌ Onboarding failed:', err.message);
    } finally {
        await client.end();
    }
}

onboardAccount();
