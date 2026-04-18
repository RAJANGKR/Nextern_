/* ================================================================
   scraper/schedule.js
   Background scheduled tasks:
   1. Drive scraper — runs every 24hrs at 2:00 AM
   2. Deadline auto-close — runs every hour, closes expired drives

   Imported in server/index.js → startScheduler()
================================================================ */

const cron = require('node-cron');
const runScraper = require('./index');

function startScheduler() {
    const Drive = require('../models/Drive');

    /* ── 1. Drive Scraper (every day at 2 AM) ── */
    console.log('⏰ Drive scraper scheduled — runs every 24hrs at 2:00 AM');

    // Run immediately on server start
    runScraper().catch(err => console.error('Initial scrape failed:', err));

    cron.schedule('0 2 * * *', async () => {
        console.log('\n⏰ Running scheduled drive scraper...');
        try {
            await runScraper();
        } catch (err) {
            console.error('Scheduled scrape failed:', err);
        }
    });

    /* ── 2. Auto-close expired drives (every hour) ── */
    console.log('⏰ Deadline auto-close scheduled — runs every hour');

    // Also run once on startup
    closeExpiredDrives(Drive);

    cron.schedule('0 * * * *', () => closeExpiredDrives(Drive));
}

/**
 * Closes all drives where deadline < now and status is still 'open'
 */
async function closeExpiredDrives(Drive) {
    try {
        const result = await Drive.updateMany(
            { deadline: { $lt: new Date() }, status: 'open' },
            { $set: { status: 'closed' } }
        );

        if (result.modifiedCount > 0) {
            console.log(`🔒 Auto-closed ${result.modifiedCount} expired drive(s)`);
        }
    } catch (err) {
        console.error('Auto-close cron error:', err.message);
    }
}

module.exports = startScheduler;