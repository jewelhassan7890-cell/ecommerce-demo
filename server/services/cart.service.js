const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ======================================================
// Get Product Unit Price
// ======================================================

const getUnitPrice = (product) => {
    if (
        product.salePrice !== null &&
        product.salePrice !== undefined &&
        product.salePrice > 0 &&
        product.salePrice < product.price
    ) {
        return product.salePrice;
    }

    return product.price;
};

// ======================================================
// Get Selected Product Image
// ======================================================

const getSelectedImage = (
    product,
    imageType = "thumbnail",
    imageIndex = 0
) => {
    // Gallery image
    if (
        imageType === "gallery" &&
        Array.isArray(product.gallery) &&
        product.gallery[imageIndex]
    ) {
        const galleryImage = product.gallery[imageIndex];

        return {
            type: "gallery",
            url: galleryImage.url || "",
            public_id: galleryImage.public_id || "",
        };
    }

    // Default thumbnail
    return {
        type: "thumbnail",
        url: product.thumbnail?.url || "",
        public_id: product.thumbnail?.public_id || "",
    };
};

// ======================================================
// Recalculate Cart Summary
// ======================================================

const recalculateCart = (cart) => {
    let totalItems = 0;
    let subtotal = 0;

    cart.items.forEach((item) => {
        item.totalPrice =
            Number(item.unitPrice) *
            Number(item.quantity);

        totalItems += Number(item.quantity);

        subtotal += Number(item.totalPrice);
    });

    cart.totalItems = totalItems;

    cart.uniqueItems = cart.items.length;

    cart.subtotal = subtotal;

    const discount = Number(cart.discount || 0);

    cart.grandTotal = Math.max(
        0,
        subtotal - discount
    );

    return cart;
};

// ======================================================
// Get Or Create Cart
// ======================================================

const getOrCreateCart = async (customerId) => {
    let cart = await Cart.findOne({
        customer: customerId,
        isDeleted: false,
    });

    if (!cart) {
        cart = await Cart.create({
            customer: customerId,
            items: [],
        });
    }

    return cart;
};

// ======================================================
// Get Cart
// ======================================================

const getCart = async (customerId) => {
    const cart = await Cart.findOne({
        customer: customerId,
        isDeleted: false,
    }).lean();

    if (!cart) {
        return {
            items: [],
            totalItems: 0,
            uniqueItems: 0,
            subtotal: 0,
            discount: 0,
            grandTotal: 0,
            coupon: {
                code: "",
                discountType: "",
                discountValue: 0,
            },
        };
    }

    return cart;
};

// ======================================================
// Add Product To Cart
// ======================================================

const addToCart = async ({
    customerId,
    productId,
    quantity = 1,
    color = "",
    size = "",
    imageType = "thumbnail",
    imageIndex = 0,
}) => {
    // --------------------------------------------------
    // Validate Product ID
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid product ID.");
    }

    // --------------------------------------------------
    // Normalize Quantity
    // --------------------------------------------------

    quantity = Number(quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error(
            "Quantity must be a valid positive integer."
        );
    }

    // --------------------------------------------------
    // Validate Image Type
    // --------------------------------------------------

    if (!["thumbnail", "gallery"].includes(imageType)) {
        imageType = "thumbnail";
    }

    imageIndex = Number(imageIndex);

    if (
        !Number.isInteger(imageIndex) ||
        imageIndex < 0
    ) {
        imageIndex = 0;
    }

    // --------------------------------------------------
    // Find Current Product
    // --------------------------------------------------

    const product = await Product.findOne({
        _id: productId,
        isActive: true,
        isDeleted: false,
    });

    if (!product) {
        throw new Error(
            "Product is unavailable."
        );
    }

    // --------------------------------------------------
    // Stock Validation
    // --------------------------------------------------

    if (
        product.stockStatus ===
        "out-of-stock"
    ) {
        throw new Error(
            "This product is currently out of stock."
        );
    }

    if (
        product.stockStatus !== "pre-order" &&
        product.stock < quantity
    ) {
        throw new Error(
            `Only ${product.stock} item(s) are available.`
        );
    }

    // --------------------------------------------------
    // Color Validation
    // --------------------------------------------------

    if (
        color &&
        Array.isArray(product.colors) &&
        product.colors.length > 0 &&
        !product.colors.includes(color)
    ) {
        throw new Error(
            `Selected color "${color}" is unavailable.`
        );
    }

    // --------------------------------------------------
    // Size Validation
    // --------------------------------------------------

    if (
        size &&
        Array.isArray(product.sizes) &&
        product.sizes.length > 0 &&
        !product.sizes.includes(size)
    ) {
        throw new Error(
            `Selected size "${size}" is unavailable.`
        );
    }

    // --------------------------------------------------
    // Selected Image
    // --------------------------------------------------

    const selectedImage =
        getSelectedImage(
            product,
            imageType,
            imageIndex
        );

    // --------------------------------------------------
    // Current Price
    // --------------------------------------------------

    const unitPrice =
        getUnitPrice(product);

    // --------------------------------------------------
    // Find / Create Cart
    // --------------------------------------------------

    const cart =
        await getOrCreateCart(
            customerId
        );

    // --------------------------------------------------
    // Find Existing Product Variant
    // --------------------------------------------------

    const existingItem =
        cart.items.find(
            (item) =>
                item.product.toString() ===
                productId.toString() &&
                item.color === color &&
                item.size === size
        );

    // ==================================================
    // Existing Item
    // ==================================================

    if (existingItem) {
        const newQuantity =
            existingItem.quantity +
            quantity;

        if (
            product.stockStatus !==
            "pre-order" &&
            newQuantity >
            product.stock
        ) {
            throw new Error(
                `Only ${product.stock} item(s) are available.`
            );
        }

        existingItem.quantity =
            newQuantity;

        existingItem.price =
            product.price;

        existingItem.salePrice =
            product.salePrice;

        existingItem.unitPrice =
            unitPrice;

        existingItem.totalPrice =
            newQuantity * unitPrice;

        // Update selected image
        existingItem.image =
            selectedImage;

        // Refresh product snapshot
        existingItem.name =
            product.name;

        existingItem.slug =
            product.slug;

        existingItem.sku =
            product.sku;
    }

    // ==================================================
    // New Item
    // ==================================================

    else {
        cart.items.push({
            product: product._id,

            name: product.name,

            slug: product.slug,

            sku: product.sku,

            image: selectedImage,

            // Keep full snapshot if you need it later
            thumbnail: {
                url:
                    product.thumbnail?.url || "",

                public_id:
                    product.thumbnail?.public_id || "",
            },

            gallery:
                Array.isArray(product.gallery)
                    ? product.gallery.map(
                        (image) => ({
                            url:
                                image.url || "",

                            public_id:
                                image.public_id ||
                                "",
                        })
                    )
                    : [],

            color,

            size,

            quantity,

            price: product.price,

            salePrice:
                product.salePrice,

            unitPrice,

            totalPrice:
                quantity * unitPrice,
        });
    }

    // --------------------------------------------------
    // Recalculate
    // --------------------------------------------------

    recalculateCart(cart);

    // --------------------------------------------------
    // Save
    // --------------------------------------------------

    await cart.save();

    return cart;
};

// ======================================================
// Update Cart Item Quantity
// ======================================================

const updateCartItem = async ({
    customerId,
    itemId,
    quantity,
}) => {
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        throw new Error(
            "Invalid cart item ID."
        );
    }

    quantity = Number(quantity);

    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {
        throw new Error(
            "Quantity must be a positive integer."
        );
    }

    const cart = await Cart.findOne({
        customer: customerId,
        isDeleted: false,
    });

    if (!cart) {
        throw new Error(
            "Cart not found."
        );
    }

    const item =
        cart.items.id(itemId);

    if (!item) {
        throw new Error(
            "Cart item not found."
        );
    }

    // --------------------------------------------------
    // Revalidate Product
    // --------------------------------------------------

    const product =
        await Product.findOne({
            _id: item.product,
            isActive: true,
            isDeleted: false,
        });

    if (!product) {
        throw new Error(
            "This product is no longer available."
        );
    }

    // --------------------------------------------------
    // Stock Validation
    // --------------------------------------------------

    if (
        product.stockStatus !==
        "pre-order" &&
        quantity > product.stock
    ) {
        throw new Error(
            `Only ${product.stock} item(s) are available.`
        );
    }

    // --------------------------------------------------
    // Refresh Price
    // --------------------------------------------------

    const unitPrice =
        getUnitPrice(product);

    item.quantity = quantity;

    item.price =
        product.price;

    item.salePrice =
        product.salePrice;

    item.unitPrice =
        unitPrice;

    item.totalPrice =
        quantity * unitPrice;

    // --------------------------------------------------
    // Refresh Product Snapshot
    // --------------------------------------------------

    item.name =
        product.name;

    item.slug =
        product.slug;

    item.sku =
        product.sku;

    // --------------------------------------------------
    // Recalculate
    // --------------------------------------------------

    recalculateCart(cart);

    await cart.save();

    return cart;
};

// ======================================================
// Remove Cart Item
// ======================================================

const removeCartItem = async ({
    customerId,
    itemId,
}) => {
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        throw new Error(
            "Invalid cart item ID."
        );
    }

    const cart = await Cart.findOne({
        customer: customerId,
        isDeleted: false,
    });

    if (!cart) {
        throw new Error(
            "Cart not found."
        );
    }

    const item =
        cart.items.id(itemId);

    if (!item) {
        throw new Error(
            "Cart item not found."
        );
    }

    item.deleteOne();

    recalculateCart(cart);

    await cart.save();

    return cart;
};

// ======================================================
// Clear Cart
// ======================================================

const clearCart = async (
    customerId
) => {
    const cart = await Cart.findOne({
        customer: customerId,
        isDeleted: false,
    });

    if (!cart) {
        return {
            items: [],
            totalItems: 0,
            uniqueItems: 0,
            subtotal: 0,
            discount: 0,
            grandTotal: 0,
        };
    }

    cart.items = [];

    cart.totalItems = 0;

    cart.uniqueItems = 0;

    cart.subtotal = 0;

    cart.discount = 0;

    cart.grandTotal = 0;

    cart.coupon = {
        code: "",
        discountType: "",
        discountValue: 0,
    };

    await cart.save();

    return cart;
};

// ======================================================
// Merge Guest Cart With Authenticated Cart
// ======================================================

const mergeGuestCart = async ({
    customerId,
    items = [],
}) => {
    if (!Array.isArray(items)) {
        throw new Error(
            "Guest cart must be an array."
        );
    }

    const cart =
        await getOrCreateCart(
            customerId
        );

    for (const guestItem of items) {
        const {
            product,
            quantity = 1,
            color = "",
            size = "",
            imageType = "thumbnail",
            imageIndex = 0,
        } = guestItem;

        // --------------------------------------------------
        // Validate Product ID
        // --------------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(
                product
            )
        ) {
            continue;
        }

        // --------------------------------------------------
        // Get Current Product
        // --------------------------------------------------

        const productData =
            await Product.findOne({
                _id: product,
                isActive: true,
                isDeleted: false,
            });

        if (!productData) {
            continue;
        }

        const requestedQuantity =
            Number(quantity);

        if (
            !Number.isInteger(
                requestedQuantity
            ) ||
            requestedQuantity < 1
        ) {
            continue;
        }

        // --------------------------------------------------
        // Stock
        // --------------------------------------------------

        if (
            productData.stockStatus !==
            "pre-order" &&
            productData.stock <
            requestedQuantity
        ) {
            continue;
        }

        // --------------------------------------------------
        // Variant Validation
        // --------------------------------------------------

        if (
            color &&
            Array.isArray(
                productData.colors
            ) &&
            productData.colors.length > 0 &&
            !productData.colors.includes(
                color
            )
        ) {
            continue;
        }

        if (
            size &&
            Array.isArray(
                productData.sizes
            ) &&
            productData.sizes.length > 0 &&
            !productData.sizes.includes(
                size
            )
        ) {
            continue;
        }

        // --------------------------------------------------
        // Current Price
        // --------------------------------------------------

        const unitPrice =
            getUnitPrice(
                productData
            );

        // --------------------------------------------------
        // Current Image
        // --------------------------------------------------

        const selectedImage =
            getSelectedImage(
                productData,
                imageType,
                Number(imageIndex)
            );

        // --------------------------------------------------
        // Find Existing Item
        // --------------------------------------------------

        const existingItem =
            cart.items.find(
                (item) =>
                    item.product.toString() ===
                    product.toString() &&
                    item.color === color &&
                    item.size === size
            );

        // ==================================================
        // Existing
        // ==================================================

        if (existingItem) {
            let newQuantity =
                existingItem.quantity +
                requestedQuantity;

            if (
                productData.stockStatus !==
                "pre-order" &&
                newQuantity >
                productData.stock
            ) {
                newQuantity =
                    productData.stock;
            }

            existingItem.quantity =
                newQuantity;

            existingItem.price =
                productData.price;

            existingItem.salePrice =
                productData.salePrice;

            existingItem.unitPrice =
                unitPrice;

            existingItem.totalPrice =
                newQuantity * unitPrice;

            existingItem.image =
                selectedImage;

            existingItem.name =
                productData.name;

            existingItem.slug =
                productData.slug;

            existingItem.sku =
                productData.sku;
        }

        // ==================================================
        // New
        // ==================================================

        else {
            cart.items.push({
                product:
                    productData._id,

                name:
                    productData.name,

                slug:
                    productData.slug,

                sku:
                    productData.sku,

                image:
                    selectedImage,

                thumbnail: {
                    url:
                        productData.thumbnail?.url ||
                        "",

                    public_id:
                        productData.thumbnail?.public_id ||
                        "",
                },

                gallery:
                    Array.isArray(
                        productData.gallery
                    )
                        ? productData.gallery.map(
                            (image) => ({
                                url:
                                    image.url ||
                                    "",

                                public_id:
                                    image.public_id ||
                                    "",
                            })
                        )
                        : [],

                color,

                size,

                quantity:
                    requestedQuantity,

                price:
                    productData.price,

                salePrice:
                    productData.salePrice,

                unitPrice,

                totalPrice:
                    requestedQuantity *
                    unitPrice,
            });
        }
    }

    // --------------------------------------------------
    // Recalculate
    // --------------------------------------------------

    recalculateCart(cart);

    await cart.save();

    return cart;
};

// ======================================================
// Export
// ======================================================

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    mergeGuestCart,
};