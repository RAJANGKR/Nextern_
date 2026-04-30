# Nextern — The Ultimate Placement Preparation Platform

Nextern is a professional, all-in-one platform designed to help students track their placement preparation, discover job opportunities, and analyze their readiness for top-tier companies.

![Nextern Preview](assets/preview.png)

## <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Key Features

### <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg> Prep Hub (Placement Prep Tracker)
- **Granular Progress**: Track your progress in DSA, DBMS, OS, Computer Networks, and OOPs.
- **Sub-task Level Tracking**: See real-time readiness updates as you complete individual sub-topics.
- **Subject Bars**: Visual progress bars for each subject to keep you motivated.

### <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Activity Feed
- Stay updated with placement news, tips from peers, and system announcements.
- Interactive posts with likes, comments, and role-based filtering.

### <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> Placement Drives
- Discover and apply to active recruitment drives.
- Filter by branch, year, and eligibility criteria.

### <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg> AI-Powered Roadmap
- Generate personalized, week-by-week study plans based on your target company and role.
- Track your journey from beginner to interview-ready.

### <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg> Resume Analyzer
- Intelligent feedback on your resume to help you stand out to recruiters.
- Suggestions for improvement based on industry standards.

## <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20M7 7h10v10H7z"/></svg> Technology Stack

- **Frontend**: HTML5, CSS3 (Modern UI with Glassmorphism), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, Google OAuth 2.0
- **Styling**: Syne & DM Sans typography, Custom CSS variables for theme management

## <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg> Recent Updates

- **Fixed Prep Hub Sync**: Resolved database synchronization issues and improved progress granularity.
- **Global Auth Utilities**: Implemented centralized `getAuthHeaders`, `syncLocalStorage`, and `handleLogout` for robust session management.
- **UI Polishing**: Enhanced the Profile and Dashboard layouts for a premium user experience.

## <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Getting Started

### Prerequisites
- Node.js installed
- MongoDB instance (local or Atlas)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/RAJANGKR/Nextern_.git
   ```
2. Install dependencies:
   ```bash
   cd server
   npm install
   ```
3. Set up environment variables in `server/.env`:
   ```env
   PORT=4000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   CLIENT_URL=http://localhost:5500
   ```
4. Start the server:
   ```bash
   npm start
   ```

## <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/></svg> Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.

---
Built with dedication for the student community.