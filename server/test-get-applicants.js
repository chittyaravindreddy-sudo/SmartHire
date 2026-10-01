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

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/applicants',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const request = http.request(options, (response) => {
            let responseBody = '';

            response.on('data', chunk => responseBody += chunk);

            response.on('end', () => {
                console.log('Status:', response.statusCode);
                console.log('Response:', responseBody);
            });
        });

        request.on('error', console.error);

        request.end();
    });
});

loginRequest.on('error', console.error);

loginRequest.write(loginData);
loginRequest.end();