import { IoMdSettings } from "react-icons/io";
import Button from "../Button";
import { useSettings } from "../../context/settingsContext";
import { useRef } from "react";

const themeLabels = {
    light: "Ljust",
    winter: "Vinter",
    dark: "Mörkt",
    night: "Natt",
};

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
                    aria-label="Öppna inställningar"
                />
            </div>

            {/* Modal Structure */}
            <dialog
                id="settings_modal"
                className="modal"
                ref={modalRef}
                onKeyDown={handleKeyDown}
                aria-labelledby="settings-heading"
            >
                <div className="modal-box">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h1 id="settings-heading" className="text-xl font-bold">Inställningar</h1>
                    </div>

                    {/* Inställningar */}
                    <div className="space-y-6">
                        {/* Notification Audio */}
                        <div className="flex justify-between items-center">
                            <label htmlFor="notification-audio">Aviseringsljud</label>
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
                            <label htmlFor="settings-theme" className="block mb-2">Tema</label>
                            <select
                                id="settings-theme"
                                className="select select-bordered"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                            >
                                {themes.map((theme, key) => (
                                    <option
                                        key={key}
                                        value={theme}
                                    >
                                        {themeLabels[theme] || "Tema"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* App Info */}
                        <div className="border-t pt-4 mt-4">
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>Driftsättning: {import.meta.env.VITE_DEPLOYMENT_TAG || 'Ej tillgängligt'}</p>
                                <p>Gren: {import.meta.env.VITE_BRANCH || 'Ej tillgängligt'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="modal-action">
                        <Button
                            text="Stäng"
                            onClick={handleCloseClick}
                            color="btn-neutral"
                        />
                    </div>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button>stäng</button>
                </form>
            </dialog>
        </>
    );
};

export default SettingsModal;
