# Administrator Solution Walkthrough: Lab 5 - Broken API

## 1. Challenge Details
- **Name**: Broken API
- **Difficulty**: Hard
- **Points**: 300
- **Category**: Web Security / API
- **Tags**: `api,idor,authorization`
- **Flag**: `nerdCTF{broken_api_IDOR_auth_bypass_99}`
- **Estimated Time**: 25 Minutes

---

## 2. Learning Objectives
- Identify Insecure Direct Object References (IDOR) / Broken Object Level Authorization (BOLA).
- Understand why API requests must perform proper authentication and object-level permissions checking.
- Learn how to inspect API communication using browser Network tab.

---

## 3. Setup & Target Environment
- Spuns up as an Express API viewer on Port `8005`.
- Exposes endpoint `/api/profile?id=<id>` which dumps the full user DB record without authorization validations.
- Standard query user is `id=2` (guest developer). Admin user is `id=1`.

---

## 4. Expected Solution
1. Launch target `http://localhost:8005`.
2. Notice the UI shows profile details of the guest developer user.
3. Open Browser Developer Tools (F12) and select the **Network** tab.
4. Select the profile explore button or reload the page to record network logs.
5. Identify the request to: `/api/profile?id=2`.
6. Realize the parameter `id=2` represents user accounts, and that this parameter can be manipulated.
7. Change the value in the UI input box from `2` to `1` and select **Load Profile** (or directly query the API in browser or command line):
   ```bash
   curl http://localhost:8005/api/profile?id=1
   ```
8. The server queries the mocked database, retrieves user record `1` (which represents the superadmin user), and returns:
   ```json
   {
       "id": 1,
       "username": "superadmin",
       "role": "Administrator",
       "email": "admin@nexus.io",
       "bio": "System Architect & Platform Founder. Keep all API keys secured.",
       "secret_flag": "nerdCTF{broken_api_IDOR_auth_bypass_99}",
       "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
   }
   ```
9. Capture the flag from the `secret_flag` attribute.

---

## 5. Common Mistakes
- **Assuming verification checks exists**: Thinking that because user 2 is logged in/viewing, they cannot request other IDs. An IDOR vulnerability occurs precisely because the API developer forgot to check if the current session possesses authorization to retrieve details for the requested user object.

---

## 6. Code Explanation
The vulnerability exists on line 23 of `server.js`:
```javascript
app.get('/api/profile', (req, res) => {
    const id = req.query.id;
    const user = usersDb[id];
    res.json(user); // Vulnerable: Returns administrative record without session matching
});
```
To mitigate IDOR/BOLA:
1. Verify user authentication (check access session tokens).
2. Validate that the authenticated user owns the requested record, or belongs to a role with permission to view general records.
3. Filter output attributes (do not return private properties like `secret_flag` unless requested by authorized channels).
4. Use random non-sequential identifiers (like UUIDs) instead of sequential integers (`1`, `2`) to make scraping/probing harder.
