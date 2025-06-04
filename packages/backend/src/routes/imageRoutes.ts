import express from "express";
import { ImageProvider } from "../ImageProvider.js";
import { ObjectId } from "mongodb";
import { verifyAuthToken } from "./authRoutes.js";
import {
    imageMiddlewareFactory,
    handleImageFileErrors,
} from "../imageUploadMiddleware.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const MAX_NAME_LENGTH = 100;

function waitDuration(numMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, numMs));
}

export function registerImageRoutes(
    app: express.Application,
    imageProvider: ImageProvider
) {
    app.use("/api/*", verifyAuthToken);

    app.get("/api/images", async (req, res) => {
        try {
            await waitDuration(Math.random() * 5000);

            const images = await imageProvider.getImages();
            res.json(images);
        } catch (error) {
            console.error("Error fetching images:", error);
            res.status(500).send("Internal Server Error");
        }
    });

    app.post(
        "/api/images",
        imageMiddlewareFactory.single("image"),
        handleImageFileErrors,
        async (req: any, res: any) => {
            const { file } = req;
            const { name } = req.body;
            if (!file || !name) {
                res.status(400).send("Bad Request: Missing file or name.");
                return;
            }

            const authorId = req.user?.username;

            try {
                const src = path.join(
                    `/${process.env.IMAGE_UPLOAD_DIR || "uploads"}`,
                    file.filename
                );
                await imageProvider.createImage(src, name, authorId);

                res.status(201).send();
                return;
            } catch (error) {
                console.error("Error creating image:", error);
                res.status(500).send("Internal Server Error");
                return;
            }
        }
    );

    app.get("/api/images/search", async (req, res) => {
        const { substring } = req.query;

        if (!substring || typeof substring !== "string") {
            res.status(400).send(
                "Bad Request: 'substring' query parameter is required."
            );
            return;
        }

        try {
            await waitDuration(Math.random() * 5000);

            const images = await imageProvider.getImages(substring);

            res.json(images);
        } catch (error) {
            console.error("Error searching images:", error);
            res.status(500).send("Internal Server Error");
        }
    });

    app.put("/api/images/", async (req, res) => {
        const { imageId, name } = req.body;
        const loggedInUsername = req.user?.username;

        if (!imageId || !name) {
            res.status(400).send({
                error: "Bad Request",
                message: "Image ID and new name are required.",
            });
            return;
        }

        if (!ObjectId.isValid(imageId)) {
            res.status(404).send({
                error: "Not Found",
                message: "Image does not exist",
            });
            return;
        }

        if (name.length > MAX_NAME_LENGTH) {
            res.status(422).send({
                error: "Unprocessable Entity",
                message: `Image name exceeds ${MAX_NAME_LENGTH} characters`,
            });
            return;
        }

        if (!loggedInUsername) {
            res.status(401).send({
                error: "Unauthorized",
                message: "You must be logged in to edit this image.",
            });
            return;
        }

        try {
            const authorId = await imageProvider.getImageAuthorId(imageId);
            if (!authorId) {
                res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist",
                });
                return;
            }
            if (authorId !== loggedInUsername) {
                res.status(403).send({
                    error: "Forbidden",
                    message: "You do not have permission to edit this image.",
                });
                return;
            }

            const matchedCount = await imageProvider.updateImageName(
                imageId,
                name
            );
            if (matchedCount > 0) {
                res.status(204).send();
            } else {
                res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist",
                });
            }
        } catch (error) {
            console.error("Error updating image name:", error);
            res.status(500).send({
                error: "Internal Server Error",
                message: "An error occurred while updating the image name.",
            });
        }
    });
}
