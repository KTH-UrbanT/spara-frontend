import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { useSettings } from "../../context/settingsContext";

const convertTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

const Dialogue = ({ messages, loadingStatus }) => {
  const scrollRef = useRef(null);
  const { notificationAudio } = useSettings();

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
    if (messages && messages.length > 0 && messages[messages.length - 1].role === "user") {
      setPlayNotification(true);
    }
    // Play a notification sound if audio is enabled,
    // and the last message is from the assistant
    if (
      playNotification &&
      notificationAudio &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "assistant"
    ) {
      setPlayNotification(false); // Reset playNotification to false after playing
      const audio = new Audio("/audio/mixkit-message-pop-alert-2354.mp3");
      audio.play().catch((error) => {
        console.error("Error playing notification audio:", error);
      });
    }
  }, [messages]);

  return (
    <>
      {!!messages && messages.length > 0 ? (
        <div
          ref={scrollRef} // Reference for scrolling
          className="dialogue h-full w-full max-w-xl p-2 overflow-y-auto"
        >
          {messages.map((message, index) => (
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
          {loadingStatus && loadingStatus.loading ? (
            <Message position="chat-start" time={null}>
              <span className="loading loading-dots loading-sm"></span>
            </Message>
          ) : null}
        </div>
      ) : (
        <div
          ref={scrollRef} // Reference for scrolling
          className="flex-grow align-center content-center"
        >
          <div className="text-center">
            <div>
              <p className="text-l dark:text-slate-300">No messages yet.</p>
              <p className="text-xl dark:text-slate-300">
                Start the conversation!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dialogue;
