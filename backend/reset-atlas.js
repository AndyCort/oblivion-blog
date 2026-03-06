const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://oblivion-andycort:8zMeFH7PZ7PpHTyb@oblivion.pjxdstf.mongodb.net/oblivion?retryWrites=true&w=majority&appName=Oblivion';

(async () => {
    try {
        console.log('Connecting to Atlas...');
        await mongoose.connect(uri);
        console.log('Connected!');
        const User = mongoose.model('User', new mongoose.Schema({ username: String, password: String }));
        const users = await User.find({});
        if (!users.length) { console.log('No users found'); process.exit(0); }
        const admin = users[0];
        console.log('Found user:', admin.username);
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash('admin', salt);
        await admin.save();
        console.log('✅ Password reset to: admin');
        process.exit(0);
    } catch (e) { console.error('Error:', e.message); process.exit(1); }
})();
