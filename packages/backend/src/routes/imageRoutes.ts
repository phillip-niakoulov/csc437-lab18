import express from "express";
import { ImageProvider } from "../ImageProvider.js";
import { ObjectId } from "mongodb";

const MAX_NAME_LENGTH = 100;

function waitDuration(numMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, numMs));
}

export function registerImageRoutes(
    app: express.Application,
    imageProvider: ImageProvider
) {
    app.get("/api/images", async (req, res) => {
        try {
            await waitDuration(1000);

            const images = await imageProvider.getImages();
            res.json(images);
        } catch (error) {
            console.error("Error fetching images:", error);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get("/api/images/search", async (req, res) => {
        const { substring } = req.query;

        if (!substring || typeof substring !== "string") {
            res.status(400).send(
                "Bad Request: 'substring' query parameter is required."
            );
            return;
        }

        try {
            await waitDuration(1000);

            const images = await imageProvider.getImages(substring);

            res.json(images);
        } catch (error) {
            console.error("Error searching images:", error);
            res.status(500).send("Internal Server Error");
        }
    });

    app.put("/api/images/", async (req, res) => {
        const { imageId, name } = req.body;

        // Check for missing parameters
        if (!imageId || !name) {
            res.status(400).send({
                error: "Bad Request",
                message: "Image ID and new name are required.",
            });
            return;
        }

        // Check for valid ObjectId
        if (!ObjectId.isValid(imageId)) {
            res.status(404).send({
                error: "Not Found",
                message: "Image does not exist",
            });
            return;
        }

        // Check for excessively long image name
        if (name.length > MAX_NAME_LENGTH) {
            res.status(422).send({
                error: "Unprocessable Entity",
                message: `Image name exceeds ${MAX_NAME_LENGTH} characters`,
            });
            return;
        }

        try {
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
