import { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router";
import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts";
import type { IApiImageData } from "../../backend/src/shared/ApiImageData.ts";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";
import { ProtectedRoute } from "./ProtectedRoute.tsx";

function App() {
    const [authToken, setAuth] = useState<string>("");
    const [searchString, setSearchString] = useState<string>("");
    const [imageData, setImageData] = useState<IApiImageData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);

    const searchCountRef = useRef(0);

    const fetchImages = async () => {
        setIsLoading(true);
        setHasError(false);
        searchCountRef.current += 1;
        const thisRequestNumber = searchCountRef.current;

        try {
            const response = await fetch("/api/images", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (thisRequestNumber === searchCountRef.current) {
                setImageData(data);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
            if (thisRequestNumber === searchCountRef.current) {
                setHasError(true);
            }
        } finally {
            if (thisRequestNumber === searchCountRef.current) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchImages();
    }, [authToken]);

    async function handleImageSearch() {
        setIsLoading(true);
        setHasError(false);

        searchCountRef.current += 1;
        const thisRequestNumber = searchCountRef.current;

        try {
            const url = searchString
                ? `/api/images/search?substring=${encodeURIComponent(
                      searchString
                  )}`
                : "/api/images";

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (thisRequestNumber === searchCountRef.current) {
                setImageData(data);
            }
        } catch (error) {
            console.error("Error searching images:", error);
            if (thisRequestNumber === searchCountRef.current) {
                setHasError(true);
            }
            if (thisRequestNumber === searchCountRef.current) {
                setIsLoading(false);
            }
        } finally {
            if (thisRequestNumber === searchCountRef.current) {
                setIsLoading(false);
            }
            if (thisRequestNumber === searchCountRef.current) {
                setHasError(false);
            }
        }
    }

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route
                    path={ValidRoutes.HOME}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <AllImages
                                loading={isLoading}
                                error={hasError}
                                imageData={imageData}
                                searchPanel={
                                    <ImageSearchForm
                                        searchString={searchString}
                                        onSearchStringChange={setSearchString}
                                        onSearchRequested={handleImageSearch}
                                    />
                                }
                            />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ValidRoutes.UPLOAD}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <UploadPage authToken={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ValidRoutes.LOGIN}
                    element={
                        <LoginPage isRegistering={false} setAuth={setAuth} />
                    }
                />
                <Route
                    path={ValidRoutes.REGISTER}
                    element={
                        <LoginPage isRegistering={true} setAuth={setAuth} />
                    }
                />
                <Route
                    path={ValidRoutes.IMAGES_REF}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <ImageDetails
                                loading={isLoading}
                                error={hasError}
                                imageData={imageData}
                                setImageData={setImageData}
                                authToken={authToken}
                            />
                        </ProtectedRoute>
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
