// const resend = require("../config/resend");

// const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
// const APP_NAME = process.env.APP_NAME || "Style & Closet";

// // Core Generic Send Function
// const sendMail = async ({ to, subject, html, replyTo }) => {
//     try {
//         const payload = {
//             from: `${APP_NAME} <${FROM_EMAIL}>`,
//             to: Array.isArray(to) ? to : [to],
//             subject,
//             html,
//         };

//         if (replyTo) {
//             payload.reply_to = replyTo;
//         }

//         const { data, error } = await resend.emails.send(payload);

//         if (error) {
//             console.error("Resend API Error:", error);
//             return { success: false, error };
//         }

//         return { success: true, data };
//     } catch (err) {
//         console.error("Unexpected Email Exception:", err.message);
//         return { success: false, error: err.message };
//     }
// };

// // Admin Notification Template
// exports.sendAdminContactNotification = async (contactData) => {
//     const adminEmail = process.env.ADMIN_EMAIL;
//     if (!adminEmail) return;

//     const html = `
//         <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
//             <h2 style="color: #111827;">New Contact Submission</h2>
//             <p><strong>Name:</strong> ${contactData.fullName}</p>
//             <p><strong>Email:</strong> ${contactData.email}</p>
//             <p><strong>Phone:</strong> ${contactData.phone || "N/A"}</p>
//             <p><strong>Subject:</strong> ${contactData.subject}</p>
//             <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
//             <p><strong>Message:</strong></p>
//             <blockquote style="background: #f9fafb; padding: 12px; border-left: 4px solid #2563eb; margin: 0;">
//                 ${contactData.message}
//             </blockquote>
//         </div>
//     `;

//     return await sendMail({
//         to: adminEmail,
//         subject: `[Contact Form] ${contactData.subject}`,
//         html,
//         replyTo: contactData.email,
//     });
// };

// // Customer Reply Template
// exports.sendCustomerReplyEmail = async ({ customerEmail, customerName, subject, replyMessage, originalMessage }) => {
//     const html = `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; padding: 20px;">
//             <p>Hi <strong>${customerName}</strong>,</p>
//             <p>${replyMessage}</p>
//             <br />
//             <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
//             <p style="color: #6b7280; font-size: 13px; margin-bottom: 5px;"><strong>Your Original Message:</strong></p>
//             <blockquote style="color: #4b5563; font-size: 13px; background: #f3f4f6; padding: 10px 15px; border-left: 3px solid #9ca3af; margin: 0;">
//                 ${originalMessage}
//             </blockquote>
//             <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">Best regards,<br/>Support Team - ${APP_NAME}</p>
//         </div>
//     `;

//     return await sendMail({
//         to: customerEmail,
//         subject: `Re: ${subject}`,
//         html,
//     });
// };


const resend = require("../config/resend");

// Default to Resend's free testing email if ENV isn't set
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const APP_NAME = process.env.APP_NAME || "Style & Closet";

// Core Generic Send Function
const sendMail = async ({ to, subject, html, replyTo }) => {
    try {
        const payload = {
            from: `${APP_NAME} <${FROM_EMAIL}>`,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        };

        // FIX: Resend Node.js SDK uses `replyTo` (camelCase) instead of `reply_to`
        if (replyTo) {
            payload.replyTo = replyTo;
        }

        const { data, error } = await resend.emails.send(payload);

        if (error) {
            console.error("Resend API Error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error("Unexpected Email Exception:", err.message);
        return { success: false, error: err.message };
    }
};

// Admin Notification Template
exports.sendAdminContactNotification = async (contactData) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #111827;">New Contact Submission</h2>
            <p><strong>Name:</strong> ${contactData.fullName}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Phone:</strong> ${contactData.phone || "N/A"}</p>
            <p><strong>Subject:</strong> ${contactData.subject}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
            <p><strong>Message:</strong></p>
            <blockquote style="background: #f9fafb; padding: 12px; border-left: 4px solid #2563eb; margin: 0;">
                ${contactData.message}
            </blockquote>
        </div>
    `;

    return await sendMail({
        to: adminEmail,
        subject: `[Contact Form] ${contactData.subject}`,
        html,
        replyTo: contactData.email,
    });
};

// Customer Reply Template
exports.sendCustomerReplyEmail = async ({ customerEmail, customerName, subject, replyMessage, originalMessage }) => {
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; padding: 20px;">
            <p>Hi <strong>${customerName}</strong>,</p>
            <p>${replyMessage}</p>
            <br />
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 5px;"><strong>Your Original Message:</strong></p>
            <blockquote style="color: #4b5563; font-size: 13px; background: #f3f4f6; padding: 10px 15px; border-left: 3px solid #9ca3af; margin: 0;">
                ${originalMessage}
            </blockquote>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">Best regards,<br/>Support Team - ${APP_NAME}</p>
        </div>
    `;

    return await sendMail({
        to: customerEmail,
        subject: `Re: ${subject}`,
        html,
    });
};