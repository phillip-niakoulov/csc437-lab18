import { Request, Response, NextFunction } from "express";
import multer from "multer";
import dotenv from "dotenv";

class ImageFormatError extends Error {}

const storageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        dotenv.config();

        cb(null, process.env.IMAGE_UPLOAD_DIR || "uploads");
    },
    filename: function (req, file, cb) {
        let fileExtension;

        switch (file.mimetype) {
            case "image/png":
                fileExtension = "png";
                break;
            case "image/jpg":
            case "image/jpeg":
                fileExtension = "jpg";
                break;
            default:
                return cb(new ImageFormatError("Unsupported image type"), "");
        }

        const fileName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            "." +
            fileExtension;

        cb(null, fileName);
    },
});

export const imageMiddlewareFactory = multer({
    storage: storageEngine,
    limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
});

export function handleImageFileErrors(
    err: any,
    req: any,
    res: any,
    next: NextFunction
) {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        res.status(400).send({
            error: "Bad Request",
            message: err.message,
        });
        return;
    }
    next(err); // Some other error, let the next middleware handle it
}
