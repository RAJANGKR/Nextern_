# Nextern — The Ultimate Placement Preparation Platform

Nextern is a professional, all-in-one platform designed to help students track their placement preparation, discover job opportunities, and analyze their readiness for top-tier companies.

![Nextern Preview](assets/preview.png)

## 🚀 Key Features

### 📡 Prep Hub (Placement Prep Tracker)
- **Granular Progress**: Track your progress in DSA, DBMS, OS, Computer Networks, and OOPs.
- **Sub-task Level Tracking**: See real-time readiness updates as you complete individual sub-topics.
- **Subject Bars**: Visual progress bars for each subject to keep you motivated.

### 📰 Activity Feed
- Stay updated with placement news, tips from peers, and system announcements.
- Interactive posts with likes, comments, and role-based filtering.

### 🏢 Placement Drives
- Discover and apply to active recruitment drives.
- Filter by branch, year, and eligibility criteria.

### 🗺️ AI-Powered Roadmap
- Generate personalized, week-by-week study plans based on your target company and role.
- Track your journey from beginner to interview-ready.

### 📄 Resume Analyzer
- Intelligent feedback on your resume to help you stand out to recruiters.
- Suggestions for improvement based on industry standards.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Modern UI with Glassmorphism), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, Google OAuth 2.0
- **Styling**: Syne & DM Sans typography, Custom CSS variables for theme management

## 📦 Recent Updates

- **Fixed Prep Hub Sync**: Resolved database synchronization issues and improved progress granularity.
- **Global Auth Utilities**: Implemented centralized `getAuthHeaders`, `syncLocalStorage`, and `handleLogout` for robust session management.
- **UI Polishing**: Enhanced the Profile and Dashboard layouts for a premium user experience.

## 🚦 Getting Started

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

## 🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.

---
Built with ❤️ for the student community.
