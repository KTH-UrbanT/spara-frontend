import { useState } from "react";
import { useAuth } from "../../context/authContext";
import useModal from "../../hooks/useModal";
import Button from "../Button";
import { HiLockOpen } from "react-icons/hi";
import { HiOutlineMail } from "react-icons/hi";


const ProfileMenu = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const {
        isLoggedIn
    } = useAuth();

    const {
        modalRef,
        handleOpenClick,
        handleCloseClick
    } = useModal();

    const handleLoginClick = async () => {
        // Implement login logic here
    }

    return (
        <>
            {isLoggedIn() ?
                <div className="avatar avatar-placeholder">
                    <div className="bg-neutral text-neutral-content w-12 rounded-full">
                        <span>SY</span>
                    </div>
                </div> :
                <>
                    <Button text={`Login`} size={`btn-sm`} icon={<HiLockOpen />} onClick={handleOpenClick} />
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
                                </li>
                            </ul>
                            <div className="modal-action">
                                <Button text={"Login"} onClick={handleLoginClick} />
                                <Button text={"Close"} onClick={handleCloseClick} />
                            </div>
                        </div>
                    </dialog>
                </>
            }
        </>
    );
}

export default ProfileMenu;

