import { useState } from "react";

interface INameEditorProps {
    initialValue: string;
    imageId: string;
    onNameChange: (imageId: string, newName: string) => Promise<void>;
    authToken: String;
}

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(props.initialValue);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);

    async function handleSubmitPressed() {
        setIsLoading(true);
        setHasError(false);

        try {
            const response = await fetch("/api/images/", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${props.authToken}`,
                },
                body: JSON.stringify({
                    name: input,
                    imageId: props.imageId,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await props.onNameChange(props.imageId, input);
        } catch (error) {
            console.error("Error fetching images:", error);
            setHasError(true);
        } finally {
            setIsLoading(false);
            setIsEditingName(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name{" "}
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                </label>
                <button
                    disabled={input.length === 0 || isLoading}
                    onClick={handleSubmitPressed}
                >
                    Submit
                </button>
                <button onClick={() => setIsEditingName(false)}>Cancel</button>
                {isLoading && <p>Loading...</p>}
                {hasError && <p>Something went wrong.</p>}
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={() => setIsEditingName(true)}>
                    Edit name
                </button>
            </div>
        );
    }
}
