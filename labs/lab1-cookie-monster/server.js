const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 80;

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    // Check if role cookie exists, if not, set to guest
    let role = req.cookies.role;
    if (!role) {
        res.cookie('role', 'guest', { httpOnly: false }); // httpOnly: false so they can see/modify it easily via document.cookie
        role = 'guest';
    }

    if (role === 'admin') {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Cookie Monster's Secret Vault</title>
                <style>
                    body { background: #0a0e17; color: #00ffcc; font-family: 'Courier New', Courier, monospace; text-align: center; padding-top: 100px; }
                    .vault { border: 2px solid #00ffcc; display: inline-block; padding: 30px; box-shadow: 0 0 20px #00ffcc; background: #111b27; border-radius: 10px; }
                    h1 { color: #ff007f; }
                    .flag { font-size: 24px; font-weight: bold; background: #070a13; padding: 10px 20px; border-radius: 5px; border: 1px dashed #ff007f; display: inline-block; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="vault">
                    <h1>Vault Access Granted!</h1>
                    <p>Welcome back, Admin. Here is your secret cookie flag:</p>
                    <div class="flag">nerdCTF{c00k13_m0nst3r_m4n1pul4t10n}</div>
                </div>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Cookie Monster's Portal</title>
                <style>
                    body { background: #0a0e17; color: #a0aec0; font-family: 'Courier New', Courier, monospace; text-align: center; padding-top: 100px; }
                    .portal { border: 2px solid #3182ce; display: inline-block; padding: 30px; box-shadow: 0 0 15px #3182ce; background: #111b27; border-radius: 10px; }
                    h1 { color: #3182ce; }
                    .status { color: #e53e3e; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="portal">
                    <h1>Cookie Monster's Portal</h1>
                    <p>Current session status: <span class="status">GUEST</span></p>
                    <p>Only the user with the cookie role 'admin' can access the secret vault.</p>
                    <p>Can you modify your cookies to bypass this check?</p>
                </div>
            </body>
            </html>
        `);
    }
});

app.listen(PORT, () => {
    console.log(`Lab 1 listening on port ${PORT}`);
});
