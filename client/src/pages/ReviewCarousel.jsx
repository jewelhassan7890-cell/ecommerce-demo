import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
const VITE_API_URL = import.meta.env.VITE_API_URL || "https://ecommerce-demo-ro6m48tke-style-and-closet.vercel.app";
const ReviewCarousel = () => {
    const [carousels, setCarousels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCarousels = async () => {
            try {
                // VITE_API_URL ব্যাকটিক્સ (Template Literals) দিয়ে ডায়নামিক করা হয়েছে
                const res = await axios.get(`${VITE_API_URL}/carousel`);

                if (res.data.success) {
                    setCarousels(res.data.data);
                }
            } catch (error) {
                console.error('Error fetching carousels:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCarousels();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48 sm:h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (carousels.length === 0) return null;

    return (
        <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                        Happy Customers, Beautiful Stories ✨
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        Hear what our happy customers say about their shopping experience.
                    </p>
                    <div className="w-16 h-1 bg-red-500 mx-auto mt-3 rounded-full"></div>
                </div>

                {/* Swiper Carousel */}
                <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={16}
                    slidesPerView={1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    navigation={true}
                    breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 20 },
                        1024: { slidesPerView: 3, spaceBetween: 24 },
                        1280: { slidesPerView: 4, spaceBetween: 24 },
                    }}
                    className="pb-12 !px-2"
                >
                    {carousels.map((item) => (
                        <SwiperSlide key={item._id}>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
                                <img
                                    src={item.imageUrl}
                                    alt={item.title || 'Customer Feedback'}
                                    className="w-full h-64 sm:h-72 object-cover object-center transform hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                {item.title && (
                                    <div className="p-3 text-center bg-white dark:bg-gray-800">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                            {item.title}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default ReviewCarousel;