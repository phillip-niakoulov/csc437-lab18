import { Collection, MongoClient } from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    username: string;
    password: string;
}

interface IUsersDocument {
    _id: string;
    username: string;
    email: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;
    private readonly authorsCollection: Collection<IUsersDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }

        this.collection = mongoClient
            .db()
            .collection<ICredentialsDocument>(COLLECTION_NAME);

        const USERS_COLLECTION_NAME = process.env.USERS_COLLECTION_NAME;
        if (!USERS_COLLECTION_NAME) {
            throw new Error("Missing USERS_COLLECTION_NAME from env file");
        }
        this.authorsCollection = mongoClient
            .db()
            .collection<IUsersDocument>(USERS_COLLECTION_NAME);
    }

    async registerUser(username: string, plaintextPassword: string) {
        const existingUser = await this.collection.findOne({ username });
        if (existingUser) {
            throw new Error("User already exists");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plaintextPassword, salt);
        await this.collection.insertOne({
            username: username,
            password: salt + hashedPassword,
        });
        await this.authorsCollection.insertOne({
            _id: username,
            username: username,
            email: "example@example.com",
        });
        return { message: "User registered successfully" };
    }

    async verifyPassword(username: string, plaintextPassword: string) {
        const userRecord = await this.collection.findOne({ username });
        if (!userRecord) {
            return false;
        }

        const salt = userRecord.password.slice(0, 29);
        const storedHashedPassword = userRecord.password.slice(29);

        const hashedPassword = await bcrypt.hash(plaintextPassword, salt);

        // bcrypt.compare(plaintextPassword, hashedDatabasePassword) DOESNT WORK AS THE SALT ISNT APPENDED PROPERLY
        const isMatch = hashedPassword === storedHashedPassword;

        return isMatch;
    }
}
