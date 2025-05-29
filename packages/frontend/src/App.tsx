import { useState, useEffect } from "react";
import { Routes, Route } from "react-router";
import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts";
import type { IApiImageData } from "../../backend/src/shared/ApiImageData.ts";

function App() {
    const [imageData, setImageData] = useState<IApiImageData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch("/api/images");

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setImageData(data);
            } catch (error) {
                console.error("Error fetching images:", error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, []);

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route
                    path={ValidRoutes.HOME}
                    element={
                        <AllImages
                            loading={isLoading}
                            error={hasError}
                            imageData={imageData}
                        />
                    }
                />
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
                <Route
                    path={ValidRoutes.IMAGES_REF}
                    element={
                        <ImageDetails
                            loading={isLoading}
                            error={hasError}
                            imageData={imageData}
                            setImageData={setImageData}
                        />
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
