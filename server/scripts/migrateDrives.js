/* ================================================================
   scripts/migrateDrives.js
   One-time migration: reads data/drives.json → inserts into MongoDB

   Usage:  cd server && node scripts/migrateDrives.js
================================================================ */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Drive = require('../models/Drive');
const connectDB = require('../config/db');

const migrate = async () => {
    try {
        await connectDB();
        console.log('📦 Connected to MongoDB for migration...');

        const drivesPath = path.join(__dirname, '../../data/drives.json');
        if (!fs.existsSync(drivesPath)) {
            console.error('❌ drives.json not found at:', drivesPath);
            process.exit(1);
        }

        const data = JSON.parse(fs.readFileSync(drivesPath, 'utf8'));
        const drives = data.drives || [];

        if (drives.length === 0) {
            console.log('ℹ️  No drives found in drives.json to migrate.');
            process.exit(0);
        }

        console.log(`🚀 Migrating ${drives.length} drives...`);

        // Clear existing drives to avoid duplicates
        const deleted = await Drive.deleteMany({});
        console.log(`🧹 Cleared ${deleted.deletedCount} existing drives.`);

        // Map JSON fields to the Drive schema
        const drivesToInsert = drives.map(d => ({
            id:          d.id,
            company:     d.company,
            role:        d.role,
            location:    d.location,
            package:     d.package,
            cgpaCutoff:  d.cgpaCutoff ?? 0,
            deadline:    d.deadline ? new Date(d.deadline) : null,
            type:        d.type || 'Full Time',
            companyType: d.companyType || 'product',
            applyUrl:    d.applyUrl,
            status:      d.status || 'open',
            logo:        d.logo,
            color:       d.color,
            source:      d.source,
            scrapedAt:   d.scrapedAt ? new Date(d.scrapedAt) : new Date(),
            postedAt:    d.postedAt ? new Date(d.postedAt) : undefined,
        }));

        const result = await Drive.insertMany(drivesToInsert);
        console.log(`✅ Migration successful! ${result.length} drives inserted.`);

        // Show a sample
        console.log('\n📋 Sample drive:');
        console.log(JSON.stringify(result[0].toObject(), null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

migrate();
