const express = require('express');
const app = express();
const PORT = process.env.PORT || 80;

// Middleware to block standard requests if they don't have the secret header
app.all('/', (req, res) => {
    // If the method is HEAD, return flag in header
    if (req.method === 'HEAD') {
        res.setHeader('X-Flag', 'nerdCTF{h1dd3n_h34d3r_HTTP_m3th0ds}');
        res.setHeader('X-Hint', 'Try setting request header X-Request-Source: nerdCTF_Core to see it in the body!');
        return res.status(200).end();
    }

    // Check if the custom request header exists
    const requestSource = req.headers['x-request-source'];
    if (requestSource === 'nerdCTF_Core') {
        return res.json({
            success: true,
            message: "Welcome, Core System. Authentication successful.",
            flag: "nerdCTF{h1dd3n_h34d3r_HTTP_m3th0ds}"
        });
    }

    // Default response
    res.status(405).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Forbidden Access</title>
            <style>
                body { background: #0f172a; color: #f8fafc; font-family: sans-serif; text-align: center; padding-top: 100px; }
                .container { max-width: 600px; margin: 0 auto; border: 1px solid #ef4444; padding: 30px; border-radius: 8px; background: #1e293b; }
                h1 { color: #ef4444; }
                code { background: #0f172a; padding: 4px 8px; border-radius: 4px; color: #f43f5e; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>405 Method Not Allowed / Access Denied</h1>
                <p>Normal web traffic is blocked on this node.</p>
                <p>Only the core system utilizing non-standard request profiles is allowed.</p>
                <p>Hint: Have you tried querying using other HTTP methods or inspecting server headers? Check the <code>HEAD</code> method or include <code>X-Request-Source: nerdCTF_Core</code> in your headers.</p>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Lab 3 listening on port ${PORT}`);
});
