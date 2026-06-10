# Architecture: The Sovereign Hive (500-Account System)

## 1. System Overview
The **Sovereign Hive** is a centralized automation system designed to manage 500 Threads accounts with **Zero External AI Costs**. It leverages the interactive intelligence of the Gemini CLI (The Brain) to pre-populate a "Content Vault," which is then executed by a fleet of stateless workers.

---

## 2. Systematic Workflow (The Factory Line)

### Step 1: Account Onboarding & Meta Auth
*   **Onboarding Script:** A CLI tool to register a new account in the system.
*   **Token Management:** Secure storage of `THREADS_ACCESS_TOKEN` and `THREADS_USER_ID`.
*   **Proxy Binding:** Each account is assigned a permanent "Sticky IP" session from the residential proxy pool to maintain account health.

### Step 2: Persona Factory (Agent-Led)
*   **Generation:** I (The Brain) generate a unique identity profile for each account.
    *   **Fields:** Name, Niche, Tone (e.g., Mamak Chat, Deep Logic), Bio, Core Values, and Linguistic Style.
*   **Persistence:** Profiles are stored in the `accounts` table in the database.

### Step 3: Content Pre-Population (The Vault)
*   **Batch Request:** You request content for `N` accounts for `X` days.
*   **Creative Output:** I generate a structured JSON containing the threads, frameworks, and image/video prompts.
*   **Importer:** A script (`src/vault_importer.js`) takes my JSON and populates the `drafts` table.
*   **Media Handling:** For posts with images/videos, the system uses a local asset manager to map prompts to pre-generated or procedurally created media.

### Step 4: Execution (The Muscles)
*   **Central Scheduler:** A single PM2 process that checks the DB for "Ready to Publish" posts.
*   **Worker Pool:** 10-20 stateless PM2 processes (Workers).
*   **Flow:** Worker picks a job -> Fetches Proxy -> Fetches Token -> Calls Meta API (Container -> Publish) -> Logs Result.

---

## 3. Visual Architecture (Text-Based Diagram)

```text
[ THE BRAIN (Gemini CLI) ]
      |
      | (Outputs Mass JSON: Personas + Content)
      v
[ VAULT IMPORTER SCRIPT ]
      |
      +-----> [ PostgreSQL DATABASE ] <-----+
      |       (Accounts, Drafts, History)    |
      |                                      |
      v                                      |
[ CENTRAL SCHEDULER ]                        | (Updates Status)
      |                                      |
      | (Dispatches Jobs to Queue)           |
      v                                      |
[ REDIS / BULLMQ ] --------------------------+
      |
      +----[ Worker #1 ]----> [ Proxy ] ----> [ Meta Threads API ]
      +----[ Worker #2 ]----> [ Proxy ] ----> [ Meta Threads API ]
      +----[ Worker ... ]---> [ Proxy ] ----> [ Meta Threads API ]
      +----[ Worker #20 ]---> [ Proxy ] ----> [ Meta Threads API ]
```

---

## 4. PM2 Upgrade & Scalability
*   **From:** 20+ PM2 processes for 4 accounts.
*   **To:** 
    1.  `Hive-Controller` (1 process)
    2.  `Hive-Worker` (10-20 instances using `pm2 start -i max`)
    3.  `Hive-Stats` (1 process for Telegram reporting)
*   **Benefit:** Memory usage drops from ~100GB to **< 2GB** for the entire management layer.

---

## 5. Media Strategy (Image/Video)
Since we are using "The Brain" without a real-time Image API:
*   **Option A (Procedural):** Simple branding/text overlays generated via Node-Canvas.
*   **Option B (Local Generation):** Utilizing the **NVIDIA GDX Spark** GPU to run a local Stable Diffusion instance.
*   **Workflow:** Content prompt includes `image_prompt` -> Local SD Worker generates image -> Uploads to Meta API.

---

## 6. Revised Implementation Roadmap

| Phase | Task | Deliverable |
| :--- | :--- | :--- |
| **I** | **Database Setup** | PostgreSQL Schema with 500-account capacity. |
| **II** | **Persona Factory** | 500 Unique "Sovereign Identities" generated. |
| **III** | **Hive Controller** | Redis-based queue and scheduler. |
| **IV** | **Stateless Worker** | Refactored publisher that works with *any* account/proxy. |
| **V** | **Media Worker** | Local Image/Video generation integration (NVIDIA GPU). |
