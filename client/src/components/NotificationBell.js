import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from '../utils/axios';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Bildirimler yüklenemedi:', err);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await axios.put(`/notifications/${notification._id}/read`);
        setUnreadCount(prev => prev - 1);
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, read: true } : n
        ));
      } catch (err) {
        console.error('Bildirim güncellenemedi:', err);
      }
    }
    handleClose();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 360,
          },
        }}
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.read ? 'inherit' : 'action.hover',
                whiteSpace: 'normal'
              }}
            >
              <Box>
                <Typography variant="body2">
                  <strong>{notification.sender.username}</strong>{' '}
                  {notification.type === 'like' && 'gönderini beğendi'}
                  {notification.type === 'comment' && 'gönderine yorum yaptı'}
                  {notification.type === 'follow' && 'seni takip etmeye başladı'}
                  {notification.type === 'message' && 'sana mesaj gönderdi'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleClose}>
            <Typography color="text.secondary">
              Bildirim bulunmuyor
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;