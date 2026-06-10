const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

/**
 * Sovereign Hive: Persona Importer
 * This tool imports a batch of persona identities into the database.
 * Usage: node src/import_personas.js <batch_json_file>
 */

const filePath = process.argv[2];
if (!filePath) {
    console.error('❌ Usage: node src/import_personas.js <batch_json_file>');
    process.exit(1);
}

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function importPersonas() {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        await client.connect();
        console.log(`🧠 Importing ${data.length} personas into the Hive...`);

        for (const persona of data) {
            // Find the account ID by username (placeholder matching)
            const accountRes = await client.query('SELECT id FROM accounts WHERE username = $1', [persona.username_placeholder]);
            
            if (accountRes.rows.length === 0) {
                console.warn(`⚠️ Warning: Account [${persona.username_placeholder}] not found in database. Skipping.`);
                continue;
            }

            const accountId = accountRes.rows[0].id;

            const query = `
                INSERT INTO personas (account_id, niche, tone, bio, core_values, linguistic_quirks)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (account_id) DO UPDATE SET
                    niche = EXCLUDED.niche,
                    tone = EXCLUDED.tone,
                    bio = EXCLUDED.bio,
                    core_values = EXCLUDED.core_values,
                    linguistic_quirks = EXCLUDED.linguistic_quirks,
                    updated_at = CURRENT_TIMESTAMP;
            `;

            await client.query(query, [
                accountId,
                persona.niche,
                persona.tone,
                persona.bio,
                persona.core_values,
                persona.linguistic_quirks
            ]);

            console.log(`✅ Persona updated for [${persona.username_placeholder}]`);
        }

    } catch (err) {
        console.error('❌ Import failed:', err.message);
    } finally {
        await client.end();
    }
}

importPersonas();
