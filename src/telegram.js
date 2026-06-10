const axios = require('axios');
require('dotenv').config();

/**
 * Sovereign Hive: Telegram Utility
 * Sends critical alerts and heartbeats to the operator.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramAlert(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('⚠️ Telegram credentials missing. Alert suppressed.');
        return;
    }

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
    } catch (error) {
        console.error('❌ Failed to send Telegram alert:', error.message);
    }
}

module.exports = { sendTelegramAlert };
