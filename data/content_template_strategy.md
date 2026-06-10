# Phase 2: Content Strategy - The Template Engine

## 1. Overview
The **Sovereign Hive Content Engine** will use a Hybrid Template model to fulfill client requests. This ensures that every piece of content remains "Persona-First" while allowing for scalable production across 500 accounts.

---

## 2. Template Architecture (The Hybrid Model)

Every template will be a combination of a **Framework** and a **Persona Context**.

### A. Core Frameworks
1.  **Sovereign Logic (Authority-Based):** 2-Sentence Hook -> Deep Logic Bridge -> Value Drop.
2.  **Mamak Chat (Relatability-Based):** Casual Hook -> Personal Struggle -> Practical Tip.
3.  **Commercial / Sales (Conversion-Based):** Problem Awareness -> Solution Reveal -> Call to Action (CTA).

### B. The Mix (Randomization Logic)
The system will maintain a "Random but Rooted" posting schedule for each persona:
*   **Standard Rotation:** 7-10 Single Posts (Randomly mixed between Sovereign and Mamak frameworks).
*   **The Anchor:** Every 8th to 11th post will be a **Thread Series** (3-5 parts) for deep authority building.

---

## 3. Dynamic Variable Mapping (Client Input)
While variables will be decided later, the system is architected to accept a JSON payload for each "Content Pack" request:
```json
{
  "client_request_id": "REQ_001",
  "global_context": {
    "topic": "Example: Digital Privacy",
    "cta_link": "https://example.com"
  },
  "persona_override": {
    "mention_struggle": true,
    "apply_linguistic_quirks": true
  }
}
```

---

## 4. Implementation Steps:
1.  **Drafting the 'Master Frameworks':** I (The Brain) will draft 5 generic "Master Framework" JSONs for each major Niche/Tone hybrid.
2.  **The 'Persona Filter':** Creating the logic that takes a Master Framework and "Re-Voices" it based on the `personas` table (Gender, Life Situation, Linguistic Quirks).
3.  **Vault Integration:** Updating the `vault_importer.js` to handle these dynamic templates.
