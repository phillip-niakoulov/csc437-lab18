import type { IApiImageData } from "../../../backend/src/shared/ApiImageData.ts";
import { useParams } from "react-router";
import { ImageNameEditor } from "../ImageNameEditor.tsx";

interface AllImagesProps {
    loading: boolean;
    error: boolean;
    imageData: IApiImageData[];
    setImageData: React.Dispatch<React.SetStateAction<IApiImageData[]>>;
    authToken: string;
}

export function ImageDetails({
    loading,
    error,
    imageData,
    setImageData,
    authToken,
}: AllImagesProps) {
    const { imageId } = useParams();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Something went wrong.</p>;
    }

    const image = imageData.find((image) => image.id === imageId);
    if (!image) {
        return <h2>Image not found</h2>;
    }

    const handleNameChange = async (id: string, newName: string) => {
        setImageData((prevData) =>
            prevData.map((img) =>
                img.id === id ? { ...img, name: newName } : img
            )
        );
    };

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <ImageNameEditor
                initialValue={image.name}
                imageId={image.id}
                onNameChange={handleNameChange}
                authToken={authToken}
            />
            <img
                className="ImageDetails-img"
                src={image.src}
                alt={image.name}
            />
        </>
    );
}
