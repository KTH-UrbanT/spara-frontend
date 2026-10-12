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
        showToast("Du har loggats ut.", "success");
    };

    if (!isOpen) return null;

    return (
        <dialog id="logout_modal" className="modal" open={isOpen} onClose={onClose}>
            <div className="modal-box">
                <h2 className="font-bold text-lg">Logga ut</h2>
                <p className="py-4">Vill du logga ut?</p>
                <div className="modal-action gap-2 mt-4 flex justify-end">
                    <Button text={"Logga ut"} onClick={handleLogout} />
                    <Button text={"Stäng"} onClick={onClose} color={"btn-neutral"} />
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>stäng</button>
            </form>
        </dialog>
    );
};

export default LogoutModal;
