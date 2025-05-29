import type { IApiImageData } from "../../../backend/src/shared/ApiImageData.ts";
import { ImageGrid } from "./ImageGrid.tsx";

interface AllImagesProps {
    loading: boolean;
    error: boolean;
    imageData: IApiImageData[];
}

export function AllImages({ loading, error, imageData }: AllImagesProps) {
    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Something went wrong.</p>;
    }

    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={imageData} />
        </>
    );
}
