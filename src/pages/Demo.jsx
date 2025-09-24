import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useSocket } from "../context/socketContext";

export default function Demo() {
    const nav = useNavigate();
    const { handleSendFirstMessage } = useSocket();
    const { user, showToast } = useAuth();
    const location = useLocation();
    const [hasProcessedAutoMessage, setHasProcessedAutoMessage] = useState(false);

    // Add a ref to track processing to prevent double execution
    const processingRef = useRef(false);

    useEffect(() => {
        // Wait for user to be created/loaded
        if (!user || !user.user_id) {
            console.log('Waiting for user or already processed:', {
                hasUser: !!user,
                userId: user?.user_id,
            });
            return;
        }

        // Check if already processing or processed
        if (hasProcessedAutoMessage || processingRef.current) return;

        processingRef.current = true; // Mark as processing

        // Parse URL parameters
        const urlParams = new URLSearchParams(location.search);
        const referral = urlParams.get('referral');
        const autoMessage = urlParams.get('auto_message');

        if (!referral || referral.trim() === '') return;
        if (!autoMessage || autoMessage.trim() === '') return;

        console.log('Processing auto-start demo for user:', user.user_id);
        console.log('Referral:', referral);
        console.log('Auto message:', decodeURIComponent(autoMessage));

        // Send the auto message
        try {
            handleSendFirstMessage(decodeURIComponent(autoMessage));
            setHasProcessedAutoMessage(true);
            showToast(`Welcome to the demo of ${referral}!`, "success");
        } catch (error) {
            console.error('Failed to send auto message:', error);
            showToast('Failed to start demo session', 'error');
            processingRef.current = false; // Reset processing flag
        }
    }, [user?.user_id, location.search]);


    // Show loading state while waiting for user creation or processing
    if (!user || !hasProcessedAutoMessage) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Starting your Climate Q demo session...</p>
                </div>
            </div>
        );
    }

    return null;
}
