const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

// Middlewares
const notFoundMiddleware = require("./middlewares/notFoundMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");

// Routes Import
const authRouter = require("./routes/auth.routes");
const userRouter = require("./routes/user.routes");
const categoryRouter = require("./routes/category.routes");
const heroRouter = require("./routes/heroConfig.routes");
const productRouter = require("./routes/product.routes");
const cartRouter = require("./routes/cart.routes");
const couponRouter = require("./routes/couponRoutes");
const ordersRouter = require("./routes/orderRoutes");
const contactRouter = require("./routes/contact.routes");
const complaintRouter = require("./routes/complaintRoutes");
const faqRouter = require("./routes/faqRoutes");
const siteRouter = require("./routes/siteSettingRoutes");
const restockRouter = require("./routes/restockAlertRoutes");
const privacyPolicyRouter = require("./routes/privacyPolicyRoutes");
const carouselRouter = require("./routes/carouselRoutes");


const app = express();

// ==========================================
// Security & Header Configuration
// ==========================================
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

// ==========================================
// CORS Configuration
// ==========================================
// app.use(
//     cors({
//         origin: process.env.CLIENT_URL || "https://ecommerce-demo-eaq5.vercel.app",
//         credentials: true,
//     })
// );


const allowedOrigins = [
    "http://localhost:5173",
    "https://ecommerce-demo-eaq5.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

// ==========================================
// Body & Cookie Parsers
// ==========================================
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(cookieParser());

// ==========================================
// HTTP Request Logger
// ==========================================
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// ==========================================
// Static File Serving
// ==========================================
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"), {
        setHeaders: (res) => {
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        },
    })
);

// ==========================================
// API Routes Setup
// ==========================================
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/categories", categoryRouter);
app.use("/hero", heroRouter);
app.use("/products", productRouter);
app.use("/cart", cartRouter);
app.use("/orders", ordersRouter);
app.use("/coupons", couponRouter);
app.use("/contact", contactRouter);
app.use("/complaints", complaintRouter);
app.use("/faq", faqRouter);
app.use("/site", siteRouter);
app.use("/restock", restockRouter);
app.use("/privacy-policy", privacyPolicyRouter);
app.use("/carousel", carouselRouter);

// ==========================================
// Health Check & Home Route
// ==========================================
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running successfully.",
        environment: process.env.NODE_ENV,
        timestamp: new Date(),
    });
});

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Ecommerce API",
    });
});

// ==========================================
// Error Handling Middlewares
// ==========================================
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;