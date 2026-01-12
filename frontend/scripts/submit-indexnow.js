const https = require('https');

const host = 'www.militarydisabilitynexus.com';
const key = 'bda94d1a5c99451d8d7c8ba3dd5e4d18';
const keyLocation = `https://${host}/${key}.txt`;

// List of URLs to submit
// In a real scenario, this might come from arguments or a database
const urlList = [
    // Add URLs here that you want to index
    `https://${host}/`,
    `https://${host}/services`,
    // Example: `https://${host}/services/cp-coaching`
];

if (process.argv.length > 2) {
    // Allow passing URLs as command line arguments
    for (let i = 2; i < process.argv.length; i++) {
        urlList.push(process.argv[i]);
    }
}

const data = JSON.stringify({
    host: host,
    key: key,
    keyLocation: keyLocation,
    urlList: urlList
});

const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/IndexNow',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    console.log(`StatusMessage: ${res.statusMessage}`);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
console.log(`Submitting ${urlList.length} URL(s) to IndexNow...`);
