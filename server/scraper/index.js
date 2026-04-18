/* ================================================================
   scraper/index.js
   Runs all scrapers, merges with seed data, upserts into MongoDB.

   Run manually:   cd server && node scraper/index.js
   Auto via cron:  runs every 24hrs via schedule.js
================================================================ */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const scrapeAdzuna = require('./adzuna');
const scrapeGoogle = require('./google');
const scrapeMicrosoft = require('./microsoft');
const seedDrives = require('./seedDrives');

// Lazy-require to avoid circular-dep issues when loaded from schedule.js
let Drive;
function getDriveModel() {
    if (!Drive) Drive = require('../models/Drive');
    return Drive;
}

async function runScraper() {
    console.log('\n🚀 Nextern Drive Scraper starting...');
    console.log('─'.repeat(40));

    const results = [];

    // 1. Scrape Google
    try {
        const googleJobs = await scrapeGoogle();
        results.push(...googleJobs);
        console.log(`✅ Google: ${googleJobs.length} drives found`);
    } catch (e) {
        console.error('❌ Google scraper failed:', e.message);
    }

    // 2. Scrape Microsoft
    try {
        const msJobs = await scrapeMicrosoft();
        results.push(...msJobs);
        console.log(`✅ Microsoft: ${msJobs.length} drives found`);
    } catch (e) {
        console.error('❌ Microsoft scraper failed:', e.message);
    }

    // 3. Scrape Adzuna
    try {
        const adzunaJobs = await scrapeAdzuna();
        results.push(...adzunaJobs);
        console.log(`✅ Adzuna: ${adzunaJobs.length} drives found`);
    } catch (e) {
        console.error('❌ Adzuna scraper failed:', e.message);
    }

    // 4. Add seed data
    results.push(...seedDrives);
    console.log(`✅ Seed data: ${seedDrives.length} drives added`);

    // 5. Deduplicate by company + role
    const seen = new Set();
    const unique = results.filter(drive => {
        const key = `${drive.company}-${drive.role}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // 6. Upsert each drive into MongoDB (instead of writing JSON)
    const DriveModel = getDriveModel();
    let inserted = 0;
    let updated = 0;

    for (const drive of unique) {
        const driveId = drive.id || `drive_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        try {
            const result = await DriveModel.findOneAndUpdate(
                // Match on company + role to avoid duplicates
                { company: drive.company, role: drive.role },
                {
                    $set: {
                        id:          driveId,
                        company:     drive.company,
                        role:        drive.role,
                        location:    drive.location,
                        package:     drive.package,
                        cgpaCutoff:  drive.cgpaCutoff ?? 0,
                        deadline:    drive.deadline ? new Date(drive.deadline) : null,
                        type:        drive.type || 'Full Time',
                        companyType: drive.companyType || 'product',
                        applyUrl:    drive.applyUrl,
                        status:      drive.status || 'open',
                        logo:        drive.logo,
                        color:       drive.color,
                        source:      drive.source,
                        scrapedAt:   drive.scrapedAt ? new Date(drive.scrapedAt) : new Date(),
                        postedAt:    drive.postedAt ? new Date(drive.postedAt) : undefined,
                    },
                    $setOnInsert: { createdAt: new Date() },
                },
                { upsert: true, new: true }
            );

            if (result.createdAt && (new Date() - result.createdAt) < 5000) {
                inserted++;
            } else {
                updated++;
            }
        } catch (err) {
            console.error(`⚠️ Failed to upsert ${drive.company} – ${drive.role}:`, err.message);
        }
    }

    console.log('─'.repeat(40));
    console.log(`✅ Total: ${unique.length} drives processed (${inserted} new, ${updated} updated)`);
    console.log(`🕐 Last updated: ${new Date().toISOString()}`);
    console.log('─'.repeat(40));

    return unique;
}

// Run if called directly (standalone mode — needs its own DB connection)
if (require.main === module) {
    const connectDB = require('../config/db');
    connectDB()
        .then(() => runScraper())
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = runScraper;
