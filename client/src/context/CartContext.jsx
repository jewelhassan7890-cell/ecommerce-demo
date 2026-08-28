import React, { createContext, useContext, useState, useEffect } from "react";
import {
    getCart,
    addToCartApi,
    updateCartQuantityApi,
    removeCartItemApi,
    clearCartApi
} from "../api/cartApi";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({
        items: [],
        totalItems: 0,
        subtotal: 0,
        discount: 0,
        grandTotal: 0,
    });
    const [loading, setLoading] = useState(true);

    // ১. যেকোনো ফরম্যাটের প্রোডাক্ট থেকে সেফলি ইমেজ এক্সট্রাক্ট করার প্রফেশনাল হেলপার
    const extractImageUrl = (prod) => {
        if (!prod) return "";
        if (typeof prod === "string") return prod;
        if (prod?.thumbnail?.url) return prod.thumbnail.url;
        if (typeof prod?.thumbnail === "string") return prod.thumbnail;
        if (prod?.image) return prod.image;
        if (Array.isArray(prod?.images) && prod.images.length > 0) {
            const firstImg = prod.images[0];
            return typeof firstImg === "string" ? firstImg : firstImg?.url || "";
        }
        return "";
    };

    // Helper: আইটেমের ইউনিক আইডি বের করার জন্য
    const getItemIdentifier = (item) => item.cartItemId || item._id;

    // Guest Cart (LocalStorage) হিসাব করার প্রফেশনাল হেলপার
    const calculateGuestCart = (items) => {
        const totalItems = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
        const subtotal = items.reduce((acc, item) => {
            const price = Number(item.unitPrice) || Number(item.salePrice) || Number(item.price) || 0;
            return acc + price * (Number(item.quantity) || 0);
        }, 0);

        return {
            items,
            totalItems,
            subtotal,
            discount: 0,
            grandTotal: subtotal,
        };
    };

    // ১. কার্ট ডাটা ফেচ করা
    const fetchCart = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            const savedCart = localStorage.getItem("cartItems");
            const parsedItems = savedCart ? JSON.parse(savedCart) : [];
            setCart(calculateGuestCart(parsedItems));
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await getCart();
            if (res?.success && res?.data) {
                setCart(res.data);
            } else {
                // ব্যাকএন্ডে ফেইল করলে লোকালস্টোরেজ লোড করা
                const savedCart = localStorage.getItem("cartItems");
                if (savedCart) setCart(calculateGuestCart(JSON.parse(savedCart)));
            }
        } catch (error) {
            console.error("Failed to load cart from API:", error);
            const savedCart = localStorage.getItem("cartItems");
            if (savedCart) setCart(calculateGuestCart(JSON.parse(savedCart)));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // ২. কার্টে প্রোডাক্ট যোগ করা (Guest & Auth Both)
    const addToCart = async (product, quantity = 1, selectedColor = null, selectedSize = null) => {
        if (!product?._id) return false;

        const token = localStorage.getItem("token");
        const numQuantity = Number(quantity) || 1;
        const getProductId = (item) => item.product?._id || item.product || item._id;

        const updateLocalStorageCart = (newProduct, qty, color, size) => {
            const currentItems = JSON.parse(localStorage.getItem("cartItems")) || [];
            const cartItemId = `${newProduct._id}-${color || 'default'}-${size || 'default'}`;

            const existingIndex = currentItems.findIndex(
                (item) => (item.cartItemId === cartItemId) ||
                    (getProductId(item) === newProduct._id && (item.color || null) === (color || null) && (item.size || null) === (size || null))
            );

            let updatedItems = [...currentItems];
            const unitPrice = Number(newProduct.salePrice) || Number(newProduct.price) || 0;
            const imageUrl = extractImageUrl(newProduct);

            if (existingIndex > -1) {
                const existingItem = updatedItems[existingIndex];
                const updatedQuantity = existingItem.quantity + qty;
                updatedItems[existingIndex] = {
                    ...existingItem,
                    quantity: updatedQuantity,
                    totalPrice: unitPrice * updatedQuantity,
                    // ইমেজ আপডেট রাখা
                    image: imageUrl || existingItem.image,
                    thumbnail: { url: imageUrl || existingItem?.thumbnail?.url || "" }
                };
            } else {
                updatedItems.push({
                    _id: newProduct._id,
                    cartItemId: cartItemId,
                    product: newProduct._id,
                    productData: newProduct,
                    name: newProduct.name || newProduct.title || "Product",
                    image: imageUrl, // <--- Standard key for UI
                    thumbnail: { url: imageUrl }, // <--- Database Schema Matching
                    unitPrice: unitPrice,
                    price: Number(newProduct.price) || 0,
                    salePrice: Number(newProduct.salePrice) || 0,
                    quantity: qty,
                    totalPrice: unitPrice * qty,
                    color: color || null,
                    size: size || null,
                });
            }

            localStorage.setItem("cartItems", JSON.stringify(updatedItems));
            return updatedItems;
        };

        // Guest User
        if (!token) {
            const updatedItems = updateLocalStorageCart(product, numQuantity, selectedColor, selectedSize);
            setCart(calculateGuestCart(updatedItems));
            return true;
        }

        // Logged-in User
        try {
            const payload = {
                productId: product._id,
                quantity: numQuantity,
                color: selectedColor || null,
                size: selectedSize || null
            };

            const res = await addToCartApi(payload);

            if (res?.success) {
                setCart(res.data);
                // ব্রাউজারের LocalStorage-এর সাথে সিঙ্ক রাখা
                updateLocalStorageCart(product, numQuantity, selectedColor, selectedSize);
                return true;
            } else {
                throw new Error(res?.message || "Failed to add item");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            // Fallback LocalStorage
            const updatedItems = updateLocalStorageCart(product, numQuantity, selectedColor, selectedSize);
            setCart(calculateGuestCart(updatedItems));
            return true;
        }
    };

    // ৩. কোয়ান্টিটি আপডেট করা
    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            await removeFromCart(itemId);
            return;
        }

        const token = localStorage.getItem("token");

        // Optimistic UI Update
        const updatedItems = cart.items.map((item) => {
            if (getItemIdentifier(item) === itemId || item._id === itemId) {
                const price = Number(item.unitPrice) || Number(item.salePrice) || Number(item.price) || 0;
                return {
                    ...item,
                    quantity: newQuantity,
                    totalPrice: price * newQuantity,
                };
            }
            return item;
        });

        localStorage.setItem("cartItems", JSON.stringify(updatedItems));
        setCart(calculateGuestCart(updatedItems));

        if (token) {
            try {
                const res = await updateCartQuantityApi(itemId, newQuantity);
                if (res?.success) {
                    setCart(res.data);
                }
            } catch (error) {
                console.error("Error updating quantity in API:", error);
            }
        }
    };

    // ৪. আইটেম রিমুভ করা
    const removeFromCart = async (itemId) => {
        const token = localStorage.getItem("token");

        const updatedItems = cart.items.filter((item) => getItemIdentifier(item) !== itemId && item._id !== itemId);
        localStorage.setItem("cartItems", JSON.stringify(updatedItems));
        setCart(calculateGuestCart(updatedItems));

        if (token) {
            try {
                const res = await removeCartItemApi(itemId);
                if (res?.success) {
                    setCart(res.data);
                }
            } catch (error) {
                console.error("Error removing item from API:", error);
            }
        }
    };

    // ৫. পুরো কার্ট ক্লিয়ার করা
    const clearCart = async () => {
        const token = localStorage.getItem("token");

        const emptyCartState = {
            items: [],
            totalItems: 0,
            subtotal: 0,
            discount: 0,
            grandTotal: 0,
        };

        localStorage.removeItem("cartItems");
        localStorage.removeItem("cart");
        setCart(emptyCartState);

        if (token) {
            try {
                const res = await clearCartApi();
                if (res?.success && res?.data) {
                    setCart(res.data);
                }
            } catch (error) {
                console.error("Error clearing cart from backend database:", error);
            }
        }
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                fetchCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};




