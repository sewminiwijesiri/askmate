import { connectDB } from "./src/lib/db.js";
import Notification from "./src/models/Notification.js";
import mongoose from "mongoose";

async function check() {
    await connectDB();
    const count = await Notification.countDocuments();
    console.log("Total Notifications in DB:", count);
    const all = await Notification.find().limit(5).sort({createdAt:-1});
    console.log("Latest ones:", JSON.stringify(all, null, 2));
    process.exit(0);
}

check();
