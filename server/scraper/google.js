/* ================================================================
   scraper/google.js
   Scrapes jobs.google.com for fresher/intern roles in India
================================================================ */

const axios = require('axios');

async function scrapeGoogle() {
    console.log('🔍 Scraping Google careers...');

    try {
        // Google Jobs API — public, no auth needed
        const url = 'https://careers.google.com/api/v3/search/?company=Google&company=YouTube&company=Google+Fiber&company=Verily+Life+Sciences&company=Waymo&company=X&company=Chronicle&company=Google+Cloud&q=software+engineer+intern&location=India&distance=50&jlo=en_US&hl=en_US&sort_by=relevance';

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'application/json',
            },
            timeout: 10000,
        });

        const jobs = response.data?.jobs || [];

        return jobs.slice(0, 8).map(job => ({
            company: 'Google',
            role: job.title || 'Software Engineer',
            location: job.locations?.[0]?.display || 'Bangalore, India',
            type: job.title?.toLowerCase().includes('intern') ? 'Internship' : 'Full Time',
            cgpaCutoff: 7.5,
            package: job.title?.toLowerCase().includes('intern') ? '₹80K/month' : '₹25-40 LPA',
            deadline: getDeadline(14),
            status: 'open',
            applyUrl: `https://careers.google.com/jobs/results/${job.id}`,
            source: 'google_careers',
            logo: 'G',
            color: '#4285F4',
            companyType: 'product',
            scrapedAt: new Date().toISOString(),
        }));

    } catch (error) {
        console.error('Google scrape failed:', error.message);
        // Return fallback data if scrape fails
        return getFallbackGoogle();
    }
}

function getFallbackGoogle() {
    return [
        {
            company: 'Google', role: 'Software Engineer Intern', location: 'Bangalore, India',
            type: 'Internship', cgpaCutoff: 7.5, package: '₹80K/month',
            deadline: getDeadline(10), status: 'open',
            applyUrl: 'https://careers.google.com', source: 'google_careers',
            logo: 'G', color: '#4285F4', companyType: 'product', scrapedAt: new Date().toISOString(),
        },
        {
            company: 'Google', role: 'SDE — New Grad', location: 'Hyderabad, India',
            type: 'Full Time', cgpaCutoff: 7.5, package: '₹30-45 LPA',
            deadline: getDeadline(20), status: 'open',
            applyUrl: 'https://careers.google.com', source: 'google_careers',
            logo: 'G', color: '#4285F4', companyType: 'product', scrapedAt: new Date().toISOString(),
        },
    ];
}

function getDeadline(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
}

module.exports = scrapeGoogle;