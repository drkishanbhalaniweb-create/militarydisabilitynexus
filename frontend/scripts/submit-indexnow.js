const https = require('https');
const http = require('http'); // Check if needed for localhost, but usually fetch from production

const host = 'www.militarydisabilitynexus.com';
const key = 'bda94d1a5c99451d8d7c8ba3dd5e4d18';
const keyLocation = `https://${host}/${key}.txt`;

// Core static routes derived from your sitemap configuration
const staticRoutes = [
    '',
    '/services',
    '/blog',
    '/case-studies',
    '/about',
    '/contact',
    '/claim-readiness-review',
    '/diagnostic',
    '/community',
    '/privacy',
    '/terms',
    '/disclaimer',
];

let urlList = staticRoutes.map(route => `https://${host}${route}`);

if (process.argv.length > 2) {
    // Allow passing URLs as command line arguments
    for (let i = 2; i < process.argv.length; i++) {
        urlList.push(process.argv[i]);
    }
}

// Function to submit URLs
function submitUrls(urls) {
    const uniqueUrls = [...new Set(urls)]; // Deduplicate

    const data = JSON.stringify({
        host: host,
        key: key,
        keyLocation: keyLocation,
        urlList: uniqueUrls
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
    console.log(`Submitting ${uniqueUrls.length} URL(s) to IndexNow...`);
}

// Optional: Fetch execution to get all URLs from live sitemap
// Set FETCH_SITEMAP=true to use this
const fetchSitemap = process.env.FETCH_SITEMAP === 'true';

if (fetchSitemap) {
    console.log('Fetching sitemap from production to get all dynamic URLs...');
    https.get(`https://${host}/sitemap.xml`, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            // Simple regex to extract URLs from XML
            const sitemapUrls = [];
            const regex = /<loc>(.*?)<\/loc>/g;
            let match;
            while ((match = regex.exec(data)) !== null) {
                sitemapUrls.push(match[1]);
            }
            console.log(`Found ${sitemapUrls.length} URLs in sitemap.`);
            submitUrls([...urlList, ...sitemapUrls]);
        });
    }).on('error', (err) => {
        console.error('Error fetching sitemap:', err);
        console.log('Falling back to static list only.');
        submitUrls(urlList);
    });
} else {
    submitUrls(urlList);
}
