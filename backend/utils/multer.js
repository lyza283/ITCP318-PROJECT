const multer = require("multer");
const path = require("path");

module.exports = multer({
    limits: { fieldSize: 1 * 1024 * 1024, fileSize: 10 * 1024 * 1024, files: 10 },
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname).toLowerCase();
        if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)
            || !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            return cb(new Error("Only JPG, PNG, and WebP images are supported."));
        }
        cb(null, true);
    },
});