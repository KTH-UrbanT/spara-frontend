import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex gap-1">
      <span
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "0s" }}
      ></span>
      <span
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "0.15s" }}
      ></span>
      <span
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "0.3s" }}
      ></span>
    </div>
  );
};

export default LoadingSpinner;
