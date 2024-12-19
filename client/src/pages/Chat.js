import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Badge,
  Tooltip,
  AppBar,
  Toolbar,
  Button
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import axios from '../utils/axios';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recipientId, recipientName, recipientAvatar } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipientStatus, setRecipientStatus] = useState('offline');
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [error, setError] = useState('');

  useEffect(() => {
    if (recipientId) {
      fetchMessages();
      // Kullanıcı durumunu kontrol et
      checkRecipientStatus();
      // Her 30 saniyede bir kullanıcı durumunu güncelle
      const statusInterval = setInterval(checkRecipientStatus, 30000);
      return () => clearInterval(statusInterval);
    }
  }, [recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkRecipientStatus = async () => {
    try {
      const res = await axios.get(`/users/status/${recipientId}`);
      setRecipientStatus(res.data.status);
    } catch (err) {
      console.error('Kullanıcı durumu kontrol hatası:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/messages/${recipientId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Mesajları getirme hatası:', err);
      setError('Mesajlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post('/messages', {
        recipientId,
        content: newMessage
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Mesaj gönderme hatası:', err);
      setError('Mesaj gönderilemedi');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#44b700';
      case 'away':
        return '#ffa726';
      case 'busy':
        return '#f44336';
      default:
        return '#bdbdbd';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Çevrimiçi';
      case 'away':
        return 'Uzakta';
      case 'busy':
        return 'Meşgul';
      default:
        return 'Çevrimdışı';
    }
  };

  const handleBack = () => {
    navigate(-1);
  };
  if (!recipientId) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>Lütfen bir sohbet seçin</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Sohbet Başlığı */}
      <AppBar position="static" sx={{ bgcolor: '#5E35B1' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Tooltip title={getStatusText(recipientStatus)}>
                <CircleIcon
                  sx={{
                    color: getStatusColor(recipientStatus),
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    width: 12,
                    height: 12
                  }}
                />
              </Tooltip>
            }
          >
            <Avatar 
              src={recipientAvatar}
              sx={{ width: 40, height: 40, mr: 2 }}
            >
              {recipientName?.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
          <Typography variant="h6" component="div">
            {recipientName}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mesajlar */}
      <Paper 
        elevation={0} 
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress sx={{ color: '#5E35B1' }} />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2, flexGrow: 1 }}>
            {messages.map((message, index) => (
              <Box
                key={message._id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === currentUser.id ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    backgroundColor: message.sender === currentUser.id ? '#5E35B1' : '#fff',
                    color: message.sender === currentUser.id ? '#fff' : '#000',
                    borderRadius: 2,
                    p: 2,
                    position: 'relative',
                    boxShadow: 1
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      textAlign: 'right',
                      mt: 1,
                      opacity: 0.7
                    }}
                  >
                    {formatMessageTime(message.createdAt)}
                  </Typography>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Paper>

      {/* Mesaj Gönderme Formu */}
      <Paper 
        component="form" 
        onSubmit={handleSendMessage}
        sx={{ 
          p: 2,
          backgroundColor: '#fff',
          borderTop: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Mesajınızı yazın..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#5E35B1',
                },
              },
            }}
          />
          <IconButton 
            type="submit" 
            disabled={!newMessage.trim()}
            sx={{
              bgcolor: '#5E35B1',
              color: 'white',
              '&:hover': {
                bgcolor: '#4527A0',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(94, 53, 177, 0.5)',
                color: 'white',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat;