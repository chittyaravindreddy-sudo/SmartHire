const http = require('http');

const loginData = JSON.stringify({
    email: 'recruiter@smarthire.com',
    password: 'SmartHire123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
    }
};

const loginRequest = http.request(loginOptions, (loginResponse) => {
    let body = '';

    loginResponse.on('data', chunk => body += chunk);

    loginResponse.on('end', () => {
        const loginResult = JSON.parse(body);

        if (!loginResult.success) {
            console.log('Login failed:', loginResult);
            return;
        }

        const token = loginResult.token;

        console.log('Login successful. JWT received.');

        const jobOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/jobs/6abe30289dfefe8b374441ba',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const jobRequest = http.request(jobOptions, (jobResponse) => {
            let jobBody = '';

            jobResponse.on('data', chunk => jobBody += chunk);

            jobResponse.on('end', () => {
                console.log('Status:', jobResponse.statusCode);
                console.log('Response:', jobBody);
            });
        });

        jobRequest.on('error', console.error);

        jobRequest.end();
    });
});

loginRequest.on('error', console.error);

loginRequest.write(loginData);
loginRequest.end();