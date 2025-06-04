import type { IApiImageData } from "../../../backend/src/shared/ApiImageData.ts";
import { ImageGrid } from "./ImageGrid.tsx";

interface AllImagesProps {
    loading: boolean;
    error: boolean;
    imageData: IApiImageData[];
    searchPanel: React.ReactNode;
}

export function AllImages({
    loading,
    error,
    imageData,
    searchPanel,
}: AllImagesProps) {
    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Something went wrong.</p>;
    }

    return (
        <>
            <h2>All Images</h2>
            {searchPanel}
            <ImageGrid images={imageData} />
        </>
    );
}
