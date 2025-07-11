/**
 * Use Modal Hook
 * 
 * This hook provides functionality to manage a modal dialog
 * trough providing the boilerplate code for opening, closing,
 * and handling keyboard events (close).
 */
import { useRef } from "react";

const useModal = () => {

    const modalRef = useRef(null);

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

    return {
        modalRef,
        handleOpenClick,
        handleCloseClick,
        handleKeyDown
    };
}

export default useModal;

