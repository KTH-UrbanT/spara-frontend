import React from "react";

const LoadingSpinner = ({ message = "" }) => {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-base-200 px-3 py-2 text-sm text-slate-300">
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
      {message ? <span>{message}</span> : null}
    </div>
  );
};

export default LoadingSpinner;
