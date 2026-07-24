const axios = require('axios');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api/v1';

async function runTests() {
    console.log('--------------------------------------------------');
    console.log('   Starting nerdCTF Backend Integration Test Suite   ');
    console.log('--------------------------------------------------');
    
    let cookies = '';
    const testUser = {
        email: `test_cadet_${Date.now()}@nerdctf.io`,
        username: `cadet_${Date.now()}`,
        password: 'Password123!'
    };

    try {
        // Test 1: User Registration
        console.log('\n[TEST 1] Registering standard user account...');
        const regRes = await axios.post(`${BASE_URL}/auth/register`, testUser);
        if (regRes.data.success) {
            console.log('✔ Registration successful.');
        } else {
            throw new Error('Registration response success flag is false.');
        }

        // Test 2: User Login & Session Cookie Retrieval
        console.log('\n[TEST 2] Authenticating new user session...');
        const logRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        
        if (logRes.data.success && logRes.data.user) {
            console.log(`✔ Login successful. Authenticated as: ${logRes.data.user.username}`);
            // Extract Cookies from headers
            const setCookie = logRes.headers['set-cookie'];
            if (setCookie) {
                cookies = setCookie.map(c => c.split(';')[0]).join('; ');
                console.log('✔ Cookie headers successfully parsed.');
            } else {
                console.log('⚠ Warning: Set-Cookie header missing (expected in local HTTP testing).');
            }
        } else {
            throw new Error('Login response success flag is false.');
        }

        // Test 3: Fetch Protected Challenges List
        console.log('\n[TEST 3] Fetching active challenges from workspace...');
        const chalRes = await axios.get(`${BASE_URL}/challenges`, {
            headers: { Cookie: cookies }
        });
        if (chalRes.data.success && Array.isArray(chalRes.data.challenges)) {
            console.log(`✔ Successfully loaded ${chalRes.data.challenges.length} active training challenges.`);
        } else {
            throw new Error('Failed to retrieve challenges list.');
        }

        // Test 4: Verify Flag Submission Logic (Incorrect flag path)
        console.log('\n[TEST 4] Submitting invalid flag to Challenge 1...');
        const subFailRes = await axios.post(`${BASE_URL}/challenges/submit`, {
            challengeId: 1,
            flag: 'nerdCTF{fake_flag_value}'
        }, {
            headers: { Cookie: cookies }
        });
        if (subFailRes.data.success === false && subFailRes.data.correct === false) {
            console.log('✔ Correctly rejected incorrect flag.');
        } else {
            throw new Error('Incorrect flag submission was not blocked.');
        }

        // Test 5: Verify Flag Submission Logic (Correct flag path)
        console.log('\n[TEST 5] Submitting valid flag to Challenge 1...');
        const subSuccessRes = await axios.post(`${BASE_URL}/challenges/submit`, {
            challengeId: 1,
            flag: 'nerdCTF{c00k13_m0nst3r_m4n1pul4t10n}'
        }, {
            headers: { Cookie: cookies }
        });
        if (subSuccessRes.data.success === true && subSuccessRes.data.correct === true) {
            console.log('✔ Flag validated successfully! Points awarded.');
        } else {
            throw new Error('Failed to validate correct flag.');
        }

        // Test 6: Verify RBAC Permission Block
        console.log('\n[TEST 6] Testing RBAC: accessing admin logs as USER...');
        try {
            await axios.get(`${BASE_URL}/admin/logs`, {
                headers: { Cookie: cookies }
            });
            throw new Error('Access to admin endpoints should have been blocked.');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log('✔ Access Blocked (403 Forbidden). RBAC validation checks functioning correctly.');
            } else {
                throw err;
            }
        }

        // Test 7: Retrieve Detailed User Profile
        console.log('\n[TEST 7] Fetching detailed user profile...');
        const profileRes = await axios.get(`${BASE_URL}/auth/profile`, {
            headers: { Cookie: cookies }
        });
        if (profileRes.data.success && profileRes.data.profile) {
            console.log(`✔ Detailed profile loaded for ${profileRes.data.profile.username} (Points: ${profileRes.data.profile.stats.totalPoints}).`);
        } else {
            throw new Error('Failed to fetch detailed profile.');
        }

        // Test 8: Update User Profile Metadata
        console.log('\n[TEST 8] Updating profile metadata (country and avatar)...');
        const updateRes = await axios.put(`${BASE_URL}/auth/profile`, {
            country: 'Cyberland',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=test'
        }, {
            headers: { Cookie: cookies }
        });
        if (updateRes.data.success && updateRes.data.user.country === 'Cyberland') {
            console.log('✔ Profile metadata updated successfully.');
        } else {
            throw new Error('Failed to update profile metadata.');
        }

        // Test 9: Fetch Platform User Statistics
        console.log('\n[TEST 9] Fetching CTF platform stats...');
        const statsRes = await axios.get(`${BASE_URL}/challenges/stats`, {
            headers: { Cookie: cookies }
        });
        if (statsRes.data.success && statsRes.data.stats) {
            console.log(`✔ Stats loaded: ${statsRes.data.stats.solvedChallenges}/${statsRes.data.stats.totalChallenges} challenges solved (${statsRes.data.stats.completionPercentage}%).`);
        } else {
            throw new Error('Failed to load user CTF stats.');
        }

        // Test 10: Fetch Single Challenge Details
        console.log('\n[TEST 10] Fetching single challenge details by ID (ID: 1)...');
        const detailRes = await axios.get(`${BASE_URL}/challenges/1`, {
            headers: { Cookie: cookies }
        });
        if (detailRes.data.success && detailRes.data.challenge) {
            console.log(`✔ Single challenge details loaded: "${detailRes.data.challenge.title}"`);
        } else {
            throw new Error('Failed to fetch challenge details.');
        }

        console.log('\n--------------------------------------------------');
        console.log('     ALL INTEGRATION TESTS PASSED SUCCESSFULLY!    ');
        console.log('--------------------------------------------------');
    } catch (error) {
        console.error('\n❌ INTEGRATION TEST PIPELINE FAILED:');
        console.error(error.message);
        if (error.response && error.response.data) {
            console.error('Response data:', error.response.data);
        }
        process.exit(1);
    }
}

runTests();
