require('dotenv').config();
const { connectMongo } = require('./utils/mongo');
const UserModel = require('./models/User.model');

async function checkUsers() {
  try {
    await connectMongo();
    console.log('Connected to MongoDB.');

    const users = await UserModel.find({});
    console.log('Registered Users:');
    users.forEach(u => {
      console.log(`- Email: ${u.email}`);
      console.log(`  ID: ${u._id}`);
      console.log('----------------------------------------');
    });

    process.exit(0);
  } catch (err) {
    console.error('Error fetching users:', err);
    process.exit(1);
  }
}

checkUsers();
