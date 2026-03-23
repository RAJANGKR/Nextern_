/* ================================================================
   scraper/seedDrives.js
   35 realistic Indian placement drives — seeded data
   Mixed with real scraped data to give a full drives list
================================================================ */

function getDeadline(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
}

const seedDrives = [
    // ── PRODUCT COMPANIES ──
    {
        company: 'Flipkart', role: 'SDE — 1', location: 'Bangalore, India',
        type: 'Full Time', cgpaCutoff: 7.0, package: '₹28-32 LPA',
        deadline: getDeadline(8), status: 'open',
        applyUrl: 'https://www.flipkartcareers.com', source: 'seed',
        logo: 'F', color: '#F7931E', companyType: 'product', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Razorpay', role: 'Backend Engineer', location: 'Bangalore / Remote',
        type: 'Full Time', cgpaCutoff: 6.5, package: '₹18-22 LPA',
        deadline: getDeadline(5), status: 'open',
        applyUrl: 'https://razorpay.com/jobs', source: 'seed',
        logo: 'R', color: '#3395FF', companyType: 'startup', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Swiggy', role: 'SDE Intern', location: 'Bangalore, India',
        type: 'Internship', cgpaCutoff: 7.0, package: '₹50K/month',
        deadline: getDeadline(12), status: 'open',
        applyUrl: 'https://careers.swiggy.com', source: 'seed',
        logo: 'S', color: '#FC8019', companyType: 'startup', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Zomato', role: 'Software Engineer', location: 'Gurgaon, India',
        type: 'Full Time', cgpaCutoff: 7.0, package: '₹15-20 LPA',
        deadline: getDeadline(15), status: 'open',
        applyUrl: 'https://www.zomato.com/careers', source: 'seed',
        logo: 'Z', color: '#E23744', companyType: 'startup', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Meesho', role: 'Data Analyst', location: 'Bangalore, India',
        type: 'Full Time', cgpaCutoff: 7.0, package: '₹14-18 LPA',
        deadline: getDeadline(6), status: 'open',
        applyUrl: 'https://meesho.io/jobs', source: 'seed',
        logo: 'Me', color: '#8B2FC9', companyType: 'startup', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'PhonePe', role: 'SDE — 1', location: 'Bangalore, India',
        type: 'Full Time', cgpaCutoff: 7.5, package: '₹20-28 LPA',
        deadline: getDeadline(18), status: 'open',
        applyUrl: 'https://www.phonepe.com/careers', source: 'seed',
        logo: 'P', color: '#5F259F', companyType: 'startup', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'CRED', role: 'Backend Engineer Intern', location: 'Bangalore, India',
        type: 'Internship', cgpaCutoff: 7.5, package: '₹60K/month',
        deadline: getDeadline(9), status: 'open',
        applyUrl: 'https://careers.cred.club', source: 'seed',
        logo: 'C', color: '#1A1A2E', companyType: 'startup', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Paytm', role: 'Software Engineer', location: 'Noida, India',
        type: 'Full Time', cgpaCutoff: 6.5, package: '₹10-15 LPA',
        deadline: getDeadline(22), status: 'open',
        applyUrl: 'https://paytm.com/careers', source: 'seed',
        logo: 'Pa', color: '#00BAF2', companyType: 'startup', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Atlassian', role: 'SDE Intern', location: 'Bangalore, India',
        type: 'Internship', cgpaCutoff: 8.0, package: '₹90K/month',
        deadline: getDeadline(25), status: 'open',
        applyUrl: 'https://www.atlassian.com/company/careers', source: 'seed',
        logo: 'A', color: '#0052CC', companyType: 'product', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Adobe', role: 'Computer Scientist Intern', location: 'Noida, India',
        type: 'Internship', cgpaCutoff: 8.0, package: '₹85K/month',
        deadline: getDeadline(30), status: 'open',
        applyUrl: 'https://adobe.com/careers', source: 'seed',
        logo: 'Ad', color: '#FF0000', companyType: 'product', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Amazon', role: 'SDE Intern', location: 'Hyderabad, India',
        type: 'Internship', cgpaCutoff: 7.5, package: '₹85K/month',
        deadline: getDeadline(14), status: 'open',
        applyUrl: 'https://amazon.jobs', source: 'seed',
        logo: 'Am', color: '#FF9900', companyType: 'product', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Samsung R&D', role: 'Software Engineer', location: 'Bangalore / Noida',
        type: 'Full Time', cgpaCutoff: 7.0, package: '₹14-18 LPA',
        deadline: getDeadline(20), status: 'open',
        applyUrl: 'https://samsung.com/in/careers', source: 'seed',
        logo: 'Sa', color: '#1428A0', companyType: 'product', scrapedAt: new Date().toISOString(),
    },

    // ── SERVICE COMPANIES ──
    {
        company: 'TCS', role: 'System Engineer', location: 'Pan India',
        type: 'Full Time', cgpaCutoff: 6.0, package: '₹3.36 LPA',
        deadline: getDeadline(1), status: 'closing',
        applyUrl: 'https://nextstep.tcs.com', source: 'seed',
        logo: 'T', color: '#1C3C78', companyType: 'service', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Infosys', role: 'Systems Engineer', location: 'Pan India',
        type: 'Full Time', cgpaCutoff: 6.0, package: '₹3.6 LPA',
        deadline: getDeadline(18), status: 'open',
        applyUrl: 'https://infosys.com/careers', source: 'seed',
        logo: 'I', color: '#007CC3', companyType: 'service', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Wipro', role: 'Project Engineer', location: 'Pan India',
        type: 'Full Time', cgpaCutoff: 6.0, package: '₹3.5 LPA',
        deadline: getDeadline(25), status: 'open',
        applyUrl: 'https://careers.wipro.com', source: 'seed',
        logo: 'W', color: '#341C66', companyType: 'service', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'HCL Technologies', role: 'Graduate Engineer Trainee', location: 'Pan India',
        type: 'Full Time', cgpaCutoff: 6.0, package: '₹3.8 LPA',
        deadline: getDeadline(30), status: 'open',
        applyUrl: 'https://hcltech.com/careers', source: 'seed',
        logo: 'H', color: '#0076C0', companyType: 'service', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Cognizant', role: 'Programmer Analyst', location: 'Pan India',
        type: 'Full Time', cgpaCutoff: 6.0, package: '₹4 LPA',
        deadline: getDeadline(22), status: 'open',
        applyUrl: 'https://careers.cognizant.com', source: 'seed',
        logo: 'Co', color: '#1263B1', companyType: 'service', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Accenture', role: 'Associate Software Engineer', location: 'Pan India',
        type: 'Full Time', cgpaCutoff: 6.0, package: '₹4.5 LPA',
        deadline: getDeadline(28), status: 'open',
        applyUrl: 'https://accenture.com/in-en/careers', source: 'seed',
        logo: 'Ac', color: '#A100FF', companyType: 'service', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Capgemini', role: 'Analyst', location: 'Pan India',
        type: 'Full Time', cgpaCutoff: 6.0, package: '₹3.8 LPA',
        deadline: getDeadline(35), status: 'open',
        applyUrl: 'https://capgemini.com/careers', source: 'seed',
        logo: 'Ca', color: '#0070AD', companyType: 'service', scrapedAt: new Date().toISOString(),
    },

    // ── FINANCE / BFSI ──
    {
        company: 'Goldman Sachs', role: 'Technology Analyst', location: 'Bangalore / Mumbai',
        type: 'Full Time', cgpaCutoff: 8.0, package: '₹12-18 LPA',
        deadline: getDeadline(35), status: 'open',
        applyUrl: 'https://goldmansachs.com/careers', source: 'seed',
        logo: 'GS', color: '#1A1A2E', companyType: 'finance', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'HDFC Bank', role: 'IT Analyst — Fresher', location: 'Mumbai / Pune',
        type: 'Full Time', cgpaCutoff: 7.5, package: '₹6.5 LPA',
        deadline: getDeadline(40), status: 'open',
        applyUrl: 'https://hdfcbank.com/careers', source: 'seed',
        logo: 'HD', color: '#004C8F', companyType: 'finance', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'JPMorgan Chase', role: 'Software Engineer', location: 'Bangalore / Mumbai',
        type: 'Full Time', cgpaCutoff: 7.5, package: '₹15-20 LPA',
        deadline: getDeadline(32), status: 'open',
        applyUrl: 'https://jpmorgan.com/careers', source: 'seed',
        logo: 'JP', color: '#003087', companyType: 'finance', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Deutsche Bank', role: 'Technology Intern', location: 'Pune / Bangalore',
        type: 'Internship', cgpaCutoff: 7.5, package: '₹70K/month',
        deadline: getDeadline(18), status: 'open',
        applyUrl: 'https://db.com/careers', source: 'seed',
        logo: 'DB', color: '#0018A8', companyType: 'finance', scrapedAt: new Date().toISOString(),
    },

    // ── MORE STARTUPS ──
    {
        company: 'Groww', role: 'SDE — 1', location: 'Bangalore, India',
        type: 'Full Time', cgpaCutoff: 7.0, package: '₹18-25 LPA',
        deadline: getDeadline(10), status: 'open',
        applyUrl: 'https://groww.in/careers', source: 'seed',
        logo: 'Gr', color: '#00D09C', companyType: 'startup', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Zepto', role: 'Backend Engineer', location: 'Mumbai, India',
        type: 'Full Time', cgpaCutoff: 7.0, package: '₹18-22 LPA',
        deadline: getDeadline(12), status: 'open',
        applyUrl: 'https://www.zeptonow.com/careers', source: 'seed',
        logo: 'Ze', color: '#9B59B6', companyType: 'startup', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Juspay', role: 'Software Developer', location: 'Bangalore, India',
        type: 'Full Time', cgpaCutoff: 7.0, package: '₹12-16 LPA',
        deadline: getDeadline(15), status: 'open',
        applyUrl: 'https://juspay.in/careers', source: 'seed',
        logo: 'J', color: '#2C3E50', companyType: 'startup', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Postman', role: 'SDE Intern', location: 'Bangalore, India',
        type: 'Internship', cgpaCutoff: 7.5, package: '₹70K/month',
        deadline: getDeadline(20), status: 'open',
        applyUrl: 'https://postman.com/company/careers', source: 'seed',
        logo: 'Po', color: '#FF6C37', companyType: 'product', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Freshworks', role: 'Software Engineer', location: 'Chennai, India',
        type: 'Full Time', cgpaCutoff: 7.0, package: '₹10-14 LPA',
        deadline: getDeadline(25), status: 'open',
        applyUrl: 'https://careers.freshworks.com', source: 'seed',
        logo: 'Fr', color: '#2CA01C', companyType: 'product', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'BrowserStack', role: 'SDE Intern', location: 'Mumbai, India',
        type: 'Internship', cgpaCutoff: 7.5, package: '₹65K/month',
        deadline: getDeadline(22), status: 'open',
        applyUrl: 'https://browserstack.com/careers', source: 'seed',
        logo: 'Br', color: '#FF6600', companyType: 'product', scrapedAt: new Date().toISOString(),
    },
    {
        company: 'Nutanix', role: 'Member of Technical Staff', location: 'Bangalore, India',
        type: 'Full Time', cgpaCutoff: 7.5, package: '₹20-28 LPA',
        deadline: getDeadline(28), status: 'open',
        applyUrl: 'https://nutanix.com/careers', source: 'seed',
        logo: 'N', color: '#024DA1', companyType: 'product', scrapedAt: new Date().toISOString(),
    },
];

module.exports = seedDrives;