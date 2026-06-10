# 🐝 Sovereign Hive

> **High-Performance 500-Account Threads Automation Cluster**  
> Engineered for the NVIDIA GDX Spark | Zero External AI Costs | Stateless Worker Architecture

---

## 🏗 System Architecture

The Sovereign Hive moves away from traditional linear process management to a **centralized cluster model**. This allows the management of 500+ accounts on a single node with minimal RAM overhead.

*   **The Brain (Controller):** Scans PostgreSQL for scheduled content and dispatches jobs to Redis.
*   **The Muscles (Worker Pool):** Stateless, proxy-aware workers that execute Meta API calls.
*   **The Vault (Database):** PostgreSQL storage for accounts, personas, content, and analytics history.
*   **The Portal (Auth):** Streamlined OAuth onboarding with automatic 60-day token generation.

---

## 🚀 Quick Start

### 1. Environment Setup
```bash
chmod +x setup.sh
./setup.sh
```
Update your `.env` file with your **Meta App Credentials**, **Database URL**, and **Proxy/Telegram** details.

### 2. Database Initialization
```bash
psql -d your_db_name -f schema.sql
```

### 3. Onboard Personas
```bash
node src/import_personas.js data/persona_batch_1.json
```

### 4. Authenticate Accounts
Start the Auth Portal:
```bash
node src/auth_portal.js
```
Visit `http://localhost:4000/auth?username=your_account` in your browser to link your accounts.

---

## 🛠 Management Commands

| Action | Command |
| :--- | :--- |
| **Launch Cluster** | `pm2 start ecosystem.config.js` |
| **View War Room** | `node src/status_report.js` |
| **Import Content** | `node src/vault_importer.js content.json` |
| **Refresh Tokens** | `node src/token_refresher.js` |

---

## 🎭 Persona Factory

The Hive comes pre-loaded with **50 unique persona identities** in `data/persona_batch_1.json`. Each identity is fully profiled with:
*   **Niche & Tone** (Mamak Chat, Deep Logic, etc.)
*   **Life Situation** (Marital status, Financial struggle, Personal mood)
*   **Linguistic Quirks** for authentic, non-AI-sounding content.

---

## 🖼 Media Strategy
The system handles images and videos locally via the **Asset Server**.
1. Place files in `/media`.
2. Reference filenames in your content JSON.
3. The Hive handles the Meta container/publish loop automatically.

---

## 📜 Development Milestone: Phase 1
*   [x] Scalable PostgreSQL Schema
*   [x] Stateless Worker Cluster (Redis/BullMQ)
*   [x] Streamlined Auth Portal (OAuth -> Long-Lived Token)
*   [x] Production Hardening (Auto-Refresh, Telegram Heartbeat)
*   [x] Zero-Cost Content Strategy (Agent-Led)

**Owner:** fraizeaeven  
**Status:** Production-Ready
