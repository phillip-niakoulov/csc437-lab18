import { useId, useState } from "react";
import { useActionState } from "react";

function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = (err) => reject(err);
    });
}

interface ActionResult {
    type: "success" | "error";
    message: string;
}

interface UploadPageProps {
    authToken: string;
}

export function UploadPage({ authToken }: UploadPageProps) {
    const fileInputId = useId();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageTitle, setImageTitle] = useState<string>("");

    const handleUpload = async (formData: FormData): Promise<ActionResult> => {
        const file = formData.get("image") as File;
        const title = formData.get("name") as string;

        if (!file || !title) {
            return {
                type: "error",
                message: "Please provide both an image and a title.",
            };
        }

        const response = await fetch("/api/images", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.message || "Failed to upload image.";
            return {
                type: "error",
                message: errorMessage,
            };
        }

        return {
            type: "success",
            message: "Image uploaded successfully!",
        };
    };

    const [result, submitAction, isPending] = useActionState<
        ActionResult,
        FormData
    >(async (_, formData) => handleUpload(formData), {
        type: "error",
        message: "",
    });

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const dataURL = await readAsDataURL(file);
                setImagePreview(dataURL);
            } catch (error) {
                console.error("Error reading file:", error);
            }
        }
    };

    return (
        <>
            <h2>Upload</h2>
            <div aria-live="polite" aria-atomic="true">
                {result && (
                    <p className={`message ${result.type}`}>{result.message}</p>
                )}
                {isPending && <p className="message loading">Loading ...</p>}
            </div>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    submitAction(formData);
                }}
            >
                <div>
                    <label htmlFor={fileInputId}>
                        Choose image to upload:{" "}
                    </label>
                    <input
                        id={fileInputId}
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        required
                        onChange={handleFileChange}
                        disabled={isPending}
                    />
                </div>
                <div>
                    <label>
                        <span>Image title: </span>
                        <input
                            name="name"
                            value={imageTitle}
                            onChange={(e) => setImageTitle(e.target.value)}
                            required
                            disabled={isPending}
                        />
                    </label>
                </div>

                <div>
                    {imagePreview && (
                        <img
                            style={{ width: "20em", maxWidth: "100%" }}
                            src={imagePreview}
                            alt="Image preview"
                        />
                    )}
                </div>

                <input
                    type="submit"
                    value="Confirm upload"
                    disabled={isPending}
                />
            </form>
        </>
    );
}
