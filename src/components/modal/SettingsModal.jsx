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
    // Attach event listeners for closing the modal
    useRef(() => {
        const modal = modalRef.current;
        modal.addEventListener("keydown", handleKeyDown);

        return () => {
            modal.removeEventListener("keydown", handleKeyDown);
        };
    }
    , []);

    return (
        <>
            {/* Trigger Button */}
            <div className="fixed right-4 top-4 z-50">
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
            >
                <div className="modal-box">
                    <h1 className="font-bold text-2xl">Settings</h1>
                    <ul className="space-y-2">
                        <li>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Notification audio</legend>
                            <input
                                type="checkbox"
                                id="notification-audio"
                                checked={notificationAudio}
                                onChange={(e) => setNotificationAudio(e.target.checked)}
                                className="toggle toggle-primary"
                            />
                        </fieldset>
                        </li>
                        <li>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Theme</legend>
                            <select
                                className="select select-primary"
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
                        </fieldset>
                        </li>
                    </ul>
                    <div className="modal-action">
                        <Button text={"Close"} onClick={handleCloseClick} />
                    </div>
                </div>
            </dialog>
        </>
    );
};

export default SettingsModal;