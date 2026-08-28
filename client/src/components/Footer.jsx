import React from "react";
import {
    FaFacebookF,
    FaInstagram,
    FaWhatsapp,
    FaFacebookMessenger,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-5 py-6">

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Left Menu */}
                    <ul className="flex flex-wrap justify-center gap-6 text-sm text-gray-700 font-medium">
                        <li>
                            <Link to="/" className="hover:text-red-500 duration-300">
                                Home
                            </Link>
                        </li>

                        <li>


                            <Link to="/shop" className="hover:text-red-500 duration-300">
                                Shop
                            </Link>
                        </li>

                        <li>


                            <Link to="/contact" className="hover:text-red-500 duration-300">
                                Contact
                            </Link>
                        </li>

                        <li>


                            <Link to="/faq" className="hover:text-red-500 duration-300">
                                FAQs
                            </Link>
                        </li>

                        <li>

                            <Link to="/privacy" className="hover:text-red-500 duration-300">
                                Privacy Policy
                            </Link>


                        </li>
                    </ul>

                    {/* Social Icons */}
                    <div className="flex items-center gap-5 text-lg text-gray-800">

                        <a href="https://www.facebook.com/share/1DFs6eeDch/" className="hover:text-blue-600 duration-300">
                            <FaFacebookF />
                        </a>

                        <a href="https://www.instagram.com/style_closet345?igsh=MTQxd2ExdTk3czk5bw==" className="hover:text-pink-600 duration-300">
                            <FaInstagram />
                        </a>

                        <a href="https://wa.me/8801301002648" className="hover:text-green-500 duration-300">
                            <FaWhatsapp />
                        </a>

                        <a href="https://m.me/stylecloset624" className="hover:text-blue-500 duration-300">
                            <FaFacebookMessenger />
                        </a>

                    </div>

                    {/* Copyright */}
                    <p className="text-sm text-gray-600 text-center md:text-right">
                        © 2026 Style & Closet. All rights reserved.
                    </p>

                </div>

            </div>
        </footer>
    );
}

export default Footer;
