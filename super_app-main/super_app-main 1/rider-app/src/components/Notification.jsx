import React, { useState, useEffect } from 'react';

const Notification = ({ message, type = 'info', duration = 1000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getNotificationStyle = () => {
    const baseStyle = {
      position: 'fixed',
      top: 20,
      right: 20,
      padding: '16px 20px',
      borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      maxWidth: 400,
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease',
      cursor: 'pointer'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          background: '#4CAF50',
          color: 'white'
        };
      case 'error':
        return {
          ...baseStyle,
          background: '#f44336',
          color: 'white'
        };
      case 'warning':
        return {
          ...baseStyle,
          background: '#FF9800',
          color: 'white'
        };
      case 'info':
      default:
        return {
          ...baseStyle,
          background: '#2196F3',
          color: 'white'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info':
      default: return 'ℹ️';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={getNotificationStyle()}
      onClick={() => {
        setIsVisible(false);
        if (onClose) onClose();
      }}
    >
      <div style={{ fontSize: 20 }}>{getIcon()}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 2 }}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>{message}</div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
          if (onClose) onClose();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: 18,
          cursor: 'pointer',
          padding: 0,
          opacity: 0.7
        }}
      >
        ✕
      </button>
    </div>
  );
};

// Notification Manager Component
export const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 1000) => {
    const id = Date.now();
    const newNotification = { id, message, type, duration };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Expose addNotification globally for easy access
  if (typeof window !== 'undefined') {
    window.showNotification = addNotification;
  }

  return (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
};

export default Notification; 