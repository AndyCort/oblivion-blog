require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const resetPassword = async () => {
    // Read local MONGO_URI
    const uri = process.env.MONGO_URI || 'mongodb+srv://oblivion-andycort:8zMeFH7PZ7PpHTyb@oblivion.pjxdstf.mongodb.net/?appName=Oblivion';

    try {
        console.log(`Connecting to database at ${uri.replace(/:([^@]+)@/, ':****@')} ...`);
        await mongoose.connect(uri);
        console.log('Connected! ');

        const UserSchema = new mongoose.Schema({
            username: { type: String, required: true },
            password: { type: String, required: true }
        });
        const User = mongoose.model('User', UserSchema);

        const users = await User.find({});
        if (users.length === 0) {
            console.log('No users found in the database. Are you sure the site was installed?');
            process.exit(0);
        }

        const admin = users[0];
        console.log(`Found user: ${admin.username}`);

        // Generate new password hash
        const newPassword = 'admin';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        admin.password = hashedPassword;
        await admin.save();

        console.log(`\n✅ Password successfully reset for user "${admin.username}"!`);
        console.log(`👉 New Password is: ${newPassword}`);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

resetPassword();
