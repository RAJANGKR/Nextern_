/* ================================================================
   scraper/index.js
   Runs all scrapers, merges with seed data, saves to drives.json

   Run manually:   node scraper/index.js
   Auto via cron:  runs every 24hrs via schedule.js
================================================================ */

const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const scrapeAdzuna = require('./adzuna');
const scrapeGoogle = require('./google');
const scrapeMicrosoft = require('./microsoft');
const seedDrives = require('./seedDrives');

const OUTPUT_PATH = path.join(__dirname, '../../data/drives.json');

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

    // 6. Add IDs
    const final = unique.map((drive, index) => ({
        id: `drive_${Date.now()}_${index}`,
        ...drive,
    }));

    // 7. Save to JSON
    const output = {
        lastUpdated: new Date().toISOString(),
        totalDrives: final.length,
        drives: final,
    };

    // Make sure data directory exists
    const dataDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

    console.log('─'.repeat(40));
    console.log(`✅ Total: ${final.length} drives saved to drives.json`);
    console.log(`📁 Output: ${OUTPUT_PATH}`);
    console.log(`🕐 Last updated: ${output.lastUpdated}`);
    console.log('─'.repeat(40));

    return final;
}

// Run if called directly
if (require.main === module) {
    runScraper().catch(console.error);
}

module.exports = runScraper;
