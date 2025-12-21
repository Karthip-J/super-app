const fetch = require('node-fetch');

async function testBackend() {
    const baseUrl = 'http://localhost:3000';
    const endpoints = [
        '/api/health',
        '/api/gcart',
        '/api/groceries'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${baseUrl}${endpoint}...`);
            const response = await fetch(`${baseUrl}${endpoint}`, {
                headers: {
                    'Authorization': 'Bearer demo-token'
                }
            });
            console.log(`Status: ${response.status} ${response.statusText}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`Data (truncated): ${JSON.stringify(data).substring(0, 100)}...`);
            } else {
                const text = await response.text();
                console.log(`Error body: ${text.substring(0, 100)}...`);
            }
        } catch (error) {
            console.error(`Fetch failed for ${endpoint}:`, error.message);
        }
        console.log('---');
    }
}

testBackend();
