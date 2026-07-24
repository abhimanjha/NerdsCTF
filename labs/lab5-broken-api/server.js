const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 80;

// Database mock
const usersDb = {
    "1": {
        id: 1,
        username: "superadmin",
        role: "Administrator",
        email: "admin@nexus.io",
        bio: "System Architect & Platform Founder. Keep all API keys secured.",
        secret_flag: "nerdCTF{broken_api_IDOR_auth_bypass_99}",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
    },
    "2": {
        id: 2,
        username: "guest_developer",
        role: "Junior Developer",
        email: "dev_junior@nexus.io",
        bio: "Learning Express APIs and styling components. Doing sandbox tests.",
        secret_flag: "Access Denied: You must be user 1 to see the system secret.",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=developer"
    }
};

app.use(express.static(path.join(__dirname, 'public')));

// Vulnerable endpoint - lacks authentication and proper ID checks (IDOR)
app.get('/api/profile', (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res.status(400).json({ error: "Missing 'id' query parameter" });
    }
    
    const user = usersDb[id];
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    
    // Vulnerable: Directly dumps whole user record containing the flag
    res.json(user);
});

app.listen(PORT, () => {
    console.log(`Lab 5 listening on port ${PORT}`);
});
