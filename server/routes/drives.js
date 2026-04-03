/* ================================================================
   routes/drives.js
   Serves drives from drives.json with filtering support

   GET /api/drives              — all drives
   GET /api/drives?role=SDE     — filter by role
   GET /api/drives?cgpa=7.5     — filter by CGPA cutoff
   GET /api/drives?type=product — filter by company type
   GET /api/drives?q=google     — search by company name
   GET /api/drives?source=adzuna_api — filter by source
================================================================ */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DRIVES_PATH = path.join(__dirname, '../../data/drives.json');

function loadDrives() {
    try {
        if (!fs.existsSync(DRIVES_PATH)) {
            return { lastUpdated: null, totalDrives: 0, drives: [] };
        }
        const raw = fs.readFileSync(DRIVES_PATH, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to load drives.json:', e.message);
        return { lastUpdated: null, totalDrives: 0, drives: [] };
    }
}

/* GET /api/drives */
router.get('/', (req, res) => {
    const { role, cgpa, type, q, status, source } = req.query;
    const data = loadDrives();
    let drives = data.drives || [];

    // Filter by role type
    if (role) {
        drives = drives.filter(d =>
            d.role?.toLowerCase().includes(role.toLowerCase()) ||
            d.type?.toLowerCase().includes(role.toLowerCase())
        );
    }

    // Filter by CGPA — only show drives user is eligible for
    if (cgpa) {
        const userCGPA = parseFloat(cgpa);
        drives = drives.filter(d => d.cgpaCutoff <= userCGPA);
    }

    // Filter by company type
    if (type) {
        drives = drives.filter(d => d.companyType === type);
    }

    // Search by company name
    if (q) {
        drives = drives.filter(d =>
            d.company?.toLowerCase().includes(q.toLowerCase()) ||
            d.role?.toLowerCase().includes(q.toLowerCase())
        );
    }

    // Filter by status
    if (status) {
        drives = drives.filter(d => d.status === status);
    }

    // Filter by source (example: adzuna_api, google_careers, seed)
    if (source) {
        const sourceValue = String(source).toLowerCase();
        drives = drives.filter(d => String(d.source || '').toLowerCase() === sourceValue);
    }

    res.json({
        success: true,
        lastUpdated: data.lastUpdated,
        total: drives.length,
        drives,
    });
});

/* GET /api/drives/:id */
router.get('/:id', (req, res) => {
    const data = loadDrives();
    const drive = data.drives?.find(d => d.id === req.params.id);

    if (!drive) {
        return res.status(404).json({ success: false, message: 'Drive not found.' });
    }

    res.json({ success: true, drive });
});

module.exports = router;
