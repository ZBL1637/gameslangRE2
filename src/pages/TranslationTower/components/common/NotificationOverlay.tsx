import React, { useEffect, useState } from 'react';
import './NotificationOverlay.scss';

export interface NotificationItem {
  id: string;
  type: 'rune' | 'ticket' | 'phrase' | 'info';
  message: string;
  icon?: string;
}

interface NotificationOverlayProps {
  notifications: NotificationItem[];
  onRemove: (id: string) => void;
}

export const NotificationOverlay: React.FC<NotificationOverlayProps> = ({
  notifications,
  onRemove
}) => {
  return (
    <div className="notification-overlay-container">
      {notifications.map(item => (
        <NotificationToast key={item.id} item={item} onRemove={onRemove} />
      ))}
    </div>
  );
};

const NotificationToast: React.FC<{ item: NotificationItem; onRemove: (id: string) => void }> = ({ item, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(item.id);
    }, 3000); // 3秒后自动消失
    return () => clearTimeout(timer);
  }, [item.id, onRemove]);

  return (
    <div className={`notification-toast ${item.type} animate-slide-in`}>
      <div className="toast-icon">{item.icon || '🔔'}</div>
      <div className="toast-content">
        <span className="toast-message">{item.message}</span>
      </div>
    </div>
  );
};
