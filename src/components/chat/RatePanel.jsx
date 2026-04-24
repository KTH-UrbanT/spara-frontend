import React, { useEffect, useState } from "react";
import { IoIosStarOutline, IoIosStar } from "react-icons/io";
import { sendRating } from "../../services/api";
import { useAuth } from "../../context/authContext";
import { useSocket } from "../../context/socketContext";

function RatePanel({ message }) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(message?.rating ?? 0);
  const { showToast } = useAuth();
  const { updateMessageRating } = useSocket();

  useEffect(() => {
    setSelectedRating(message?.rating ?? 0);
  }, [message?.rating]);

  const handleClickedRating = async (star) => {
    try {
      const user = JSON.parse(localStorage.getItem("user")) || null;
      const userId = user.user_id;
      const sessionIdInt = JSON.parse(localStorage.getItem("session_id_int"));
      const result = await sendRating(userId, star, message.content, sessionIdInt);
      updateMessageRating(message, star, result?.rating_id ?? null);
      showToast("Rating sent", "success");
      setSelectedRating(star);
    } catch (error) {
      console.error("Failed to send rating:", error);
      showToast("Failed to send rating", "error");
    }
  };

  return (
    <div style={{ display: "flex", cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
          onClick={() => handleClickedRating(star)}
        >
          {star <= (hoveredStar || selectedRating) ? (
            <IoIosStar size={20} color="gold" />
          ) : (
            <IoIosStarOutline size={20} color="gray" />
          )}
        </div>
      ))}
    </div>
  );
}

export default RatePanel;
