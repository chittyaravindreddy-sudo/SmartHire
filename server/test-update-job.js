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

        const updateData = JSON.stringify({
            title: 'Junior Full Stack MERN Developer',
            salary: '₹5-7 LPA',
            status: 'Open'
        });

        const updateOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/jobs/6abe30289dfefe8b374441ba',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(updateData)
            }
        };

        const updateRequest = http.request(updateOptions, (updateResponse) => {
            let updateBody = '';

            updateResponse.on('data', chunk => updateBody += chunk);

            updateResponse.on('end', () => {
                console.log('Status:', updateResponse.statusCode);
                console.log('Response:', updateBody);
            });
        });

        updateRequest.on('error', console.error);

        updateRequest.write(updateData);
        updateRequest.end();
    });
});

loginRequest.on('error', console.error);

loginRequest.write(loginData);
loginRequest.end();