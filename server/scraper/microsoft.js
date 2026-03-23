/* ================================================================
   scraper/microsoft.js
   Scrapes Microsoft careers API for India roles
================================================================ */

const axios = require('axios');

async function scrapeMicrosoft() {
    console.log('🔍 Scraping Microsoft careers...');

    try {
        // Microsoft has a public jobs API
        const url = 'https://gcsservices.careers.microsoft.com/search/api/v1/search?q=software+engineer&lc=India&exp=Students+and+Recent+Graduates&l=en_us&pg=1&pgSz=8&o=Relevance&flt=true';

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'application/json',
            },
            timeout: 10000,
        });

        const jobs = response.data?.operationResult?.result?.jobs || [];

        return jobs.slice(0, 8).map(job => ({
            company: 'Microsoft',
            role: job.title || 'Software Engineer',
            location: job.primaryLocation || 'Hyderabad, India',
            type: job.title?.toLowerCase().includes('intern') ? 'Internship' : 'Full Time',
            cgpaCutoff: 7.0,
            package: job.title?.toLowerCase().includes('intern') ? '₹75K/month' : '₹20-35 LPA',
            deadline: getDeadline(21),
            status: 'open',
            applyUrl: `https://jobs.careers.microsoft.com/global/en/job/${job.jobId}`,
            source: 'microsoft_careers',
            logo: 'M',
            color: '#00A4EF',
            companyType: 'product',
            scrapedAt: new Date().toISOString(),
        }));

    } catch (error) {
        console.error('Microsoft scrape failed:', error.message);
        return getFallbackMicrosoft();
    }
}

function getFallbackMicrosoft() {
    return [
        {
            company: 'Microsoft', role: 'Software Engineer Intern', location: 'Hyderabad, India',
            type: 'Internship', cgpaCutoff: 7.0, package: '₹75K/month',
            deadline: getDeadline(21), status: 'open',
            applyUrl: 'https://careers.microsoft.com', source: 'microsoft_careers',
            logo: 'M', color: '#00A4EF', companyType: 'product', scrapedAt: new Date().toISOString(),
        },
        {
            company: 'Microsoft', role: 'SDE — New Grad', location: 'Bangalore, India',
            type: 'Full Time', cgpaCutoff: 7.0, package: '₹20-32 LPA',
            deadline: getDeadline(28), status: 'open',
            applyUrl: 'https://careers.microsoft.com', source: 'microsoft_careers',
            logo: 'M', color: '#00A4EF', companyType: 'product', scrapedAt: new Date().toISOString(),
        },
    ];
}

function getDeadline(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
}

module.exports = scrapeMicrosoft;