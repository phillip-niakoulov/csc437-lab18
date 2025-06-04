import express, { Request, Response } from "express";
import { ValidRoutes } from "./shared/ValidRoutes.js";
import { registerImageRoutes } from "./routes/imageRoutes.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
// import { fetchDataFromServer } from "./shared/ApiImageData.js";
import { connectMongo } from "./shared/connectMongo.js";
import { ImageProvider } from "./ImageProvider.js";
import { CredentialsProvider } from "./CredentialsProvider.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const app = express();

app.locals.JWT_SECRET = process.env.JWT_SECRET;

app.use(express.static(STATIC_DIR));
app.use("/uploads", express.static(process.env.IMAGE_UPLOAD_DIR || "uploads"));
app.use(express.json());

const mongoClient = connectMongo();

mongoClient
    .connect()
    .then(() => {
        console.log("Connected to MongoDB");

        const imageProvider = new ImageProvider(mongoClient);
        const credentialsProvider = new CredentialsProvider(mongoClient);

        registerImageRoutes(app, imageProvider);
        registerAuthRoutes(app, credentialsProvider);
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.get(Object.values(ValidRoutes), (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../", STATIC_DIR, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
