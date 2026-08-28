import React, { useState, useEffect } from "react";
import API from "../api/axios";

const PrivacyPolicy = () => {
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPrivacyPolicy = async () => {
            try {
                const response = await API.get("/privacy-policy");
                setPolicy(response.data.data);
            } catch (err) {
                setError("Failed to load Privacy Policy. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchPrivacyPolicy();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <p className="text-red-500 text-sm font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
                {/* Company Header */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Privacy Policy
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mb-6 border-b pb-4">
                    Last updated: {new Date(policy?.updatedAt || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>

                <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed">
                    This Privacy Policy describes how <span className="font-semibold text-gray-800">{policy?.companyName || "Style & Closet"}</span> (“we”, “our”, or “us”) collects, uses, and protects your information when you interact with our e-commerce platform.
                </p>

                {/* Dynamic Sections */}
                <div className="space-y-8 text-gray-700">
                    {policy?.sections?.map((section, index) => (
                        <section key={section._id || index} className="space-y-2">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900">
                                {index + 1}. {section.title}
                            </h2>
                            <p className="text-sm sm:text-base leading-relaxed text-gray-600">
                                {section.content}
                            </p>
                            {section.bullets && section.bullets.length > 0 && (
                                <ul className="list-disc list-inside space-y-1.5 pl-2 text-sm sm:text-base text-gray-600">
                                    {section.bullets.map((bullet, idx) => (
                                        <li key={idx}>{bullet}</li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}

                    {/* Contact Us Section */}
                    <section className="pt-4 border-t border-gray-100">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                            Contact Us
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mb-2">
                            If you have any questions or concerns regarding our privacy policies, please contact us at:
                        </p>
                        <a
                            href={`mailto:${policy?.supportEmail}`}
                            className="text-blue-600 hover:underline font-medium text-sm sm:text-base inline-flex items-center gap-1.5"
                        >
                            ✉️ {policy?.supportEmail || "support@styleandcloset.com"}
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;