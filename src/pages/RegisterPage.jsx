import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ContinueWithEmailModal from "../components/modal/ContinueWithEmailModal";
import { useAuth } from "../context/authContext";
import { registerUser, registerTemporaryUserToRegular, localizeServiceError } from "../services/api";

const RegisterPage = () => {
    const { showToast, user } = useAuth();
    const navigate = useNavigate();
    const [isEmailModalOpen, setEmailModalOpen] = useState(false);

    const [form, setForm] = useState({
        username: "",
        email: user?.email || "",
        password: "",
    });

    useEffect(() => {
        if (user?.email) {
            setForm((current) => ({ ...current, email: user.email }));
        }
    }, [user?.email]);

    const handleChange = (e) => {
        e.target.setCustomValidity("");
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

            showToast("Registreringen är klar. Logga in.", "success");
            navigate("/login");
        } catch (err) {
            showToast(localizeServiceError(err.response?.data?.detail || err.message, "Registreringen misslyckades. Försök igen."), "error");
            console.error(err);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="card w-full max-w-sm bg-base-100 shadow-xl">
                <div className="card-body p-6">
                    <h2 className="card-title text-xl font-bold justify-center mb-4">
                        Registrera dig
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="form-control">
                            <label htmlFor="register-username" className="label py-1">
                                <span className="label-text text-sm">Användarnamn</span>
                            </label>
                            <input
                                type="text"
                                id="register-username"
                                name="username"
                                aria-label="Användarnamn"
                                className="input input-bordered w-full"
                                value={form.username}
                                onChange={handleChange}
                                onInvalid={(e) => e.target.setCustomValidity("Ange ett användarnamn.")}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label htmlFor="register-email" className="label py-1">
                                <span className="label-text text-sm">E-post</span>
                            </label>
                            <input
                                type="email"
                                id="register-email"
                                name="email"
                                aria-label="E-postadress"
                                className="input input-bordered w-full"
                                value={form.email}
                                onChange={handleChange}
                                onInvalid={(e) => e.target.setCustomValidity(
                                    e.target.validity.valueMissing ? "Ange din e-postadress." : "Ange en giltig e-postadress."
                                )}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label htmlFor="register-password" className="label py-1">
                                <span className="label-text text-sm">Lösenord</span>
                            </label>
                            <input
                                type="password"
                                id="register-password"
                                name="password"
                                aria-label="Lösenord"
                                className="input input-bordered w-full"
                                value={form.password}
                                onChange={handleChange}
                                onInvalid={(e) => e.target.setCustomValidity("Ange ett lösenord.")}
                                required
                            />
                        </div>

                        <div className="form-control mt-4">
                            <Button
                                text={user?.temporary_user ? "Slutför registrering" : "Registrera dig"}
                                type="submit"
                                size="w-full"
                                color="btn-primary"
                            />
                        </div>
                    </form>

                    <div className="divider my-3 text-xs">ELLER</div>

                    <Button
                        text="Fortsätt med e-post"
                        onClick={() => setEmailModalOpen(true)}
                        size="w-full"
                        color="btn-outline"
                        borderColor="border-primary"
                        textColor="text-primary"
                        type="button"
                    />

                    <div className="text-center mt-3">
                        <span className="text-xs text-base-content/70">Har du redan ett konto? </span>
                        <a href="/login" className="link link-primary text-xs">Logga in</a>
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

export default RegisterPage;
