import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/authContext";
import { registerUser, registerTemporaryUserToRegular } from "../services/api";

const RegisterPage = () => {
    const { showToast, user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!user || !user.user_id) {
                // No temporary user or not logged in, register as new user
                await registerUser({
                    username: form.username,
                    email: form.email,
                    password: form.password
                });
            } else {
                // Convert temporary user to regular user
                await registerTemporaryUserToRegular({
                    userId: user.user_id,
                    username: form.username,
                    email: form.email,
                    password: form.password
                });
            }

            showToast("Registration successful! Please log in.", "success");
            navigate("/login");
        } catch (err) {
            showToast("Registration failed. Please try again.", "error");
            console.error(err);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="card w-full max-w-sm bg-base-100 shadow-xl">
                <div className="card-body p-6">
                    <h2 className="card-title text-xl font-bold justify-center mb-4">
                        Register
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text text-sm">Username</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                className="input input-bordered w-full"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text text-sm">Email</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="input input-bordered w-full"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text text-sm">Password</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="input input-bordered w-full"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-control mt-4">
                            <Button
                                text={user?.temporary_user ? "Complete Registration" : "Register"}
                                type="submit"
                                size="w-full"
                                color="btn-primary"
                            />
                        </div>
                    </form>

                    <div className="divider my-3 text-xs">OR</div>

                    <Button
                        text="Continue as Guest"
                        onClick={() => navigate('/')}
                        size="w-full"
                        color="btn-outline"
                        borderColor="border-primary"
                        textColor="text-primary"
                    />

                    <div className="text-center mt-3">
                        <span className="text-xs text-base-content/70">Already have an account? </span>
                        <a href="/login" className="link link-primary text-xs">Login</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;