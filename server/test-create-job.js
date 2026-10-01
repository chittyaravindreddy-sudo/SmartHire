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

        const jobData = JSON.stringify({
            title: 'AI/ML Intern',
            company: 'SmartHire Technologies',
            location: 'Vadodara, Gujarat',
            description: 'Internship opportunity for students interested in AI and Machine Learning.',
            requirements: [
                'Python',
                'Machine Learning',
                'Data Structures'
            ],
            salary: '₹15,000/month',
            jobType: 'Internship'
        });

        const jobOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/jobs',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(jobData)
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

        jobRequest.write(jobData);
        jobRequest.end();
    });
});

loginRequest.on('error', console.error);

loginRequest.write(loginData);
loginRequest.end();