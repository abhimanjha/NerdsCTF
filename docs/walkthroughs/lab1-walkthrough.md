# Administrator Solution Walkthrough: Lab 1 - Cookie Monster

## 1. Challenge Details
- **Name**: Cookie Monster
- **Difficulty**: Easy
- **Points**: 100
- **Category**: Web Exploitation
- **Tags**: `cookies,web,basics`
- **Flag**: `nerdCTF{c00k13_m0nst3r_m4n1pul4t10n}`
- **Estimated Time**: 10 Minutes

---

## 2. Learning Objectives
- Understand how HTTP cookies are transmitted and parsed.
- Realize that client-side stored values must never be trusted for authentication/authorization decisions.
- Gain familiarity with Browser Developer Tools (F12) and inspection of storage parameters.

---

## 3. Setup & Target Environment
- Spuns up as a Node.js Express server on Port `8001`.
- Serves an index route that assigns a cookie `role=guest` if missing.
- Verification logic checks `req.cookies.role === 'admin'`.

---

## 4. Expected Solution
1. Launch the lab target by navigating to `http://localhost:8001` in your browser.
2. Observe the landing page states: `Current session status: GUEST` and instructs that only role `admin` can unlock the vault.
3. Open Browser Developer Tools (F12, or Right Click -> Inspect).
4. Navigate to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox).
5. Expand the **Cookies** section in the left sidebar and select the target address.
6. Locate the cookie named `role` which currently has value `guest`.
7. Double-click the Value field, change it from `guest` to `admin`.
8. Refresh the webpage.
9. The server verifies the updated cookie, accepts authorization bypass, and prints:
   `nerdCTF{c00k13_m0nst3r_m4n1pul4t10n}`

---

## 5. Common Mistakes
- **Capitalization mismatch**: Entering `Admin` or `ADMIN` instead of lowercase `admin` (the server does a strict check: `role === 'admin'`).
- **HTTPOnly locking**: In real environments, cookies marked `HttpOnly` cannot be read or edited via JavaScript `document.cookie` (though they can still be modified directly in the Dev Tools Application tab or using proxy intercept tools like Burp Suite).

---

## 6. Code Explanation
The vulnerability exists on line 15 of `server.js`:
```javascript
let role = req.cookies.role;
if (role === 'admin') {
    // Renders secret vault & flag
}
```
The server relies on the client-supplied cookie string to assign administrative privileges without signing the cookie (cryptographically verifying it on the backend) or storing session states securely in Redis.
