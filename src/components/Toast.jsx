import React from "react";

const Toast = ({ toasts = [] }) => {
  return (
    <div className="toast toast-top toast-center z-50">
      {toasts.map((toast, index) => (
        <div key={index} className={`alert alert-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;
