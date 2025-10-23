import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from './Icons';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      iconColor: 'text-green-500',
      textColor: 'text-green-800',
      icon: <CheckCircleIcon className="h-6 w-6" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      iconColor: 'text-red-500',
      textColor: 'text-red-800',
      icon: <XCircleIcon className="h-6 w-6" />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-800',
      icon: <ExclamationTriangleIcon className="h-6 w-6" />,
    },
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed top-20 right-8 z-[100] w-full max-w-sm animate-fade-in-down">
      <div className={`rounded-lg shadow-lg border-l-4 ${styles.bg} ${styles.border} p-4`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${styles.iconColor}`}>
            {styles.icon}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${styles.textColor}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1 ${styles.textColor} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;