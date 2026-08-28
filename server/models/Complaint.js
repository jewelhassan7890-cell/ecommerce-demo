const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "আপনার নাম দেওয়া বাধ্যতামূলক"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "আপনার মোবাইল নম্বর দেওয়া বাধ্যতামূলক"],
            trim: true,
        },
        message: {
            type: String,
            required: [true, "অভিযোগের বিস্তারিত লেখা বাধ্যতামূলক"],
            trim: true,
        },
        attachment: {
            url: { type: String, default: "" },
            public_id: { type: String, default: "" },
        },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Resolved", "Rejected"],
            default: "Pending",
        },
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);