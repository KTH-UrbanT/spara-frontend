import React from "react";

const Toast = ({ toasts = [] }) => {
  const getAlertClass = (type) => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      case 'info':
      default:
        return 'alert-info';
    }
  };

  return (
    <div className="toast toast-top toast-center z-50">
      {toasts.map((toast, index) => (
        <div key={index} role="alert" className={`alert ${getAlertClass(toast.type)}`}>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;
