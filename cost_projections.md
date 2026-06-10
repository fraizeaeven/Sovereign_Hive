# Phase 2 & 3: Vendor Research & Cost Projections

## 1. Proxy Vendor Research (Anti-Bot Strategy)

For 500 accounts, IP reputation is the #1 risk factor. We categorize providers into three tiers:

| Tier | Provider | Price/GB | Recommendation |
| :--- | :--- | :--- | :--- |
| **Budget** | **Evomi** | $0.49 | Best for high-volume scraping and non-critical accounts. |
| **Mid-Value** | **Smartproxy** | $4.00 | **Highly Recommended.** Balance of massive IP pool (115M) and reliability. |
| **Premium** | **Bright Data** | $8.40+ | Best for "Sovereign" high-value accounts that need zero-fail reputation. |

### Proxy Usage Estimate (Monthly):
*   **Action:** 1 Post + 5 Likes/Replies per account per day.
*   **Data per action:** ~50KB (API based) to 1MB (Browser based).
*   **Total Data:** 500 accounts * 30 days * 0.5MB (avg) = **~7.5 GB / month.**
*   **Estimated Cost:** $4.00 * 7.5 = **~$30.00 / month** (using Mid-Value Tier).

---

## 2. AI Content Generation Research (LLM Strategy)

Scaling to 500 accounts requires moving from Real-Time API to **Batch API** to save 50% on costs and bypass rate limits.

| Model | Input (1M) | Output (1M) | Monthly Cost (500 Accounts) |
| :--- | :--- | :--- | :--- |
| **Gemini 1.5 Flash (Batch)** | $0.0375 | $0.15 | **~$1.68** |
| **Gemini 1.5 Pro (Batch)** | $0.625 | $2.50 | **~$28.13** |

### Optimization Strategies:
1.  **Context Caching:** Store common "Brand Voice" and "Frameworks" in Google's Context Cache to reduce input tokens by 90% for repeated calls.
2.  **Content Spin/Reuse:** Generate 50 "base" high-authority threads and use a cheap worker to "re-voice" them for 10 accounts each (50 * 10 = 500).

---

## 3. Total Monthly Operational Cost (Estimated)

| Category | Item | Low-Cost Tier | Mid-Premium Tier |
| :--- | :--- | :--- | :--- |
| **Network** | Residential Proxies (7.5GB) | $3.68 (Evomi) | $30.00 (Smartproxy) |
| **AI API** | Gemini 1.5 Flash (Batch) | $1.68 | $1.68 |
| **AI API** | Gemini 1.5 Pro (Strategy) | $0.00 | $10.00 (Occasional use) |
| **Database** | Managed MongoDB/Postgres | $0.00 (Self-hosted) | $15.00 (DigitalOcean) |
| **TOTAL** | | **~$5.36** | **~$56.68** |

### Hardware Note:
The **NVIDIA GDX Spark** is a "Sunk Cost" (already owned). It provides the compute power to run the Queue Workers and local LLMs (if desired for privacy) without monthly subscription fees.

---

## 4. Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Mass Account Ban** | Critical | Strict IP-per-account stickiness. Use mobile proxies for high-value accounts. |
| **API Rate Limits** | High | Use Gemini Batch API (24h turnaround) + local workers for real-time tasks. |
| **Database Corruption** | High | Move from `database.json` to PostgreSQL with daily automated backups. |
| **Hardware Failure** | High | PM2 automatic restarts + simple heartbeat monitor to Telegram. |
