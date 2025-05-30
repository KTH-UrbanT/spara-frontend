import React, { useState } from "react";
import { IoIosStarOutline, IoIosStar } from "react-icons/io";

function RatePanel() {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  return (
    <div style={{ display: "flex", cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
          onClick={() => setSelectedRating(star)}
        >
          {star <= (hoveredStar || selectedRating) ? (
            <IoIosStar size={30} color="gold" />
          ) : (
            <IoIosStarOutline size={30} color="gray" />
          )}
        </div>
      ))}
    </div>
  );
}

export default RatePanel;
