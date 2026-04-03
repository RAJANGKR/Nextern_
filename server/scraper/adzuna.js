const axios = require('axios');

function getDeadline(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
}

function detectType(title = '') {
    const t = String(title).toLowerCase();
    if (t.includes('intern')) return 'Internship';
    if (t.includes('contract')) return 'Contract';
    return 'Full Time';
}

function inferCompanyType(company = '') {
    const c = String(company).toLowerCase();
    if (c.includes('services') || c.includes('consult') || c.includes('tcs') || c.includes('infosys') || c.includes('wipro')) {
        return 'service';
    }
    if (c.includes('bank') || c.includes('finance') || c.includes('capital') || c.includes('goldman') || c.includes('jpmorgan')) {
        return 'finance';
    }
    return 'product';
}

function estimateCgpaCutoff(companyType) {
    if (companyType === 'service') return 6.0;
    if (companyType === 'finance') return 7.5;
    return 7.0;
}

function formatPackage(salaryMin, salaryMax, type) {
    if (!salaryMin && !salaryMax) {
        return type === 'Internship' ? 'Stipend not disclosed' : 'Package not disclosed';
    }
    const minLpa = salaryMin ? (salaryMin / 100000).toFixed(1) : null;
    const maxLpa = salaryMax ? (salaryMax / 100000).toFixed(1) : null;

    if (minLpa && maxLpa) return `₹${minLpa}-${maxLpa} LPA`;
    if (minLpa) return `₹${minLpa}+ LPA`;
    return `Up to ₹${maxLpa} LPA`;
}

async function scrapeAdzuna() {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    const country = process.env.ADZUNA_COUNTRY || 'in';
    const where = process.env.ADZUNA_WHERE || 'India';

    if (!appId || !appKey) {
        console.log('Adzuna skipped: missing ADZUNA_APP_ID / ADZUNA_APP_KEY');
        return [];
    }

    console.log('Scraping Adzuna jobs...');

    const baseUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search`;

    async function fetchPage(query, page, useWhere) {
        const params = {
            app_id: appId,
            app_key: appKey,
            what: query,
            results_per_page: 25,
            sort_by: 'date',
        };

        if (useWhere && where) {
            params.where = where;
        }

        const url = `${baseUrl}/${page}`;
        const response = await axios.get(url, { params, timeout: 12000 });
        return response.data?.results || [];
    }

    try {
        const queries = ['software engineer', 'software developer', 'intern', 'data analyst'];
        const collected = [];

        for (const query of queries) {
            const page1 = await fetchPage(query, 1, true);
            collected.push(...page1);
            if (collected.length >= 20) break;
        }

        // If location-constrained search is too narrow, retry without "where".
        if (!collected.length) {
            for (const query of queries) {
                const page1 = await fetchPage(query, 1, false);
                collected.push(...page1);
                if (collected.length >= 20) break;
            }
        }

        const seen = new Set();
        const jobs = collected.filter((job) => {
            const key = `${job.redirect_url || ''}|${job.title || ''}|${job.company?.display_name || ''}`.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        console.log(`Adzuna raw jobs fetched: ${jobs.length}`);

        return jobs.slice(0, 12).map((job) => {
            const title = job.title || 'Software Engineer';
            const company = job.company?.display_name || 'Hiring Company';
            const companyType = inferCompanyType(company);
            const type = detectType(title);

            return {
                company,
                role: title,
                location: job.location?.display_name || where,
                type,
                cgpaCutoff: estimateCgpaCutoff(companyType),
                package: formatPackage(job.salary_min, job.salary_max, type),
                deadline: getDeadline(10),
                status: 'open',
                applyUrl: job.redirect_url || 'https://www.adzuna.in',
                source: 'adzuna_api',
                logo: String(company).charAt(0).toUpperCase() || 'A',
                color: '#1D4ED8',
                companyType,
                postedAt: job.created || new Date().toISOString(),
                scrapedAt: new Date().toISOString(),
            };
        });
    } catch (error) {
        console.error('Adzuna scrape failed:', error.message);
        return [];
    }
}

module.exports = scrapeAdzuna;
