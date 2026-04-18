const express = require('express');
const protect = require('../middleware/protect');
const Topic = require('../models/Topic');
const TopicProgress = require('../models/TopicProgress');

const router = express.Router();

/* ── GET /api/prep/topics ─────────────────────────────────────
   Returns every topic, sorted by subject → level → order.
   No auth required so the page can render even before login.
──────────────────────────────────────────────────────────────── */
router.get('/topics', async (_req, res) => {
  try {
    const topics = await Topic.find({}).sort({ subjectCode: 1, order: 1 }).lean();
    res.json({ success: true, data: topics });
  } catch (err) {
    console.error('prep/topics error:', err.message);
    res.status(500).json({ success: false, message: 'Could not load topics.' });
  }
});

/* ── GET /api/prep/progress ───────────────────────────────────
   Returns an array of completed topic codes for the logged-in user.
──────────────────────────────────────────────────────────────── */
router.get('/progress', protect, async (req, res) => {
  try {
    const rows = await TopicProgress.find({ user: req.user._id, completed: true }).lean();
    const codes = rows.map(r => r.topicCode);
    res.json({ success: true, data: codes });
  } catch (err) {
    console.error('prep/progress error:', err.message);
    res.status(500).json({ success: false, message: 'Could not load progress.' });
  }
});

/* ── POST /api/prep/toggle ────────────────────────────────────
   Body: { topicCode: "d1" }
   Toggles completion. If already complete → delete. Otherwise → create.
──────────────────────────────────────────────────────────────── */
router.post('/toggle', protect, async (req, res) => {
  try {
    const { topicCode } = req.body;
    if (!topicCode) return res.status(400).json({ success: false, message: 'topicCode required.' });

    const existing = await TopicProgress.findOne({ user: req.user._id, topicCode });
    if (existing) {
      await TopicProgress.deleteOne({ _id: existing._id });
      return res.json({ success: true, completed: false });
    }

    await TopicProgress.create({ user: req.user._id, topicCode, source: 'manual' });
    res.json({ success: true, completed: true });
  } catch (err) {
    console.error('prep/toggle error:', err.message);
    res.status(500).json({ success: false, message: 'Could not toggle topic.' });
  }
});

/* ── POST /api/prep/assess ────────────────────────────────────
   Body: { knownCodes: ["ds1","ds2",...] }
   Bulk-sets topic codes as completed with source "assessment".
   Any previously-assessed codes not in the new list are removed.
──────────────────────────────────────────────────────────────── */
router.post('/assess', protect, async (req, res) => {
  try {
    const { knownCodes = [] } = req.body;
    const userId = req.user._id;

    // Remove old assessment entries not in the new list
    await TopicProgress.deleteMany({
      user: userId,
      source: 'assessment',
      topicCode: { $nin: knownCodes },
    });

    // Upsert each known code
    const ops = knownCodes.map(code => ({
      updateOne: {
        filter: { user: userId, topicCode: code },
        update: { $set: { completed: true, source: 'assessment' } },
        upsert: true,
      },
    }));
    if (ops.length) await TopicProgress.bulkWrite(ops);

    res.json({ success: true, count: knownCodes.length });
  } catch (err) {
    console.error('prep/assess error:', err.message);
    res.status(500).json({ success: false, message: 'Could not save assessment.' });
  }
});

/* ── GET /api/prep/summary ────────────────────────────────────
   Returns per-subject readiness + overall percentage.
──────────────────────────────────────────────────────────────── */
router.get('/summary', protect, async (req, res) => {
  try {
    const [topics, progress] = await Promise.all([
      Topic.find({}).lean(),
      TopicProgress.find({ user: req.user._id, completed: true }).lean(),
    ]);

    const doneSet = new Set(progress.map(p => p.topicCode));
    const subjects = ['DSA', 'DBMS', 'OOPS', 'OS', 'CN'];
    const summary = {};
    let totalImp = 0, doneImp = 0;

    for (const subj of subjects) {
      const st = topics.filter(t => t.subjectCode === subj);
      const si = st.reduce((s, t) => s + t.importance, 0);
      const di = st.filter(t => doneSet.has(t.code)).reduce((s, t) => s + t.importance, 0);
      const completed = st.filter(t => doneSet.has(t.code)).length;
      summary[subj] = {
        total: st.length,
        completed,
        totalImp: si,
        doneImp: di,
        readinessPct: si ? Math.round(di / si * 100) : 0,
      };
      totalImp += si;
      doneImp += di;
    }

    res.json({
      success: true,
      data: { summary, overall: totalImp ? Math.round(doneImp / totalImp * 100) : 0 },
    });
  } catch (err) {
    console.error('prep/summary error:', err.message);
    res.status(500).json({ success: false, message: 'Could not compute summary.' });
  }
});

module.exports = router;
