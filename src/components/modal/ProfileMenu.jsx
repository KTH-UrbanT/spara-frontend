import { useAuth } from "../../context/authContext";
import useModal from "../../hooks/useModal";
import Button from "../Button";
import { HiLockOpen } from "react-icons/hi";
import { HiOutlineMail } from "react-icons/hi";


const ProfileMenu = () => {

    const {
        isLoggedIn
    } = useAuth();

    const {
        modalRef,
        handleOpenClick,
        handleCloseClick
    } = useModal();

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
                            <h1 className="font-bold text-2xl">Login</h1>

                            <label className="validator">
                                <HiOutlineMail />
                                <input type="text" placeholder="Primary" className="input input-primary" />
                            </label>

                            <div className="modal-action">
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

