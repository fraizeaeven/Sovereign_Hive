const express = require('express');
const axios = require('axios');
const { Client } = require('pg');
require('dotenv').config();

/**
 * Sovereign Hive: Auth Portal
 * Streamlines the 500-account login process.
 * 
 * Flow:
 * 1. Open browser to http://localhost:4000/auth?username=account1
 * 2. Login & Allow
 * 3. Portal handles callback, exchanges token, and saves to DB.
 */

const app = express();
const PORT = 4000;
const pgClient = new Client({ connectionString: process.env.DATABASE_URL });

const APP_ID = process.env.THREADS_APP_ID;
const APP_SECRET = process.env.THREADS_APP_SECRET;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

app.get('/auth', (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).send('Missing username param.');

    // Step 1: Generate Authorization URL
    // State includes the username so we know which account we are onboarding in the callback
    const authUrl = `https://www.threads.net/oauth/authorize?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=threads_content_publish,threads_basic,threads_manage_replies,threads_manage_insights&response_type=code&state=${username}`;
    
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const { code, state: username, error } = req.query;

    if (error) return res.status(400).send(`Auth Error: ${error}`);
    if (!code) return res.status(400).send('No code received.');

    try {
        console.log(`🐝 Processing auth for: [${username}]...`);

        // Step 2: Exchange Code for Short-Lived Token
        const shortRes = await axios.post('https://graph.threads.net/oauth/access_token', null, {
            params: {
                client_id: APP_ID,
                client_secret: APP_SECRET,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
                code: code
            }
        });

        const shortToken = shortRes.data.access_token;
        const metaUserId = shortRes.data.user_id;

        // Step 3: Exchange Short-Lived for Long-Lived (60 Days)
        const longRes = await axios.get('https://graph.threads.net/access_token', {
            params: {
                grant_type: 'th_exchange_token',
                client_secret: APP_SECRET,
                access_token: shortToken
            }
        });

        const longToken = longRes.data.access_token;

        // Step 4: Save to Database
        await pgClient.query(`
            INSERT INTO accounts (username, meta_user_id, access_token, status)
            VALUES ($1, $2, $3, 'active')
            ON CONFLICT (username) DO UPDATE SET
                meta_user_id = EXCLUDED.meta_user_id,
                access_token = EXCLUDED.access_token,
                updated_at = CURRENT_TIMESTAMP;
        `, [username, metaUserId, longToken]);

        res.send(`
            <h1>✅ Onboarding Successful</h1>
            <p>Account <b>@${username}</b> has been added to the Sovereign Hive.</p>
            <p>Long-Lived Token (60 days) saved to Database.</p>
            <hr>
            <p>Next steps: Go back to terminal or onboard another account.</p>
        `);

        console.log(`✅ Success! [${username}] is now in the Hive.`);

    } catch (err) {
        console.error('❌ Portal Error:', err.response ? err.response.data : err.message);
        res.status(500).send(`Authentication Failed: ${err.message}`);
    }
});

async function startPortal() {
    await pgClient.connect();
    app.listen(PORT, () => {
        console.log(`🌐 Sovereign Auth Portal live at http://localhost:${PORT}`);
        console.log(`👉 Start onboarding by visiting: http://localhost:${PORT}/auth?username=YOUR_USERNAME`);
    });
}

startPortal();
