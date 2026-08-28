const Product = require("../models/Product");

const ApiError = require("../utils/ApiError");

// ==========================================
// Create Product
// ==========================================

const createProduct = async (payload) => {

    const existingSlug = await Product.findOne({

        slug: payload.slug,

    });

    if (existingSlug) {

        throw new ApiError(

            409,

            "Product slug already exists."

        );

    }

    const existingSku = await Product.findOne({

        sku: payload.sku,

    });

    if (existingSku) {

        throw new ApiError(

            409,

            "SKU already exists."

        );

    }

    const product = await Product.create(payload);

    return product;

};

// ==========================================
// Update Product
// ==========================================

const updateProduct = async (

    productId,

    payload

) => {

    const product = await Product.findById(productId);

    if (!product || product.isDeleted) {

        throw new ApiError(

            404,

            "Product not found."

        );

    }

    if (

        payload.slug &&

        payload.slug !== product.slug

    ) {

        const exists = await Product.findOne({

            slug: payload.slug,

            _id: { $ne: productId },

        });

        if (exists) {

            throw new ApiError(

                409,

                "Slug already exists."

            );

        }

    }

    if (

        payload.sku &&

        payload.sku !== product.sku

    ) {

        const exists = await Product.findOne({

            sku: payload.sku,

            _id: { $ne: productId },

        });

        if (exists) {

            throw new ApiError(

                409,

                "SKU already exists."

            );

        }

    }

    Object.assign(product, payload);

    await product.save();

    return product;

};

// ==========================================
// Soft Delete Product
// ==========================================

const deleteProduct = async (productId) => {

    const product = await Product.findById(productId);

    if (!product || product.isDeleted) {

        throw new ApiError(

            404,

            "Product not found."

        );

    }

    product.isDeleted = true;

    product.isActive = false;

    await product.save();

    return true;

};

// ==========================================
// Get Single Product
// ==========================================

const getProduct = async (slug) => {

    const product = await Product.findOne({

        slug,

        isDeleted: false,

        isActive: true,

    }).populate(

        "category",

        "name slug"

    );

    if (!product) {

        throw new ApiError(

            404,

            "Product not found."

        );

    }

    return product;

};

// ==========================================
// Get All Products
// ==========================================

const getProducts = async (query) => {

    const {

        page = 1,

        limit = 12,

        category,

        search,

        minPrice,

        maxPrice,

        sort = "newest",

    } = query;

    const filter = {

        isDeleted: false,

        isActive: true,

    };

    // ==============================
    // Category
    // ==============================

    if (category) {

        filter.category = category;

    }

    // ==============================
    // Search
    // ==============================

    if (search) {

        filter.$text = {

            $search: search,

        };

    }

    // ==============================
    // Price
    // ==============================

    if (

        minPrice ||

        maxPrice

    ) {

        filter.price = {};

        if (minPrice)

            filter.price.$gte = Number(minPrice);

        if (maxPrice)

            filter.price.$lte = Number(maxPrice);

    }

    // ==============================
    // Sorting
    // ==============================

    let sortOption = {

        createdAt: -1,

    };

    switch (sort) {

        case "price-low":

            sortOption = {

                price: 1,

            };

            break;

        case "price-high":

            sortOption = {

                price: -1,

            };

            break;

        case "featured":

            sortOption = {

                isFeatured: -1,

            };

            break;

        case "sale":

            sortOption = {

                salePrice: 1,

            };

            break;

        default:

            sortOption = {

                createdAt: -1,

            };

    }

    // ==============================
    // Pagination
    // ==============================

    const skip =

        (Number(page) - 1) *

        Number(limit);

    const [

        products,

        total,

    ] = await Promise.all([

        Product.find(filter)

            .populate(

                "category",

                "name slug"

            )

            .sort(sortOption)

            .skip(skip)

            .limit(Number(limit))

            .lean(),

        Product.countDocuments(filter),

    ]);

    return {

        products,

        pagination: {

            page: Number(page),

            limit: Number(limit),

            totalProducts: total,

            totalPages: Math.ceil(

                total /

                Number(limit)

            ),

        },

    };

};

// ==========================================

module.exports = {

    createProduct,

    updateProduct,

    deleteProduct,

    getProduct,

    getProducts,

};