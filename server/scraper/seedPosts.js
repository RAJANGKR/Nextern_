/* ================================================================
   scraper/seedPosts.js
   Seeds MongoDB with realistic feed posts on server start
   Only runs if posts collection is empty
================================================================ */

const Post = require('../models/Post');
const User = require('../models/User');

async function seedPosts() {
    try {
        const count = await Post.countDocuments();
        if (count > 0) return; // already seeded

        console.log('🌱 Seeding feed posts...');

        // Get a real user to be the author
        const user = await User.findOne();
        if (!user) return; // no users yet, skip

        const posts = [
            {
                author: user._id,
                type: 'drive',
                isSystem: true,
                isPinned: true,
                content: '🚨 New Drive Alert! Google is hiring SDE Interns for Summer 2026. Bangalore location. Stipend ₹80K/month. CGPA cutoff 7.5. Apply before March 25th — slots filling fast!',
                meta: {
                    company: 'Google',
                    role: 'SDE Intern',
                    applyUrl: 'https://careers.google.com',
                    deadline: '2026-03-25',
                    package: '₹80K/month',
                },
            },
            {
                author: user._id,
                type: 'tip',
                isSystem: true,
                content: '💡 Interview Tip from a Google SDE: "They don\'t just want the right answer — they want to see how you think. Always talk through your approach before coding. Mention time & space complexity without being asked. It shows maturity."',
                meta: { tag: 'Google' },
            },
            {
                author: user._id,
                type: 'drive',
                isSystem: true,
                content: '📡 Microsoft just opened applications for their New Grad SDE role in Hyderabad! Package ₹20-32 LPA. Requires strong DSA + system design basics. Deadline March 28.',
                meta: {
                    company: 'Microsoft',
                    role: 'SDE New Grad',
                    applyUrl: 'https://careers.microsoft.com',
                    deadline: '2026-03-28',
                    package: '₹20-32 LPA',
                },
            },
            {
                author: user._id,
                type: 'tip',
                isSystem: true,
                content: '🧠 DSA Tip: Most array problems can be solved with two pointers or sliding window. Before jumping to brute force, ask yourself: "Is the array sorted?" and "Do I need to track a window of elements?" — these two questions unlock 60% of Leetcode mediums.',
                meta: { tag: 'DSA' },
            },
            {
                author: user._id,
                type: 'progress',
                isSystem: true,
                content: '🎯 Platform update: 3 of your batchmates completed their Nextern roadmap Phase 1 this week. The most practiced topic? Binary Search. Are you keeping up?',
                meta: {
                    milestone: 'Phase 1 Complete',
                    progress: 25,
                },
            },
            {
                author: user._id,
                type: 'tip',
                isSystem: true,
                content: '📝 Resume tip: Your projects section matters more than your CGPA for product companies. Each project bullet should follow: "Built X using Y which resulted in Z". Example: "Built a real-time chat app using Socket.io + React, reducing message latency by 40%."',
                meta: { tag: 'Resume' },
            },
            {
                author: user._id,
                type: 'drive',
                isSystem: true,
                content: '⚡ Razorpay Backend Engineer role closing in 5 days! They look for strong Node.js + system design. Min CGPA 6.5. Remote friendly. Package ₹18-22 LPA. This one fills up fast every year.',
                meta: {
                    company: 'Razorpay',
                    role: 'Backend Engineer',
                    applyUrl: 'https://razorpay.com/jobs',
                    deadline: '2026-03-23',
                    package: '₹18-22 LPA',
                },
            },
            {
                author: user._id,
                type: 'tip',
                isSystem: true,
                content: '🔥 Senior tip from a Flipkart SDE-2: "For Flipkart interviews, they love questions on hash maps and trees. Do all Leetcode problems tagged \'Amazon\' — Flipkart pattern is very similar. Focus on BFS/DFS, and practice explaining your code out loud."',
                meta: { tag: 'Flipkart' },
            },
            {
                author: user._id,
                type: 'progress',
                isSystem: true,
                content: '📊 Weekly stats: Students on Nextern solved 1,240 DSA problems this week. Top topic: Dynamic Programming (340 solves). Keep grinding — placement season peaks in April!',
                meta: {
                    milestone: 'Weekly Stats',
                    progress: 60,
                },
            },
            {
                author: user._id,
                type: 'tip',
                isSystem: true,
                content: '💬 Behavioural round tip: Every answer should follow STAR format — Situation, Task, Action, Result. Prepare 5 stories that can be adapted to any question. "Tell me about a conflict", "your biggest failure", "a time you led something" — same 5 stories, different angles.',
                meta: { tag: 'Behavioural' },
            },
            {
                author: user._id,
                type: 'drive',
                isSystem: true,
                content: '🏦 Goldman Sachs Technology Analyst role open! Bangalore + Mumbai. Package ₹12-18 LPA. CGPA cutoff 8.0. Known for strong coding round + finance domain questions. Deadline March 30.',
                meta: {
                    company: 'Goldman Sachs',
                    role: 'Technology Analyst',
                    applyUrl: 'https://goldmansachs.com/careers',
                    deadline: '2026-03-30',
                    package: '₹12-18 LPA',
                },
            },
            {
                author: user._id,
                type: 'tip',
                isSystem: true,
                content: '⚡ System Design tip: For any design question, always start with: 1) Clarify requirements, 2) Estimate scale (users, requests/sec), 3) High level design, 4) Deep dive one component, 5) Identify bottlenecks. This structure alone will put you in the top 20% of candidates.',
                meta: { tag: 'System Design' },
            },
        ];

        await Post.insertMany(posts);
        console.log(`✅ Seeded ${posts.length} feed posts`);

    } catch (error) {
        console.error('Seed posts error:', error);
    }
}

module.exports = seedPosts;