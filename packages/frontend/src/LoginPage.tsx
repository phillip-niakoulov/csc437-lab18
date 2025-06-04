import React from "react";
import { Link, useNavigate } from "react-router";
import { useActionState } from "react";
import "./LoginPage.css";

interface LoginPageProps {
    isRegistering: boolean;
    setAuth: React.Dispatch<React.SetStateAction<string>>;
}

interface ActionResult {
    type: "success" | "error";
    message: string;
}

export function LoginPage(props: LoginPageProps) {
    const navigate = useNavigate();

    const { isRegistering, setAuth } = props;
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();

    const handleAuth = async (formData: FormData): Promise<ActionResult> => {
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        if (!username || !password) {
            return {
                type: "error",
                message: "Please fill in both username and password.",
            };
        }

        const endpoint = isRegistering ? "/auth/register" : "/auth/login";
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.message || "Failed to authenticate.";
            return {
                type: "error",
                message: errorMessage,
            };
        }

        const { token } = await response.json();
        setAuth(token);
        navigate("/");

        return {
            type: "success",
            message: isRegistering
                ? "Successfully created account."
                : "Successfully logged in.",
        };
    };

    const [result, submitAction, isPending] = useActionState<
        ActionResult,
        FormData
    >(async (_, formData) => handleAuth(formData), {
        type: "error",
        message: "",
    });

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
            <div aria-live="polite" aria-atomic="true">
                {result && (
                    <p className={`message ${result.type}`}>{result.message}</p>
                )}
                {isPending && <p className="message loading">Loading ...</p>}
            </div>
            {isPending && <p className="message loading">Loading ...</p>}
            <form className="LoginPage-form" action={submitAction}>
                <label htmlFor={usernameInputId}>Username</label>
                <input
                    id={usernameInputId}
                    name="username"
                    required
                    disabled={isPending}
                />

                <label htmlFor={passwordInputId}>Password</label>
                <input
                    id={passwordInputId}
                    name="password"
                    type="password"
                    required
                    disabled={isPending}
                />

                <input
                    type="submit"
                    value={isRegistering ? "Register" : "Submit"}
                    disabled={isPending}
                />
            </form>
            {!isRegistering && (
                <p>
                    Don't have an account?{" "}
                    <Link to="/register">Register here</Link>
                </p>
            )}
        </>
    );
}
