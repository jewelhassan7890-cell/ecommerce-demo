const express = require("express");
const router = express.Router();


// Authentication Middleware (যেটি req.user সেট করবে)

const { getCart, addToCart, updateCartItemQuantity, removeCartItem, clearCart } = require("../controllers/cart.controller");
const authMiddleware = require("../utils/verifyToken");



router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.patch("/item/:itemId", authMiddleware, updateCartItemQuantity);
router.delete("/item/:itemId", authMiddleware, removeCartItem);
router.delete("/clear", authMiddleware, clearCart);

module.exports = router;


