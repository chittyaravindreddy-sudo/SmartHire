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

        const deleteOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/jobs/6abe30289dfefe8b374441ba',
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const deleteRequest = http.request(deleteOptions, (deleteResponse) => {
            let deleteBody = '';

            deleteResponse.on('data', chunk => deleteBody += chunk);

            deleteResponse.on('end', () => {
                console.log('Status:', deleteResponse.statusCode);
                console.log('Response:', deleteBody);
            });
        });

        deleteRequest.on('error', console.error);

        deleteRequest.end();
    });
});

loginRequest.on('error', console.error);

loginRequest.write(loginData);
loginRequest.end();