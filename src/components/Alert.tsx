import React, { useEffect, useState } from 'react';

interface AlertProps {
  message: string | null;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(), 500);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, onClose, duration]);

  if (!message) return null;

  const baseClasses = "fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl text-white font-bold transition-all duration-500 transform";
  const typeClasses = type === 'success' ? "bg-green-500" : "bg-red-500";
  const visibilityClasses = isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0";

  return (
    <div className={`${baseClasses} ${typeClasses} ${visibilityClasses}`}>
      {message}
    </div>
  );
};

export default Alert;