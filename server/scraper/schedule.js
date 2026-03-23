/* ================================================================
   scraper/schedule.js
   Runs the scraper automatically every 24 hours using node-cron.
   This is imported in server/index.js to start on server boot.

   TEACH: node-cron uses cron syntax:
   '0 2 * * *' = run at 2:00 AM every day
   '* * * * *' = run every minute (for testing)
   Format: minute hour day month weekday
================================================================ */

const cron = require('node-cron');
const runScraper = require('./index');

function startScheduler() {
    console.log('⏰ Drive scraper scheduled — runs every 24hrs at 2:00 AM');

    // Run immediately on server start
    runScraper().catch(err => console.error('Initial scrape failed:', err));

    // Then run every day at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('\n⏰ Running scheduled drive scraper...');
        try {
            await runScraper();
        } catch (err) {
            console.error('Scheduled scrape failed:', err);
        }
    });
}

module.exports = startScheduler;