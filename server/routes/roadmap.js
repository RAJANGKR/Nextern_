const express = require('express');
const protect = require('../middleware/protect');
const router = express.Router();

const LEVEL_WEEK_COUNT = {
    Beginner: 8,
    Intermediate: 7,
    Advanced: 6,
};

const PHASES = [
    'Foundation Setup',
    'DSA Patterns',
    'Core CS Revision',
    'Role-Focused Practice',
    'Mock Interviews',
    'System Design / Project Readiness',
    'Final Interview Sprint',
    'Application and HR Readiness',
];

function uniqueSkills(skills = []) {
    return [...new Set(skills.map(s => String(s).trim()).filter(Boolean))];
}

function roleTrack(role) {
    const r = String(role || '').toLowerCase();
    if (r.includes('data')) return 'data';
    if (r.includes('analyst')) return 'analyst';
    if (r.includes('product')) return 'product';
    if (r.includes('devops')) return 'devops';
    return 'sde';
}

function commonTasks(company, skills, week) {
    const skillText = skills.length ? skills.slice(0, 3).join(', ') : 'DSA, SQL, OOP';
    return [
        { text: `Solve 8-12 role-relevant coding questions (Week ${week}).`, tag: 'DSA' },
        { text: `Revise one CS core topic and make short notes: OS / DBMS / CN.`, tag: 'CS' },
        { text: `Do one timed mock test and review mistakes in a tracker sheet.`, tag: 'Behavioural' },
        { text: `Update resume bullet points using current skills (${skillText}).`, tag: 'Project' },
        { text: `Prepare 3 behavioural answers linked to ${company} values/culture.`, tag: 'Behavioural' },
    ];
}

function roleSpecificTasks(track, company, week) {
    if (track === 'data') {
        return [
            { text: `Practice SQL + case questions likely for ${company} analyst rounds.`, tag: 'CS' },
            { text: `Build one mini dashboard and explain metrics and trade-offs.`, tag: 'Project' },
            { text: `Solve probability/statistics interview questions for week ${week}.`, tag: 'DSA' },
        ];
    }

    if (track === 'analyst') {
        return [
            { text: `Practice aptitude + logical reasoning sets for campus OA rounds.`, tag: 'DSA' },
            { text: `Write concise business problem summaries with assumptions.`, tag: 'Behavioural' },
            { text: `Revise SQL joins, group by, window functions with 20 queries.`, tag: 'CS' },
        ];
    }

    if (track === 'product') {
        return [
            { text: `Solve 2 product case prompts and structure answers in CIRCLES format.`, tag: 'Behavioural' },
            { text: `Create one product teardown presentation and discuss metrics.`, tag: 'Project' },
            { text: `Revise A/B testing basics and metric interpretation.`, tag: 'CS' },
        ];
    }

    if (track === 'devops') {
        return [
            { text: `Set up CI/CD for one sample app and document pipeline steps.`, tag: 'Project' },
            { text: `Revise Linux, networking, containers, and deployment basics.`, tag: 'System' },
            { text: `Practice troubleshooting scenarios and incident postmortem notes.`, tag: 'System' },
        ];
    }

    return [
        { text: `Solve topic-wise DSA set for arrays, graphs, trees and DP.`, tag: 'DSA' },
        { text: `Practice LLD/HLD discussion prompt for ${company} interview style.`, tag: 'System' },
        { text: `Build or polish one backend/frontend project with deployment.`, tag: 'Project' },
    ];
}

function levelAdjustments(level, weekCount) {
    if (level === 'Beginner') {
        return { titlePrefix: 'Beginner', weeklyTarget: '8-10 hrs/week', weekCount };
    }
    if (level === 'Intermediate') {
        return { titlePrefix: 'Intermediate', weeklyTarget: '10-12 hrs/week', weekCount };
    }
    return { titlePrefix: 'Advanced', weeklyTarget: '12-14 hrs/week', weekCount };
}

router.post('/generate', protect, async (req, res) => {
    const { company, role, level = 'Advanced', skills = [] } = req.body;

    if (!company || !role) {
        return res.status(400).json({ success: false, message: 'Company and role are required.' });
    }

    try {
        const safeLevel = LEVEL_WEEK_COUNT[level] ? level : 'Advanced';
        const weekCount = LEVEL_WEEK_COUNT[safeLevel];
        const userSkills = uniqueSkills(Array.isArray(skills) ? skills : []);
        const track = roleTrack(role);
        const levelMeta = levelAdjustments(safeLevel, weekCount);

        const weeks = Array.from({ length: weekCount }).map((_, index) => {
            const week = index + 1;
            const phase = PHASES[index] || `Focused Preparation`;
            const title = `${levelMeta.titlePrefix} ${phase} (${levelMeta.weeklyTarget})`;
            const tasks = [
                ...commonTasks(company, userSkills, week),
                ...roleSpecificTasks(track, company, week),
            ].slice(0, 6);

            return { week, title, tasks };
        });

        res.json({
            success: true,
            roadmap: { weeks },
        });
    } catch (error) {
        console.error('Roadmap generation error:', error);
        res.status(500).json({ success: false, message: 'Could not generate roadmap.' });
    }
});

module.exports = router;
