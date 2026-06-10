# Meta Threads API Onboarding Guide (Scale: 500)

Managing API access for 500 accounts requires a systematic approach to bypass Meta's per-app tester limits.

## 1. Setup Meta Infrastructure
1.  **Meta Business Manager:** Ensure you have a verified Business Manager.
2.  **Meta Developer App:**
    *   Create a "Threads" app type.
    *   Note your `App ID` and `App Secret`.
    *   **Scaling Note:** One unreviewed app typically allows **50-100 Testers**. For 500 accounts, you will likely need **5-10 separate Developer Apps** unless you submit one app for official "App Review".

## 2. Streamlined Onboarding (The Auth Portal)
Since each of the 500 accounts requires a manual login to grant permission, we use the **Sovereign Auth Portal** to make this as fast as possible.

**Step 1: Start the Portal**
```bash
node src/auth_portal.js
```

**Step 2: Authenticate Accounts**
For each account, visit this URL in your browser:
`http://localhost:4000/auth?username=ACCOUNT_USERNAME`

1.  Log in to the Threads account.
2.  Click **"Allow"**.
3.  The Portal will automatically:
    *   Exchange the code for a short-lived token.
    *   Exchange the short-lived token for a **60-day Long-Lived Token**.
    *   Save the account and token directly into the **PostgreSQL Database**.

**This turns a 500-step manual process into a simple "Click & Login" marathon.**

---

## 3. Bulk Verification
Once you have authenticated your accounts via the portal, you can verify their status in the Hive:

```bash
node src/status_report.js
```

---

## 💡 Pro-Tip for 500 Accounts:
If you are managing these accounts for a client, ask them to provide a spreadsheet with:
`Username | Meta User ID | Short-Lived Token`
You can then write a simple script to loop through the spreadsheet, call `auth_helper.js`, and onboard them all in seconds.
