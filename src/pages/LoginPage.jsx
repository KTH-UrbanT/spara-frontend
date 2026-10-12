import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ContinueWithEmailModal from "../components/modal/ContinueWithEmailModal";
import { useAuth } from "../context/authContext";
import { login, localizeServiceError } from "../services/api";

const LoginPage = () => {
    const { showToast, setUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await login({ username: email, password: password });
            // Clear any existing user data first
            localStorage.removeItem("user");

            const userData = {
                user_id: response.user_id,
                email: response.email,
                username: response.username,
                token: response.access_token,
                temporary_user: response.temporary_user
            };
            setUser(userData);
            showToast("You are logged in!", "success");
            navigate("/");
        } catch (err) {
            console.error(err.message || "Something went wrong. Please try again.");
            showToast(localizeServiceError(err.response?.data?.detail || err.message, "Login failed. Please try again."), "error");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="card w-full max-w-sm bg-base-100 shadow-xl">
                <div className="card-body p-6">
                    <h2 className="card-title text-xl font-bold justify-center mb-4">
                        Log in
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="form-control">
                            <label htmlFor="email" className="label py-1">
                                <span className="label-text text-sm">Email</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                aria-label="Email address"
                                className="input input-bordered w-full"
                                value={email}
                                onChange={(e) => {
                                    e.target.setCustomValidity("");
                                    setEmail(e.target.value);
                                }}
                                onInvalid={(e) => e.target.setCustomValidity(
                                    e.target.validity.valueMissing ? "Enter your email address." : "Enter a valid email address."
                                )}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-control">
                            <label htmlFor="password" className="label py-1">
                                <span className="label-text text-sm">Password</span>
                            </label>
                            <input
                                id="password"
                                type="password"
                                aria-label="Password"
                                className="input input-bordered w-full"
                                value={password}
                                onChange={(e) => {
                                    e.target.setCustomValidity("");
                                    setPassword(e.target.value);
                                }}
                                onInvalid={(e) => e.target.setCustomValidity("Enter your password.")}
                                required
                            />
                        </div>

                        <div className="form-control mt-4">
                            <Button
                                type="submit"
                                text="Log in"
                                size="w-full"
                                color="btn-primary"
                            />
                        </div>
                    </form>

                    <div className="divider my-3 text-xs">OR</div>

                    <Button
                        text="Continue with email"
                        onClick={() => setEmailModalOpen(true)}
                        size="w-full"
                        color="btn-outline"
                        borderColor="border-primary"
                        textColor="text-primary"
                        type="button"
                    />

                    <div className="text-center mt-3">
                        <span className="text-sm text-base-content/70">Don't have an account? </span>
                        <a href="/register" className="link link-primary text-xs">Sign up</a>
                    </div>
                </div>
            </div>
            <ContinueWithEmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setEmailModalOpen(false)}
            />
        </div>
    );
};

export default LoginPage;
