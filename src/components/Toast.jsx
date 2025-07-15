import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const typeClass = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
  }[type];

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`alert shadow-lg ${typeClass}`}>
        <span>{message}</span>
      </div>
    </div>
  );
}
