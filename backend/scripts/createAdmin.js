require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const bootstrapAdmin = async () => {
    const args = process.argv.slice(2);
    const email = args[0];
    const password = args[1];
    const username = args[2] || "Admin";

    if (!process.env.MONGO_URI) {
        console.error("❌ Error: MONGO_URI is not defined in .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        if (!email) {
            console.log("\n--- Admin Management Script ---");
            console.log("Usage:");
            console.log("  Promote existing user to admin:  node scripts/createAdmin.js <email>");
            console.log("  Create a new admin user:         node scripts/createAdmin.js <email> <password> [username]\n");
            process.exit(0);
        }

        let user = await User.findOne({ email });

        if (user) {
            user.role = "admin";
            await user.save();
            console.log(`✅ Success: User '${user.username}' (${user.email}) has been updated to role 'admin'.`);
        } else {
            if (!password) {
                console.error(`❌ User with email '${email}' was not found.`);
                console.error(`To create a new admin account, please provide a password:`);
                console.error(`  node scripts/createAdmin.js ${email} <password> [username]`);
                process.exit(1);
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                username,
                email,
                password: hashedPassword,
                role: "admin",
            });
            console.log(`✅ Success: New admin user '${user.username}' (${user.email}) created successfully.`);
        }
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("Database disconnected.");
        process.exit(0);
    }
};

bootstrapAdmin();
