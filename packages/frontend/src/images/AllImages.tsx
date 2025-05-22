import type { IImageData } from "../MockAppData.ts";
import { ImageGrid } from "./ImageGrid.tsx";

interface AllImagesProps {
    imageData: IImageData[];
}

export function AllImages({ imageData }: AllImagesProps) {
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={imageData} />
        </>
    );
}
