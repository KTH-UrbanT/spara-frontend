import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import Button from '../Button';

const LogoutModal = ({ isOpen, onClose }) => {
    const { setUser, showToast, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log("Logging out...");
        logout();
        onClose();
        navigate('/');
        showToast("Logged out successfully.", "success");
    };

    if (!isOpen) return null;

    return (
        <dialog id="logout_modal" className="modal" open={isOpen} onClose={onClose}>
            <div className="modal-box">
                <h2 className="font-bold text-lg">Log out</h2>
                <p className="py-4">Are you sure you want to log out?</p>
                <div className="modal-action gap-2 mt-4 flex justify-end">
                    <Button text={"Logout"} onClick={handleLogout} />
                    <Button text={"Close"} onClick={onClose} color={"btn-neutral"} />
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
};

export default LogoutModal;