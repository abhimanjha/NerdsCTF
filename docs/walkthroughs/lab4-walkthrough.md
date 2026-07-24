# Administrator Solution Walkthrough: Lab 4 - Encoded Secrets

## 1. Challenge Details
- **Name**: Encoded Secrets
- **Difficulty**: Medium
- **Points**: 200
- **Category**: Cryptography / Web
- **Tags**: `base65,encoding,crypto`
- **Flag**: `nerdCTF{d1c0d1ng_is_n0t_encrypt10n}`
- **Estimated Time**: 15 Minutes

---

## 2. Learning Objectives
- Differentiate between encoding (data representation) and encryption (confidentiality protection).
- Learn how to identify Base64 encoded strings (padding characters, character set).
- Perform decoding calculations in command line and web utilities.

---

## 3. Setup & Target Environment
- Spuns up as an Express/Static site on Port `8004`.
- Client-side code validates input keys by comparing the Base64 representation (`btoa(input)`) against a static string.

---

## 4. Expected Solution
1. Launch target `http://localhost:8004`.
2. Observe the interface requesting a master firmware bypass license key.
3. Open Developer Tools (F12) and inspect `script.js` (or View Page Source -> script.js).
4. Analyze the validation function:
   ```javascript
   function verifyKey() {
       const keyInput = document.getElementById('key').value;
       const authHash = "bmVyZENURntkMWMwZDFuZ19pc19uMHRfZW5jcnlwdDEwbn0=";
       if (btoa(keyInput) === authHash) { ... }
   }
   ```
5. Note that `authHash` contains a Base64 string ending with padding: `bmVyZENURntkMWMwZDFuZ19pc19uMHRfZW5jcnlwdDEwbn0=`.
6. Open your terminal or a browser console, and execute the decode query:
   - **Terminal (Linux/macOS)**:
     ```bash
     echo "bmVyZENURntkMWMwZDFuZ19pc19uMHRfZW5jcnlwdDEwbn0=" | base64 --decode
     ```
   - **Browser DevTools Console**:
     ```javascript
     atob("bmVyZENURntkMWMwZDFuZ19pc19uMHRfZW5jcnlwdDEwbn0=")
     ```
7. Both methods yield: `nerdCTF{d1c0d1ng_is_n0t_encrypt10n}`.
8. Enter this decoded string into the key field. The dashboard accepts it and prints the success notice.

---

## 5. Common Mistakes
- **Confusing with hashing/hashes**: Assuming the comparison string is a secure hash (like SHA256 or MD5) which cannot be easily reversed, whereas Base64 is merely an encoding mechanism that can be decoded instantly.
- **Copying quotes**: Copying quote marks or trailing characters inside console decode command.

---

## 6. Code Explanation
The client utilizes:
`btoa(keyInput) === authHash`
`btoa()` stands for binary-to-ascii (encodes to Base64). `atob()` stands for ascii-to-binary (decodes Base64). Since the checking is entirely frontend-facing and uses base64, it offers zero cryptographical protection.
