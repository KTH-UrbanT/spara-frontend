import React, { useState } from "react";
import Toast from '../Toast';
import { IoIosStarOutline, IoIosStar } from "react-icons/io";
import { sendRating } from "../../services/api";
import { useSocket } from "../../context/socketContext";
import { useAuth } from "../../context/authContext";

function RatePanel(message) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const { selectedSession } = useSocket();
  const {showToast} = useAuth();

  const handleClickedRating = async (star) => {
    const user =  JSON.parse(localStorage.getItem("user")) || null;
    const userId = user.user_id; 
    const sessionIdInt = JSON.parse(localStorage.getItem("session_id_int"));
    const result = await sendRating(userId ,star, message.message, sessionIdInt)    
    showToast("Rating sent", "error");
    setSelectedRating(star)
  }
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
            <IoIosStar size={30} color="gold" />
          ) : (
            <IoIosStarOutline size={30} color="gray" />
          )}
        </div>
      ))}

       {showToast && (
        <Toast
          type="success"
          message="Rating submitted!"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

export default RatePanel;
