const mongoose = require("mongoose");

// ==========================================
// Connect MongoDB
// ==========================================

const connectDB = async () => {

    try {

        const connection = await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("");

        console.log("======================================");

        console.log("✅ MongoDB Connected Successfully");

        console.log(`🌐 Host : ${connection.connection.host}`);

        console.log(`📦 Database : ${connection.connection.name}`);

        console.log("======================================");

        console.log("");

    } catch (error) {

        console.error("");

        console.error("======================================");

        console.error("❌ MongoDB Connection Failed");

        console.error(error.message);

        console.error("======================================");

        console.error("");

        process.exit(1);

    }

};

// ==========================================
// Connection Events
// ==========================================

mongoose.connection.on("connected", () => {

    console.log("🟢 MongoDB Connected");

});

mongoose.connection.on("error", (error) => {

    console.error("🔴 MongoDB Error:", error.message);

});

mongoose.connection.on("disconnected", () => {

    console.log("🟠 MongoDB Disconnected");

});

// ==========================================
// Graceful Shutdown
// ==========================================

process.on("SIGINT", async () => {

    await mongoose.connection.close();

    console.log("");

    console.log("🛑 MongoDB Connection Closed");

    console.log("🛑 Server Shutdown");

    process.exit(0);

});

module.exports = connectDB;