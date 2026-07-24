# Administrator Solution Walkthrough: Lab 2 - Source Detective

## 1. Challenge Details
- **Name**: Source Detective
- **Difficulty**: Easy
- **Points**: 100
- **Category**: Web Exploitation
- **Tags**: `source,html,css,javascript`
- **Flag**: `nerdCTF{s0urc3_d3t3ct1v3_f1nd_m3_cl0s3ly}`
- **Estimated Time**: 15 Minutes

---

## 2. Learning Objectives
- Learn to search client-facing source files (HTML, CSS, JS) for sensitive disclosures.
- Understand that any code sent to the browser is public, and comments/unused variables are visible to users.
- Master file review techniques using Developer Tools.

---

## 3. Setup & Target Environment
- Spuns up as a static server on Port `8002`.
- Serves three files: `index.html`, `style.css`, and `app.js`.

---

## 4. Expected Solution
1. Open the target site `http://localhost:8002` in your browser.
2. Right-click on the page background and select **View Page Source** (or press `Ctrl+U`).
3. Scroll through the HTML source to find a comment:
   `<!-- Clue Part 1 of 3: nerdCTF{s0urc3_ -->`
4. Inspect the linked resources at the top. Click on `style.css` to view the stylesheet.
5. Inside the CSS file, note the comment block:
   `/* Clue Part 2 of 3: d3t3ct1v3_f1nd_ */`
6. Return to the page source and click on the script file `app.js` (or inspect it under the **Sources** tab of Developer Tools).
7. Notice the declared variable inside:
   `// Clue Part 3 of 3: m3_cl0s3ly}`
8. Join the three parts sequentially to reconstruct the flag:
   `nerdCTF{s0urc3_d3t3ct1v3_f1nd_m3_cl0s3ly}`

---

## 5. Common Mistakes
- **Skipping CSS/JS inspection**: Assuming the flag is entirely inside the HTML source.
- **Typo during concatenation**: Leaving extra spaces or comments, or leaving out the final curly bracket.

---

## 6. Code Explanation
Sensitive credentials, configuration details, or partial keys should never be placed in frontend code, comments, or client-side assets because all frontend scripts must be downloaded to the client browser to render the page, exposing them to inspections.
