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

        const applicantData = JSON.stringify({
            name: 'Rahul Sharma',
            email: 'rahul.sharma@example.com',
            phone: '9876543210',
            resume: 'rahul-sharma-resume.pdf',
            coverLetter: 'I am interested in the AI/ML Internship position.',
            job: '6abe333347942565d5b81b10'
        });

        const applicantOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/applicants',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(applicantData)
            }
        };

        const applicantRequest = http.request(
            applicantOptions,
            (applicantResponse) => {
                let applicantBody = '';

                applicantResponse.on(
                    'data',
                    chunk => applicantBody += chunk
                );

                applicantResponse.on('end', () => {
                    console.log('Status:', applicantResponse.statusCode);
                    console.log('Response:', applicantBody);
                });
            }
        );

        applicantRequest.on('error', console.error);

        applicantRequest.write(applicantData);
        applicantRequest.end();
    });
});

loginRequest.on('error', console.error);

loginRequest.write(loginData);
loginRequest.end();