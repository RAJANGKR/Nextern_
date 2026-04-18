/* ================================================================
   routes/analyze.routes.js

   POST /api/analyze/resume    — Upload PDF + analyze against a drive
   GET  /api/analyze/my-history — Get logged-in user's past analyses
================================================================ */

const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const protect = require('../middleware/protect');
const Analysis = require('../models/analysis.model');
const { analyzeResume } = require('../services/gemini.service');

const router = express.Router();

// Multer: store file in memory (no disk write needed)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed.'));
        }
    },
});

/* ----------------------------------------------------------------
   POST /api/analyze/resume
   Body (multipart/form-data):
     - resume    : PDF file
     - driveId   : string
     - driveTitle: string
     - jobDescription: string
     - company   : string
---------------------------------------------------------------- */
router.post('/resume', protect, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a PDF resume.' });
        }

        const { driveId = 'general', company = 'Nextern Profile', role = 'Software Engineer' } = req.body;

        // 1. Extract text from PDF
        console.log(`📄 [Analyze] Extracting text from PDF for user ${req.user.email}`);
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text?.trim();

        if (!resumeText || resumeText.length < 50) {
            return res.status(400).json({
                success: false,
                message: 'Could not extract text from the PDF. Make sure it is not a scanned image.',
            });
        }

        // 2. Call Gemini
        console.log(`🤖 [Analyze] Sending to Gemini for analysis...`);
        const analysis = await analyzeResume(resumeText, role, company);

        // 3. Save to MongoDB
        const doc = await Analysis.create({
            studentId: req.user._id,
            driveId,
            driveTitle: role,
            matchScore: analysis.matchScore,
            summary: analysis.summary,
            presentSkills: analysis.presentSkills,
            missingSkills: analysis.missingSkills,
            strengths: analysis.strengths,
            improvements: analysis.improvements,
            resumeTips: analysis.resumeTips,
            studyTopics: analysis.studyTopics
        });

        console.log(`✅ [Analyze] Analysis saved. Score: ${analysis.matchScore}%`);

        res.json({
            success: true,
            analysisId: doc._id,
            ...analysis
        });

    } catch (err) {
        console.error('❌ [Analyze] Error:', err.message);
        res.status(500).json({ success: false, message: err.message || 'Analysis failed.' });
    }
});

/* ----------------------------------------------------------------
   GET /api/analyze/my-history
   Returns the logged-in student's past analyses (newest first).
---------------------------------------------------------------- */
router.get('/my-history', protect, async (req, res) => {
    try {
        const analyses = await Analysis.find({ studentId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ success: true, analyses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
