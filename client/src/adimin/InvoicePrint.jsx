import React from "react";
import html2pdf from "html2pdf.js";
import { FiPrinter, FiDownload, FiX } from "react-icons/fi";

const InvoicePrint = ({ order, onClose }) => {
    if (!order) return null;

    // ১. ব্রাউজার দিয়ে শুধু ইনভয়েস পার্ট প্রিন্ট করা (Clean Printing)
    const handlePrint = () => {
        const printContent = document.getElementById("invoice-content");
        if (!printContent) return;

        // প্রিন্টের জন্য আলাদা আইফ্রেম তৈরি
        const iframe = document.createElement("iframe");
        iframe.style.position = "absolute";
        iframe.style.width = "0px";
        iframe.style.height = "0px";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
            <html>
                <head>
                    <title>Invoice - ${order.orderNumber || order._id?.slice(-8)}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { font-family: sans-serif; background: #fff; padding: 20px; }
                        @media print {
                            @page { margin: 10mm; size: auto; }
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.outerHTML}
                    <script>
                        window.onload = function() {
                            window.focus();
                            window.print();
                            setTimeout(() => {
                                window.frameElement.remove();
                            }, 1000);
                        };
                    </script>
                </body>
            </html>
        `);
        iframeDoc.close();
    };

    // ২. html2pdf.js দিয়ে PDF ডাউনলোড করা (oklch error fixed)
    const handleDownloadPDF = () => {
        const element = document.getElementById("invoice-content");

        const options = {
            margin: [10, 10, 10, 10],
            filename: `Invoice_${order.orderNumber || order._id?.slice(-8)}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    // ১. ক্লোন করা ডকুমেন্টের সব CSS শৈলী থেকে oklch রিমুভ করার জন্য গ্লোবাল স্টাইল ইনজেক্ট
                    const styleNode = clonedDoc.createElement('style');
                    styleNode.innerHTML = `
                    * {
                        color: #1f2937 !important;
                        background-color: #ffffff !important;
                        border-color: #e5e7eb !important;
                        box-shadow: none !important;
                        text-shadow: none !important;
                    }
                    /* নির্দিষ্ট টেবিল ও হেডারের ব্যাকগ্রাউন্ড ঠিক রাখা */
                    .bg-gray-100, th { background-color: #f3f4f6 !important; }
                    .bg-gray-50 { background-color: #f9fafb !important; }
                    .text-green-600 { color: #16a34a !important; }
                    .text-[#1b2a57] { color: #1b2a57 !important; }
                `;
                    clonedDoc.head.appendChild(styleNode);
                }
            },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        };

        html2pdf().set(options).from(element).save();
    };



    const itemsList = order.products || order.items || order.orderItems || [];
    const customerName = order.shipping?.fullName || order.customer?.name || "Guest Customer";
    const customerPhone = order.shipping?.phone || order.customer?.phone || "N/A";
    const customerEmail = order.customer?.email || order.shipping?.email || "N/A";
    const shippingAddress = order.shipping?.address || order.shippingAddress || "N/A";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">

                {/* অ্যাকশন বার */}
                <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-base">Invoice Preview</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2a57] text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition"
                        >
                            <FiPrinter /> Print Invoice
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition"
                        >
                            <FiDownload /> Download PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            <FiX className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* মূল ইনভয়েস কনটেন্ট */}
                <div className="p-8 overflow-y-auto space-y-6 text-gray-800 bg-white" id="invoice-content">

                    {/* ইনভয়েস হেডার */}
                    <div className="flex justify-between items-start border-b pb-6">
                        <div>
                            <h1 className="text-2xl font-black text-[#1b2a57] tracking-wider uppercase">INVOICE</h1>
                            <p className="text-xs text-gray-500 mt-1">
                                Invoice No: <span className="font-mono font-bold text-gray-700">#{order.orderNumber || order._id?.slice(-8)}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                                Date: {new Date(order?.createdAt || undefined).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-800">Style & Closet</h2>
                            <p className="text-xs text-gray-500">Dhaka, Bangladesh</p>
                            <p className="text-xs text-gray-500">Support: +880 1701-002648</p>
                            <p className="text-xs text-gray-500">Email: stylecloset624@gmail.com</p>
                        </div>
                    </div>

                    {/* গ্রাহক ও শিপিং তথ্য */}
                    <div className="grid grid-cols-2 gap-6 text-xs">
                        <div className="bg-gray-50 p-4 rounded-xl border">
                            <p className="font-bold text-gray-700 uppercase mb-1">Billed To / Customer:</p>
                            <p className="font-semibold text-gray-800 text-sm">{customerName}</p>
                            <p className="text-gray-600 mt-0.5">{customerPhone}</p>
                            <p className="text-gray-600">{customerEmail}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border">
                            <p className="font-bold text-gray-700 uppercase mb-1">Shipping Address:</p>
                            <p className="text-gray-700 leading-relaxed">{shippingAddress}</p>
                            <p className="text-gray-500 mt-1">
                                Payment Method: <span className="font-bold uppercase text-gray-800">{order.payment?.method || order.paymentMethod || "COD"}</span>
                            </p>
                        </div>
                    </div>

                    {/* প্রডাক্ট টেবিল */}
                    <div>
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700 uppercase font-semibold border-b">
                                    <th className="p-3">#</th>
                                    <th className="p-3">Item Description</th>
                                    <th className="p-3 text-center">Price</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {itemsList.map((item, index) => {
                                    const qty = item.quantity || item.qty || 1;
                                    const price = item.price || item.unitPrice || 0;
                                    return (
                                        <tr key={index}>
                                            <td className="p-3 text-gray-500">{index + 1}</td>
                                            <td className="p-3 font-medium text-gray-800">
                                                <span>{item.name || item.title || item.product?.name || "Product Item"}</span>
                                            </td>
                                            <td className="p-3 text-center">৳{price}</td>
                                            <td className="p-3 text-center">{qty}</td>
                                            <td className="p-3 text-right font-semibold">৳{qty * price}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* মোট হিসাব (Total Calculations) */}
                    <div className="flex justify-between items-start pt-4 border-t text-xs">
                        <div className="max-w-[250px] space-y-1">
                            <p className="font-semibold text-gray-700">
                                Payment Status: <span className="uppercase text-green-600 font-bold">{order.payment?.status || order.paymentStatus || "Pending"}</span>
                            </p>
                            <p className="text-gray-500 italic">Thank you for shopping with us!</p>
                        </div>
                        <div className="w-60 space-y-2 text-right">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal:</span>
                                <span>৳{order.subtotal || order.totalAmount || 0}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Fee:</span>
                                <span>৳{order.shippingCharge || order.shippingFee || 0}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount:</span>
                                    <span>-৳{order.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-gray-900 text-sm pt-2 border-t">
                                <span>Grand Total:</span>
                                <span>৳{order.grandTotal || order.totalAmount || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* ইনভয়েস ফুটার */}
                    <div className="pt-12 border-t flex justify-between items-center text-[10px] text-gray-400">
                        <div>
                            <p>Computer generated invoice, no signature required.</p>
                        </div>
                        <div className="text-center">
                            <div className="border-b border-gray-300 w-32 mb-1"></div>
                            <p>Authorized Signature</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default InvoicePrint;