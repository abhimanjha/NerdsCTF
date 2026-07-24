# Security Review Checklist: nerdCTF - Version 1

This checklist reviews security mitigations implemented in nerdCTF to address OWASP Top 10 web application vulnerabilities.

---

## 1. Authentication & Hashing (Argon2id)
- [x] **Secure Hashing Algorithm**: Passwords are encrypted utilizing **Argon2id** with memory cost parameters ($64\text{ MB}$, $3$ iterations, and $4$ parallelism threads) preventing brute-forcing.
- [x] **Password Policies**: Registration checks verify standard password complexity requirements (minimum 8 characters, at least one uppercase letter, one digit, and one special character).
- [x] **Session Rotation**: Login triggers a session token regeneration, changing session identifiers to prevent session fixation.
- [x] **Refresh Token Rotation**: Refresh tokens are rotated on each use. If reuse of an old refresh token is detected, all sessions for that user are immediately revoked (mitigating token-theft attacks).

---

## 2. Session Integrity & Cookies
- [x] **HTTPOnly Cookies**: Access and refresh tokens are stored in cookies with the `httpOnly` flag enabled, making them inaccessible to JavaScript (mitigating XSS theft).
- [x] **Secure Flag**: Cookies are served with the `secure` flag enabled in production, forcing transmission over HTTPS connections.
- [x] **SameSite Restriction**: `sameSite: 'strict'` is set on cookies to prevent browser cross-site request transmissions, providing built-in protection against CSRF.
- [x] **Token Blacklisting**: Redis is configured to store blacklisted tokens when users log out, ensuring revoked credentials cannot be re-used during their active duration.

---

## 3. Data Protection & SQL Injection (SQLi)
- [x] **ORM Parameterization**: Database interactions are orchestrated via **Prisma ORM**. Prisma handles parameterized inputs out of the box, mitigating SQL injection hazards.
- [x] **No Flag Exposure**: DB flags are stored as secure hashes (`SHA256`). A compromised database will not leak target flag strings.

---

## 4. Input Validations & Defense-in-Depth
- [x] **Secure Headers**: **Helmet** middleware is configured in the Express backend, injecting security headers including `X-Content-Type-Options: nosniff` and XSS filter protections.
- [x] **Strict Content Security Policy (CSP)**: Helmet's CSP directive restricts script executions to self elements, mitigating inline script injections.
- [x] **CORS Whitelisting**: CORS middleware restricts origin requests, accepting only designated frontend domains.
- [x] **Rate Throttling**: API endpoints are locked behind `express-rate-limit`. Authentication routes are throttled to a maximum of 10 requests per 15-minute window to prevent brute force cracking.

---

## 5. Clean API Design & Authorization checks (IDOR/BOLA)
- [x] **Role-Based Access Control (RBAC)**: Admin routes require explicit `requireAdmin` middlewares to verify context role claims.
- [x] **Context Assertions**: User operations verify identity mappings rather than relying on parameters passed from the client, preventing IDOR.
- [x] **Log Integrity**: System events, challenge attempts, and admin moderate actions are logged to dedicated SQL audit tables.
