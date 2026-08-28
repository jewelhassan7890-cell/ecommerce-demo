const mongoose = require("mongoose");

const restockAlertSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Customer name is required"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        dressCode: {
            type: String,
            required: [true, "Dress code/SKU is required"],
            uppercase: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Notified", "Cancelled"],
            default: "Pending",
        },
        notifiedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Unique compound index (একই নম্বর থেকে একই ড্রেস কোডে বারবার রিকুয়েস্ট বন্ধ করতে)
restockAlertSchema.index({ phone: 1, dressCode: 1 }, { unique: true });

module.exports = mongoose.model("RestockAlert", restockAlertSchema);