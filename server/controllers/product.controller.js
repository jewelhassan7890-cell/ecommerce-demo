const mongoose = require("mongoose");
const slugify = require("slugify");
const cloudinary = require("../config/cloudinary");
const { uploadToCloudinary } = require("../utils/uploadToCloudinary");
const Product = require("../models/Product");
const Category = require("../models/Category");

// Safe JSON Parsing Helper Function
const safeJsonParse = (data) => {
    if (!data) return null;
    if (typeof data === "object") return data; // ইতোমধ্যে অবজেক্ট/অ্যারে হলে সরাসরি রিটার্ন করবে
    try {
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
};

// Unique SKU Generator Helper Function
const generateUniqueSku = async () => {
    let sku;
    let isUnique = false;
    while (!isUnique) {
        sku = `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const existingSku = await Product.findOne({ sku });
        if (!existingSku) isUnique = true;
    }
    return sku;
};

// Unique Slug Generator Helper Function
const generateUniqueSlug = async (name) => {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    while (await Product.findOne({ slug })) {
        slug = `${baseSlug}-${Date.now().toString().slice(-4)}-${count}`;
        count++;
    }
    return slug;
};

// ==========================================
// 1. Get Products (With Search, Filtering, Sorting & Pagination)
// ==========================================
exports.getProducts = async (req, res) => {
    try {
        const {
            search, // 🔍 সার্চ কী-ওয়ার্ড (Name, Description, SKU ইত্যাদি)
            category: categorySlug,
            inStock,
            sort = "newest",
            page = 1,
            limit = 10, // 📄 ই-কমার্স ডিফল্ট প্রতি পেজে ১০টি প্রোডাক্ট
            isNewArrival,
            isFeatured,
            isOnSale
        } = req.query;

        // Base Query Filter
        let query = {
            isActive: true,
            isDeleted: false
        };

        // 🔍 1. Search Logic (প্রোডাক্টের নাম, বিবরণ, SKU বা ট্যাগের মধ্যে ফ্লেক্সিবল সার্চ)
        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { sku: searchRegex },
                { tags: { $in: [searchRegex] } }
            ];
        }

        // 2. Category Slug Filter (Flexible RegEx Match)
        if (categorySlug) {
            const searchPattern = categorySlug.replace(/-/g, " ");

            const matchedCategory = await Category.findOne({
                $or: [
                    { slug: categorySlug },
                    { slug: { $regex: categorySlug, $options: "i" } },
                    { name: { $regex: searchPattern, $options: "i" } }
                ],
                isActive: true,
                isDeleted: false
            });

            if (matchedCategory) {
                query.category = matchedCategory._id;
            } else if (!query.$or) {
                // যদি সার্চের $or আগে থেকে না থাকে তবেই ক্যাটাগরির জন্য $or সেট করবে
                query.$or = [
                    { slug: { $regex: categorySlug, $options: "i" } },
                    { name: { $regex: searchPattern, $options: "i" } }
                ];
            }
        }

        // 3. Stock Filter
        if (inStock === "true") {
            query.stockStatus = "in-stock";
            query.stock = { $gt: 0 };
        }

        // 4. Flags Filter
        if (isNewArrival === "true") query.isNewArrival = true;
        if (isFeatured === "true") query.isFeatured = true;
        if (isOnSale === "true") query.isOnSale = true;

        // 5. Sorting Options
        let sortOption = {};
        if (sort === "low-high") sortOption.price = 1;
        else if (sort === "high-low") sortOption.price = -1;
        else sortOption.createdAt = -1; // Default: newest

        // 6. Pagination Calculation
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));
        const skip = (pageNum - 1) * limitNum;

        // Execute Query
        const [products, totalProducts] = await Promise.all([
            Product.find(query)
                .populate("category", "name slug")
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Product.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalProducts / limitNum) || 1;

        // 📊 Professional E-commerce Metadata Response
        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                totalProducts,
                totalPages,
                currentPage: pageNum,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });

    } catch (error) {
        console.error("Error in getProducts:", error);
        return res.status(500).json({
            success: false,
            message: "Server Internal Error",
            error: error.message
        });
    }
};

// ==========================================
// 2. Dynamic Single Product (by ID or Slug)
// ==========================================
exports.getProduct = async (req, res) => {
    try {
        const { identifier } = req.params;

        const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

        const query = isObjectId
            ? { _id: identifier, isDeleted: false }
            : { slug: identifier, isDeleted: false };

        const product = await Product.findOne(query).populate("category", "name slug");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "প্রোডাক্টটি পাওয়া যায়নি!",
            });
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "সার্ভার এরর!",
            error: error.message,
        });
    }
};

// ==========================================
// 3. Create Product (Admin)
// ==========================================
exports.createProduct = async (req, res) => {
    try {
        const { name, price, colors, sizes, seo, shipping, facebookEmbed, ...restBody } = req.body;

        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: "প্রোডাক্টের নাম এবং মূল্য প্রদান করা বাধ্যতামূলক।",
            });
        }

        const generatedSlug = await generateUniqueSlug(name);
        const generatedSku = await generateUniqueSku();

        let thumbnail = { url: "", public_id: "" };
        let gallery = [];

        if (req.files) {
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                thumbnail = await uploadToCloudinary(
                    req.files.thumbnail[0].buffer,
                    "products/thumbnails"
                );
            }

            if (req.files.gallery && req.files.gallery.length > 0) {
                const galleryPromises = req.files.gallery.map((file) =>
                    uploadToCloudinary(file.buffer, "products/gallery")
                );
                gallery = await Promise.all(galleryPromises);
            }
        }

        const newProduct = await Product.create({
            ...restBody,
            name,
            slug: generatedSlug,
            sku: generatedSku,
            price: Number(price),
            thumbnail,
            gallery,
            colors: safeJsonParse(colors) || [],
            sizes: safeJsonParse(sizes) || [],
            seo: safeJsonParse(seo) || {},
            shipping: safeJsonParse(shipping) || {},
            facebookEmbed: safeJsonParse(facebookEmbed) || {},
        });

        return res.status(201).json({
            success: true,
            message: "প্রোডাক্ট সফলভাবে তৈরি করা হয়েছে!",
            data: newProduct,
        });

    } catch (error) {
        console.error("Create Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "প্রোডাক্ট তৈরি করা সম্ভব হয়নি।",
            error: error.message,
        });
    }
};

// ==========================================
// 4. Update Product (Admin)
// ==========================================
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product || product.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "আপডেটের জন্য প্রোডাক্টটি পাওয়া যায়নি!",
            });
        }

        const updateData = { ...req.body };

        if (req.body.name && req.body.name !== product.name) {
            let newSlug = slugify(req.body.name, { lower: true, strict: true });
            const existingSlug = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
            if (existingSlug) {
                newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
            }
            updateData.slug = newSlug;
        }

        if (req.files) {
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                if (product.thumbnail?.public_id) {
                    await cloudinary.uploader.destroy(product.thumbnail.public_id);
                }
                updateData.thumbnail = await uploadToCloudinary(
                    req.files.thumbnail[0].buffer,
                    "products/thumbnails"
                );
            }

            if (req.files.gallery && req.files.gallery.length > 0) {
                if (product.gallery && product.gallery.length > 0) {
                    const deletePromises = product.gallery
                        .filter((img) => img.public_id)
                        .map((img) => cloudinary.uploader.destroy(img.public_id));
                    await Promise.all(deletePromises);
                }
                const galleryPromises = req.files.gallery.map((file) =>
                    uploadToCloudinary(file.buffer, "products/gallery")
                );
                updateData.gallery = await Promise.all(galleryPromises);
            }
        }

        if (updateData.colors) updateData.colors = safeJsonParse(updateData.colors);
        if (updateData.sizes) updateData.sizes = safeJsonParse(updateData.sizes);
        if (updateData.seo) updateData.seo = safeJsonParse(updateData.seo);
        if (updateData.shipping) updateData.shipping = safeJsonParse(updateData.shipping);
        if (updateData.facebookEmbed) updateData.facebookEmbed = safeJsonParse(updateData.facebookEmbed);

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "প্রোডাক্ট আপডেট সফল হয়েছে!",
            data: updatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "প্রোডাক্ট আপডেট করা সম্ভব হয়নি।",
            error: error.message,
        });
    }
};

// ==========================================
// 5. Soft Delete Product (Admin)
// ==========================================
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { isDeleted: true, isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "মুছে ফেলার জন্য প্রোডাক্টটি পাওয়া যায়নি!",
            });
        }

        res.status(200).json({
            success: true,
            message: "প্রোডাক্টটি সফট-ডিলিট করা হয়েছে!",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "প্রোডাক্ট ডিলিট করতে ব্যর্থ হয়েছে।",
            error: error.message,
        });
    }
};

// ==========================================
// 6. Save/Update Facebook Photo URL (Backend)
// ==========================================
exports.shareToFacebookPhoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { photoPostUrl, fbPostId } = req.body;

        const product = await Product.findById(id);

        if (!product || product.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "প্রোডাক্টটি পাওয়া যায়নি!",
            });
        }

        product.facebookEmbed = {
            ...product.facebookEmbed,
            photoPostUrl: photoPostUrl !== undefined ? photoPostUrl : (product.facebookEmbed?.photoPostUrl || ""),
            fbPostId: fbPostId !== undefined ? fbPostId : (product.facebookEmbed?.fbPostId || null)
        };

        await product.save();

        res.status(200).json({
            success: true,
            message: "ফেসবুক ফটো পোস্ট ইউআরএল সফলভাবে সেভ করা হয়েছে!",
            data: product.facebookEmbed
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "ফেসবুক ফটো সেভ করতে সমস্যা হয়েছে।",
            error: error.message,
        });
    }
};

// ==========================================
// Save/Update Facebook Reel URL (Backend)
// ==========================================
exports.shareToFacebookReel = async (req, res) => {
    try {
        const { id } = req.params;
        const { reelUrl, fbReelId } = req.body;

        const product = await Product.findById(id);

        if (!product || product.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "প্রোডাক্টটি পাওয়া যায়নি!",
            });
        }

        product.facebookEmbed = {
            ...product.facebookEmbed,
            reelUrl: reelUrl !== undefined ? reelUrl : (product.facebookEmbed?.reelUrl || ""),
            fbReelId: fbReelId !== undefined ? fbReelId : (product.facebookEmbed?.fbReelId || null)
        };

        await product.save();

        res.status(200).json({
            success: true,
            message: "ফেসবুক রিলস ভিডিও ইউআরএল সফলভাবে সেভ করা হয়েছে!",
            data: product.facebookEmbed
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "ফেসবুক রিলস সেভ করতে সমস্যা হয়েছে।",
            error: error.message,
        });
    }
};