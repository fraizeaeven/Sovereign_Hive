const express = require('express');
const path = require('path');
require('dotenv').config();

/**
 * Sovereign Hive: Asset Server
 * Serves media files from the /media directory so Meta API can fetch them.
 * This is the 'Sovereign' way to handle media without external cloud storage.
 */

const app = express();
const PORT = process.env.ASSET_SERVER_PORT || 3000;
const MEDIA_DIR = path.join(__dirname, '../media');

// Ensure media directory exists
const fs = require('fs');
if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// Serve static files from the /media directory
app.use('/media', express.static(MEDIA_DIR));

app.get('/health', (req, res) => {
    res.send('✅ Sovereign Hive Asset Server is running.');
});

app.listen(PORT, () => {
    console.log(`🖼️ Asset Server live at: ${process.env.PUBLIC_URL || 'http://localhost'}:${PORT}/media`);
    console.log(`📁 Serving files from: ${MEDIA_DIR}`);
});
