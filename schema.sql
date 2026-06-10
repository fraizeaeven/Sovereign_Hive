-- Sovereign Hive: PostgreSQL Schema Design (Scale: 500+ Accounts)
-- This schema centralizes all accounts, personas, content, and logs for stateless worker execution.

-- 1. ACCOUNTS TABLE
-- Stores credentials, auth tokens, and proxy bindings.
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    meta_user_id VARCHAR(100) UNIQUE,
    access_token TEXT,
    proxy_url TEXT, -- Sticky proxy assigned to this account
    status VARCHAR(20) DEFAULT 'active', -- active, restricted, banned
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PERSONAS TABLE
-- Stores the 'Voice' and 'Identity' of each account.
CREATE TABLE personas (
    account_id INTEGER PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
    niche VARCHAR(100),
    tone VARCHAR(50), -- Mamak Chat, Deep Logic, Contemplative, etc.
    bio TEXT,
    core_values TEXT[], -- Array of themes the persona cares about
    linguistic_quirks TEXT[], -- Specific words or patterns used by this persona
    avatar_url TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CONTENT_VAULT (Drafts & Scheduled)
-- The "Pre-populated" repository of content created by The Brain.
CREATE TABLE content_vault (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[], -- Array of local or cloud paths for images/videos
    framework VARCHAR(50), -- The Sovereign Framework used
    topic VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, publishing, published, failed
    scheduled_for TIMESTAMP,
    published_at TIMESTAMP,
    meta_post_id VARCHAR(100), -- ID returned by Meta API after publishing
    error_log TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ANALYTICS TABLE
-- Tracks performance across all 500 accounts.
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES content_vault(id) ON DELETE CASCADE,
    likes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    quotes INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. SYSTEM_LOGS
-- Centralized logging for the worker fleet.
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    worker_id VARCHAR(50),
    account_id INTEGER REFERENCES accounts(id),
    action VARCHAR(50), -- POST, ENGAGE, AUTH_REFRESH
    level VARCHAR(10) DEFAULT 'info', -- info, warn, error
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES for Performance
CREATE INDEX idx_vault_status_schedule ON content_vault(status, scheduled_for);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_analytics_post ON analytics(post_id);
