import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider 
} from '@mui/material';
import { io } from 'socket.io-client';
import axios from '../utils/axios';

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      newSocket.emit('login', user.id);
    }

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        if (currentChat?._id === message.senderId) {
          setMessages(prev => [...prev, message]);
        }
      });
    }
  }, [socket, currentChat]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get('/messages/conversations');
        setConversations(res.data);
      } catch (err) {
        console.error('Konuşmalar yüklenemedi:', err);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (currentChat) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`/messages/${currentChat._id}`);
          setMessages(res.data);
        } catch (err) {
          console.error('Mesajlar yüklenemedi:', err);
        }
      };
      fetchMessages();
    }
  }, [currentChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      recipient: currentChat._id,
      content: newMessage
    };

    try {
      const res = await axios.post('/messages', messageData);
      setMessages([...messages, res.data]);
      setNewMessage('');
      socket.emit('sendMessage', messageData);
    } catch (err) {
      console.error('Mesaj gönderilemedi:', err);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '80vh', gap: 2 }}>
      <Paper sx={{ width: 300, overflow: 'auto' }}>
        <List>
          {conversations.map((conv) => (
            <ListItem 
              button 
              key={conv._id}
              selected={currentChat?._id === conv._id}
              onClick={() => setCurrentChat(conv)}
            >
              <ListItemAvatar>
                <Avatar src={conv.avatar} />
              </ListItemAvatar>
              <ListItemText 
                primary={conv.username}
                secondary={conv.lastMessage?.content}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentChat ? (
          <>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">{currentChat.username}</Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === currentChat._id ? 'flex-start' : 'flex-end',
                    mb: 1
                  }}
                >
                  <Paper
                    sx={{
                      p: 1,
                      backgroundColor: message.sender === currentChat._id ? 'grey.100' : 'primary.light',
                      color: message.sender === currentChat._id ? 'text.primary' : 'white',
                      maxWidth: '70%'
                    }}
                  >
                    <Typography variant="body1">{message.content}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            <Box
              component="form"
              onSubmit={handleSendMessage}
              sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}
            >
              <TextField
                fullWidth
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesajınızı yazın..."
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
              />
              <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                Gönder
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="h6" color="text.secondary">
              Sohbet başlatmak için bir kullanıcı seçin
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Chat;