import { useState } from "react";

interface INameEditorProps {
    initialValue: string;
    imageId: string;
    onNameChange: (imageId: string, newName: string) => Promise<void>;
}

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(props.initialValue);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);

    async function handleSubmitPressed() {
        try {
            const response = await fetch("/api/images");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await response.json();
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
