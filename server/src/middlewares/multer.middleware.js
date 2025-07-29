import multer from "multer";
import path from "path";

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/temp"); // Temporary storage directory
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName); // Save with timestamp + original extension
    },
});

// Configure Multer for file uploads
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, JPEG, and PNG files are allowed"), false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 10, // 10MB file size limit
    },
});

export { upload };
