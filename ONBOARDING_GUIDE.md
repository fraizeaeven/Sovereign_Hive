# Meta Threads API Onboarding Guide (Scale: 500)

Managing API access for 500 accounts requires a systematic approach to bypass Meta's per-app tester limits.

## 1. Setup Meta Infrastructure
1.  **Meta Business Manager:** Ensure you have a verified Business Manager.
2.  **Meta Developer App:**
    *   Create a "Threads" app type.
    *   Note your `App ID` and `App Secret`.
    *   **Scaling Note:** One unreviewed app typically allows **50-100 Testers**. For 500 accounts, you will likely need **5-10 separate Developer Apps** unless you submit one app for official "App Review".

## 2. The Tester Invite Loop
For each Threads account:
1.  Go to **App Dashboard -> Roles -> Roles -> Add Testers**.
2.  Add the Threads username/ID of the account you want to onboard.
3.  **Acceptance:** The account MUST log into `developers.facebook.com` and accept the invitation.
4.  **Authorization:** Use the [Threads Token Generator](https://developers.facebook.com/docs/threads/getting-started) or a custom OAuth URL to get a **Short-Lived Token**.

## 3. Token Longevity (Crucial)
Short-lived tokens expire in **1-2 hours**. You must exchange them for **Long-Lived Tokens (60 days)** before adding them to the Sovereign Hive.

**Automation Tool:**
```bash
node src/auth_helper.js <short_lived_token> <app_id> <app_secret>
```

## 4. Final Onboarding
Once you have the **Long-Lived Token** and the **Meta User ID**, plug it into the Hive:

```bash
node src/onboard_account.js <username> <meta_user_id> <long_lived_token> <proxy_url>
```

---

## 💡 Pro-Tip for 500 Accounts:
If you are managing these accounts for a client, ask them to provide a spreadsheet with:
`Username | Meta User ID | Short-Lived Token`
You can then write a simple script to loop through the spreadsheet, call `auth_helper.js`, and onboard them all in seconds.
