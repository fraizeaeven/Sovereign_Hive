const axios = require('axios');
require('dotenv').config();

/**
 * Sovereign Hive: Auth Helper
 * Tool to exchange a Short-Lived Token for a Long-Lived Token (60 days).
 * 
 * Usage: node src/auth_helper.js <short_lived_token> <app_id> <app_secret>
 */

const args = process.argv.slice(2);
if (args.length < 3) {
    console.error('❌ Usage: node src/auth_helper.js <short_lived_token> <app_id> <app_secret>');
    process.exit(1);
}

const [shortToken, appId, appSecret] = args;

async function exchangeToken() {
    try {
        console.log('📡 Exchanging short-lived token for long-lived (60-day) token...');
        
        const response = await axios.get('https://graph.threads.net/access_token', {
            params: {
                grant_type: 'th_exchange_token',
                client_secret: appSecret,
                access_token: shortToken
            }
        });

        const longToken = response.data.access_token;
        const expiresIn = response.data.expires_in;

        console.log('\n✅ Success! Long-Lived Token Generated:');
        console.log('------------------------------------------');
        console.log(longToken);
        console.log('------------------------------------------');
        console.log(`⏱️ Expires in: ${Math.floor(expiresIn / 86400)} days.`);
        console.log('\n👉 Use this token in the onboard_account.js script.');

    } catch (error) {
        console.error('❌ Exchange failed:', error.response ? error.response.data : error.message);
    }
}

exchangeToken();
