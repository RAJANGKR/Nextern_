require('dotenv').config();
const mongoose = require('mongoose');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');
        
        const User = require('./models/User');
        const users = await User.find({});
        
        console.log('--- USERS LIST ---');
        users.forEach(u => {
            console.log(`- Email: ${u.email}`);
            console.log(`  Name: ${u.firstName} ${u.lastName}`);
            console.log(`  GoogleID: ${u.googleId || 'None'}`);
            console.log(`  College: ${u.college || 'MISSING'}`);
            console.log(`  Has Password: ${u.password ? 'Yes' : 'No'}`);
            console.log('  ------------------');
        });
        console.log('------------------');
        console.log(`Total users: ${users.length}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkUsers();
