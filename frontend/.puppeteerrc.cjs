const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
  // Specify a custom executable path for Chrome/Chromium
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
};
