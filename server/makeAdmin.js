require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// 1. CHANGE THIS TO YOUR ACTUAL EMAIL REGISTERED IN THE APP
const adminEmail = 'garudkarrajan@gmail.com';

async function makeAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        const user = await User.findOneAndUpdate(
            { email: adminEmail },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`✅ Success! The user ${user.email} is now an admin.`);
        } else {
            console.log(`❌ Error: User with email "${adminEmail}" was not found! Make sure you registered on the website first.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1);
    }
}

makeAdmin();
