const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = "mongodb+srv://vubinh2005mt_db_user:Binhaz19.@rika-quy-tsnt.0mpahbo.mongodb.net/ai-interview?appName=RIKA-Quy-TSNT";

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  isVip: Boolean,
});

const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB!");
    
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- Name: ${u.fullName}, Email: ${u.email}, isVip: ${u.isVip}`);
    });
    
    // Automatically set all users to VIP for testing, or set specific user
    console.log("\nSetting all users to isVip: true for testing...");
    const result = await User.updateMany({}, { isVip: true });
    console.log(`Updated ${result.modifiedCount} users to VIP.`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkUsers();
