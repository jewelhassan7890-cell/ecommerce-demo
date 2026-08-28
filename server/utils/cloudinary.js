const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const ApiError = require("./ApiError");

// ==========================================
// Cloudinary Configuration
// ==========================================

cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDINARY_API_KEY,

    api_secret: process.env.CLOUDINARY_API_SECRET,

});

// ==========================================
// Upload Buffer
// ==========================================

const uploadBuffer = (

    fileBuffer,

    folder = "products"

) => {

    return new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(

            {

                folder,

                resource_type: "image",

            },

            (error, result) => {

                if (error) {

                    return reject(

                        new ApiError(

                            500,

                            "Cloudinary upload failed."

                        )

                    );

                }

                resolve({

                    url: result.secure_url,

                    public_id: result.public_id,

                });

            }

        );

        streamifier

            .createReadStream(fileBuffer)

            .pipe(uploadStream);

    });

};

// ==========================================
// Delete Image
// ==========================================

const deleteImage = async (

    publicId

) => {

    if (!publicId) return;

    return await cloudinary.uploader.destroy(

        publicId

    );

};

// ==========================================
// Replace Image
// ==========================================

const replaceImage = async (

    fileBuffer,

    oldPublicId,

    folder = "products"

) => {

    if (oldPublicId) {

        await deleteImage(

            oldPublicId

        );

    }

    return await uploadBuffer(

        fileBuffer,

        folder

    );

};

// ==========================================

module.exports = {

    cloudinary,

    uploadBuffer,

    deleteImage,

    replaceImage,

};