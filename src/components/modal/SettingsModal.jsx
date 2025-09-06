import { IoMdSettings } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import Button from "../Button";
import { useSettings } from "../../context/settingsContext";
import { useRef } from "react";

const SettingsModal = () => {
    const {
        setNotificationAudio,
        notificationAudio,
        theme,
        setTheme,
        themes,
    } = useSettings();

    const modalRef = useRef();

    const handleOpenClick = (e) => {
        e.stopPropagation();
        modalRef.current.showModal();
    }

    const handleCloseClick = () => {
        modalRef.current.close();
    }

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            modalRef.current.close();
        }
    }

    return (
        <>
            {/* Trigger Button */}
            <div>
                <Button
                    icon={<IoMdSettings size={24} />}
                    color={"btn-neutral"}
                    size={"btn-sm"}
                    onClick={handleOpenClick}
                />
            </div>

            {/* Modal Structure */}
            <dialog
                id="settings_modal"
                className="modal"
                ref={modalRef}
                onKeyDown={handleKeyDown}
            >
                <div className="modal-box">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold">Settings</h1>
                    </div>

                    {/* Settings */}
                    <div className="space-y-6">
                        {/* Notification Audio */}
                        <div className="flex justify-between items-center">
                            <span>Notification audio</span>
                            <input
                                type="checkbox"
                                id="notification-audio"
                                checked={notificationAudio}
                                onChange={(e) => setNotificationAudio(e.target.checked)}
                                className="toggle toggle-primary"
                            />
                        </div>

                        {/* Theme */}
                        <div className="flex justify-between">
                            <label className="block mb-2">Theme</label>
                            <select
                                className="select select-bordered"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                            >
                                {themes.map((theme, key) => (
                                    <option
                                        key={key}
                                        value={theme}
                                    >
                                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* App Info */}
                        <div className="border-t pt-4 mt-4">
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>Deployment: {import.meta.env.VITE_DEPLOYMENT_TAG || 'N/A'}</p>
                                <p>Branch: {import.meta.env.VITE_BRANCH || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="modal-action">
                        <Button
                            text="Close"
                            onClick={handleCloseClick}
                            color="btn-neutral"
                        />
                    </div>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
};

export default SettingsModal;