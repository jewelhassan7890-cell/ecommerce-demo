import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, HelpCircle } from "lucide-react";

const SERVER_URL = import.meta.env.VITE_API_URL || "https://ecommerce-demo-ro6m48tke-style-and-closet.vercel.app";

const FaqSection = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await axios.get(`${SERVER_URL}/faq`);
                setFaqs(res.data?.data || []);
            } catch (error) {
                console.error("Error fetching FAQs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Unique Categories Extract
    const categories = ["All", ...new Set(faqs.map((faq) => faq.category || "General"))];

    const filteredFaqs = selectedCategory === "All"
        ? faqs
        : faqs.filter((faq) => (faq.category || "General") === selectedCategory);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <section className="max-w-4xl mx-auto px-4 py-10">
            <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                    <HelpCircle className="w-7 h-7 text-indigo-600" />
                    Frequently Asked Questions
                </h2>
                <p className="text-gray-500 text-sm sm:text-base mt-2">
                    আপনার যেকোনো সাধারণ প্রশ্নের উত্তর এখানে পেয়ে যাবেন
                </p>
            </div>

            {/* Category Tabs */}
            {categories.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {categories.map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 text-sm rounded-full transition-colors duration-200 ${selectedCategory === cat
                                ? "bg-indigo-600 text-white font-medium"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Accordion List */}
            <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, index) => (
                        <div key={faq._id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <span className="pr-4 text-sm sm:text-base">{faq.question}</span>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-500 shrink-0 transform transition-transform duration-200 ${openIndex === index ? "rotate-180 text-indigo-600" : ""
                                        }`}
                                />
                            </button>
                            {openIndex === index && (
                                <div className="p-4 bg-gray-50 border-t border-gray-100 text-gray-600 text-sm sm:text-base leading-relaxed">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-6">কোনো প্রশ্ন পাওয়া যায়নি।</p>
                )}
            </div>
        </section>
    );
};

export default FaqSection;