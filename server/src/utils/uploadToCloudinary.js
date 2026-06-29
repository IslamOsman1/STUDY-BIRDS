const path = require("path");
const { cloudinary, ensureCloudinaryConfigured } = require("../config/cloudinary");

const sanitizePublicId = (value) =>
  String(value || "file")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "file";

const buildUploadOptions = (file, folder) => {
  const extension = path.extname(file.originalname || "");
  const isImage = file.mimetype.startsWith("image/");

  return {
    folder,
    public_id: `${Date.now()}-${sanitizePublicId(file.originalname)}`,
    resource_type: isImage ? "image" : "raw",
    use_filename: false,
    unique_filename: false,
    format: isImage ? undefined : extension.replace(/^\./, "") || undefined,
  };
};

const buildDeliveryUrl = (result, file) => {
  const isImage = file.mimetype.startsWith("image/");
  const extension = path.extname(file.originalname || "").replace(/^\./, "");

  if (isImage) {
    return result.secure_url;
  }

  // Signed raw delivery avoids Cloudinary 401 issues for PDFs and office docs.
  return cloudinary.url(result.public_id, {
    resource_type: result.resource_type || "raw",
    type: "upload",
    secure: true,
    sign_url: true,
    format: extension || undefined,
  });
};

const uploadFileToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    ensureCloudinaryConfigured();

    const uploadStream = cloudinary.uploader.upload_stream(
      buildUploadOptions(file, folder),
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: buildDeliveryUrl(result, file),
          publicId: result.public_id,
          originalName: file.originalname,
          bytes: result.bytes,
          resourceType: result.resource_type,
        });
      }
    );

    uploadStream.end(file.buffer);
  });

module.exports = {
  uploadFileToCloudinary,
};
