import { MongoClient, Collection, ObjectId } from "mongodb";

interface IImageDocument {
    src: string;
    name: string;
    authorId: string;
}

export interface IApiImageData {
    id: string;
    src: string;
    name: string;
    author: IApiUserData;
}

export interface IApiUserData {
    id: string;
    username: string;
}

export class ImageProvider {
    private collection: Collection<IImageDocument>;
    private usersCollection: Collection<{ _id: string; username: string }>;

    constructor(private readonly mongoClient: MongoClient) {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        const usersCollectionName = process.env.USERS_COLLECTION_NAME;

        if (!collectionName || !usersCollectionName) {
            throw new Error(
                "Missing collection names from environment variables"
            );
        }
        this.collection = this.mongoClient.db().collection(collectionName);
        this.usersCollection = this.mongoClient
            .db()
            .collection(usersCollectionName);
    }

    getAllImages() {
        return this.collection.find().toArray();
    }

    async getImageAuthorId(imageId: string) {
        const image = await this.collection.findOne({
            _id: new ObjectId(imageId),
        });
        return image ? image.authorId : null;
    }

    async getImages(substring?: string): Promise<IApiImageData[]> {
        const imageDocuments = await this.getAllImages();
        const imagesWithAuthors: IApiImageData[] = await Promise.all(
            imageDocuments.map(async (imageDoc) => {
                const userDoc = await this.usersCollection.findOne({
                    _id: imageDoc.authorId,
                });

                return {
                    id: imageDoc._id.toString(),
                    src: imageDoc.src,
                    name: imageDoc.name,
                    author: {
                        id: userDoc ? userDoc._id.toString() : "",
                        username: userDoc ? userDoc.username : "Unknown",
                    },
                };
            })
        );

        if (substring) {
            return imagesWithAuthors.filter(
                (image) => image.name && image.name.includes(substring)
            );
        }

        return imagesWithAuthors;
    }

    async updateImageName(imageId: string, newName: string): Promise<number> {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(imageId) },
            { $set: { name: newName } }
        );

        return result.matchedCount;
    }

    async createImage(
        src: string,
        name: string,
        authorId: string
    ): Promise<void> {
        const newImage: IImageDocument = {
            src,
            name,
            authorId,
        };

        await this.collection.insertOne(newImage);
    }
}
