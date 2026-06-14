# Phase 1: Architecture Design & Resource Mapping

## 1. Current Architecture Analysis (PM2 1-to-1 Model)

### Current Setup:
*   **Process Management:** PM2 manages ~4-5 accounts with ~3-4 processes each (Gen, Pub, Engage, Scheduler).
*   **Storage:** Single flat `database.json` file (~60KB for 4 accounts).
*   **Concurrency:** Sequential/Parallel execution triggered by PM2 cron restarts.
*   **Scalability:** Linear. 500 accounts would require ~1500-2000 PM2 processes.

### Bottlenecks for 500 Accounts:
1.  **Memory Overhead:** Each PM2 process (Node.js) consumes between **15MB (idle)** to **50MB (active)** RAM. For a 500-account cluster using the 1-to-1 model (~1500 processes), this would require **30GB - 75GB RAM** just for basic process overhead.
2.  **Storage Contention:** A 500-account database would grow significantly in size and complexity. Simultaneous writes to flat files would lead to data corruption or massive locking delays.
3.  **Rate Limiting:** Sequential execution from a single IP for 500 accounts triggers immediate security flags. 
4.  **CPU Spikes:** Uncoordinated execution of content generators across 500 instances would saturate CPU resources instantly.

---

## 2. Proposed Architecture: Queue-Based Worker Model

To utilize the **NVIDIA GDX Spark** hardware effectively, we must move from a process-per-account model to a **task-per-action** model.

### A. Core Components:
1.  **Central Controller (The Brain):**
    *   A single PM2 process that schedules tasks for all 500 accounts.
    *   Adds "Generation", "Publication", and "Engagement" jobs to a Redis Queue.
2.  **Task Queue (Redis + BullMQ):**
    *   Handles job persistence, retries, and prioritization.
    *   Ensures tasks are distributed evenly over time to avoid spikes.
3.  **Scalable Workers (The Muscles):**
    *   A pool of 10-20 worker processes.
    *   Each worker picks a job from the queue, executes it for *any* account, and moves to the next.
    *   GPU Integration: Workers use the NVIDIA GPU for local LLM inference (if applicable) or efficient batching of API calls.
4.  **Database (PostgreSQL / MongoDB):**
    *   Replaces `database.json`.
    *   Allows concurrent writes and efficient querying of account-specific history and analytics.

### B. Hardware Allocation Map (NVIDIA GDX Spark):
*   **GPU:** Dedicated to Content Generation (Local LLM or Batch Processing).
*   **CPU:** Distributed among Worker processes and Redis.
*   **RAM:** Optimized by running fewer, more efficient worker processes rather than thousands of PM2 instances.
*   **Network:** Dedicated bandwidth for Proxy management.

---

## 3. Concurrency Strategy: "The Pacing Engine"

With 500 accounts, we cannot have a "burst" strategy (everyone posts at 9 AM). We need a **Pacing Engine**:
*   **Offset Scheduling:** Spreading 500 posts over a 24-hour window (~20 posts per hour, or 1 every 3 minutes).
*   **Account Grouping:** Grouping accounts by "Niche" or "Priority" to manage proxy rotation and content reuse.

---

## 4. Next Steps for Phase 1:
*   [ ] Finalize Database Schema (SQL vs NoSQL).
*   [ ] Benchmark RAM/CPU usage of a single Worker process.
*   [ ] Define the "Worker" lifecycle (Start -> Fetch Proxy -> Perform Action -> Log -> Sleep).
