const cloudinary = require("../config/cloudinary");

exports.uploadToCloudinary = (fileBuffer, folder = "products") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (result) {
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                } else {
                    reject(error);
                }
            }
        );
        stream.end(fileBuffer);
    });
};