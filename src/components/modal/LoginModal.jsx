import { useState } from "react";
import useModal from "../../hooks/useModal";
import Button from "../Button";
import { HiLockOpen } from "react-icons/hi";
import { HiOutlineMail } from "react-icons/hi";
import { NavLink, useNavigate } from "react-router-dom";


const LoginModal = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const {
        modalRef,
        handleOpenClick,
        handleCloseClick
    } = useModal();

    const handleSignUpClick = () => {
        // Navigate to sign-up page
        navigate("/signup");
        // Close the modal
        handleCloseClick();
    }

    const handleLoginClick = async () => {
        // Implement login logic here
    }

    return (
        <>
            <Button text={`Login`} size={`btn-sm`} icon={<HiLockOpen />} color={`btn-primary`} onClick={handleOpenClick} />
            {/* Modal Structure */}
            <dialog
                id="logged-out-modal"
                className="modal"
                ref={modalRef}
            >
                <div className="modal-box">
                    <ul className="space-y-2">
                        <li>
                            <h1 className="font-bold text-2xl">Login</h1>
                        </li>
                        <li>
                            <label className="input input-bordered input-primary flex items-center gap-2 join-item">
                                <HiOutlineMail />
                                <input
                                    type="email"
                                    placeholder="mail@example.com"
                                    required
                                    className="w-full"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </label>
                        </li>
                        <li>
                            <label className="input input-bordered input-primary flex items-center gap-2 join-item">
                                <HiLockOpen />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    required
                                    className="w-full"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </label>
                        </li>
                        <li>
                            <p className="text-sm">Don't have an account? <span className="link" onClick={handleSignUpClick}>Sign up now!</span></p>
                        </li>
                    </ul>
                    <div className="modal-action">
                        <Button text={"Login"} color={"btn-primary"} onClick={handleLoginClick} />
                        <Button text={"Close"} color={"btn-secondary"} onClick={handleCloseClick} />
                    </div>
                </div>
            </dialog>
        </>
    );
}

export default LoginModal;

