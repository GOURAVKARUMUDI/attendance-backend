const mongoose = require('mongoose');
const User = require('./models/User');
const http = require('http');

// Connect to DB same as server.js
mongoose.connect('mongodb://localhost:27017/attendance_calculator')
    .then(() => console.log('DB Connected for Verification'))
    .catch(err => {
        console.error('DB Connection Error:', err);
        process.exit(1);
    });

const randomId = Math.floor(Math.random() * 10000);
const testUser = {
    name: `Test User ${randomId}`,
    email: `test${randomId}@example.com`,
    password: 'password123'
};

const postData = JSON.stringify(testUser);

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log(`Attempting to register: ${testUser.email}`);

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', async () => {
        console.log('API Response Status:', res.statusCode);
        console.log('API Response Body:', data);

        if (res.statusCode === 200) {
            console.log('API Registration Successful. Checking Database...');

            // Wait a moment for DB write just in case
            setTimeout(async () => {
                const user = await User.findOne({ email: testUser.email });
                if (user) {
                    console.log('SUCCESS: User found in MongoDB!');
                    console.log(`- ID: ${user._id}`);
                    console.log(`- Name: ${user.name}`);
                    console.log(`- Email: ${user.email}`);
                } else {
                    console.log('FAILURE: User NOT found in MongoDB despite API success.');
                }
                mongoose.connection.close();
            }, 1000);
        } else {
            console.log('API Registration Failed.');
            mongoose.connection.close();
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    mongoose.connection.close();
});

req.write(postData);
req.end();
