import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { useSettings } from "../../context/settingsContext";
import LoadingSpinner from "./Spinner";
import WelcomeInstructions from "../WelcomeInstructions";

const convertTimestamp = (timestamp) => {
  if (timestamp == null || timestamp === "") {
    return "";
  }

  let date;
  if (typeof timestamp === "number") {
    date = new Date(timestamp * 1000);
  } else if (typeof timestamp === "string" && /^\d+(\.\d+)?$/.test(timestamp)) {
    date = new Date(Number(timestamp) * 1000);
  } else {
    date = new Date(timestamp);
  }

  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
};

const Dialogue = ({ messages, loadingStatus }) => {
  const scrollRef = useRef(null);
  const { notificationAudio } = useSettings();
  const hasMessages = messages && messages.length > 0;

  // As a simple solution to only play the notification sound on reply,
  // we can use a state variable to track if the user is to expect a reply.
  // Note: We might need another approach to support shared sessions.
  const [playNotification, setPlayNotification] = useState(false);

  useEffect(() => {
    // Auto-scroll to the bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // Set isActive to true after a user have sent a message
    if (hasMessages && messages[messages.length - 1].role === "user") {
      setPlayNotification(true);
    }
    // Play a notification sound if audio is enabled,
    // and the last message is from the assistant
    if (
      playNotification &&
      notificationAudio &&
      hasMessages &&
      messages[messages.length - 1].role === "assistant"
    ) {
      setPlayNotification(false); // Reset playNotification to false after playing
      const audio = new Audio("/audio/mixkit-message-pop-alert-2354.mp3");
      audio.play().catch((error) => {
        console.error("Error playing notification audio:", error);
      });
    }
  }, [messages, hasMessages, notificationAudio, playNotification]);

  return (
    <>
      {hasMessages || loadingStatus?.loading ? (
        <div
          ref={scrollRef} // Reference for scrolling
          className="dialogue h-full w-full max-w-xl p-2 overflow-y-auto"
        >
          {messages?.map((message, index) => (
            <Message
              key={index}
              message={message}
              position={
                message.role === "assistant" ? "chat-start" : "chat-end"
              }
              time={convertTimestamp(message.timestamp)}
            >
              {message.content}
            </Message>
          ))}
          {loadingStatus?.loading ? (
            <div className="flex justify-start p-2">
              <LoadingSpinner message={loadingStatus?.message} />
            </div>
          ) : null}
        </div>
      ) : (
        <div
          ref={scrollRef} // Reference for scrolling
          className="flex-grow content-center px-2"
        >
          <div className="space-y-4 text-center">
            <WelcomeInstructions compact />
            <p className="text-sm dark:text-slate-300">Start the conversation below.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Dialogue;
