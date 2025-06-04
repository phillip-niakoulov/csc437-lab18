import express from "express";
import { CredentialsProvider } from "../CredentialsProvider.js";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface IAuthTokenPayload {
    username: string;
}

declare module "express-serve-static-core" {
    interface Request {
        user?: IAuthTokenPayload; // Let TS know what type req.user should be
    }
}

export function verifyAuthToken(
    req: Request,
    res: Response,
    next: NextFunction // Call next() to run the next middleware or request handler
) {
    const authHeader = req.get("Authorization");
    // The header should say "Bearer <token string>".  Discard the Bearer part.
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).end();
    } else {
        // JWT_SECRET should be read in index.ts and stored in app.locals
        jwt.verify(
            token,
            req.app.locals.JWT_SECRET as string,
            (error, decoded) => {
                if (decoded) {
                    req.user = decoded as IAuthTokenPayload; // Modify the request for subsequent handlers
                    next();
                } else {
                    res.status(403).end();
                }
            }
        );
    }
}

function generateAuthToken(
    username: string,
    jwtSecret: string
): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const payload: IAuthTokenPayload = {
            username,
        };
        jwt.sign(payload, jwtSecret, { expiresIn: "1d" }, (error, token) => {
            if (error) reject(error);
            else resolve(token as string);
        });
    });
}

export function registerAuthRoutes(
    app: express.Application,
    credentialsProvider: CredentialsProvider
) {
    app.post("/auth/register", async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).send({
                error: "Bad request",
                message: "Missing username or password",
            });
            return;
        }

        try {
            await credentialsProvider.registerUser(username, password);
            try {
                const token = await generateAuthToken(
                    username,
                    req.app.locals.JWT_SECRET
                );
                res.status(200).send({ message: "Login successful", token });
            } catch (error) {
                res.status(500).send({
                    error: "Internal Server Error",
                    message: "Could not generate token",
                });
            }
        } catch (error) {
            res.status(409).send({
                error: "Conflict",
                message: "Username already taken",
            });
            return;
        }
    });

    app.post("/auth/login", async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).send({
                error: "Bad request",
                message: "Missing username or password",
            });
            return;
        }

        const isValid = await credentialsProvider.verifyPassword(
            username,
            password
        );
        if (isValid) {
            try {
                const token = await generateAuthToken(
                    username,
                    req.app.locals.JWT_SECRET
                );
                res.status(200).send({ message: "Login successful", token });
            } catch (error) {
                res.status(500).send({
                    error: "Internal Server Error",
                    message: "Could not generate token",
                });
            }
        } else {
            res.status(401).send({ error: "Incorrect username or password" });
        }
        return;
    });
}
