// src/pages/Favorites.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Stack,
  TextField,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutline as CommentIcon,
  Share as ShareIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import axios from '../utils/axios';

const Favorites = () => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchLikedPosts();
  }, []);

  const fetchLikedPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/posts');
      const userLikedPosts = response.data.filter(post => 
        post.likes.includes(user.id)
      );
      setLikedPosts(userLikedPosts);
    } catch (error) {
      console.error('Beğenilen gönderiler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.put(`/posts/${postId}/like`);
      if (!res.data.likes.includes(user.id)) {
        setLikedPosts(prevPosts => 
          prevPosts.filter(post => post._id !== postId)
        );
      } else {
        setLikedPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId ? res.data : post
          )
        );
      }
    } catch (error) {
      console.error('Beğeni işlemi sırasında hata:', error);
    }
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    if (!commentInputs[postId]?.trim()) return;

    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await axios.post(`/posts/${postId}/comments`, {
        content: commentInputs[postId]
      });
      
      setLikedPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? res.data : post
        )
      );
      
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Yorum eklenirken hata:', error);
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await axios.delete(`/posts/${postId}/comments/${commentId}`);
      setLikedPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? res.data : post
        )
      );
    } catch (error) {
      console.error('Yorum silinirken hata:', error);
    }
  };

  const canDeleteComment = (post, comment) => {
    return comment.user._id === user?.id || post.user._id === user?.id;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, mt: 8 }}>

      {likedPosts.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8, 
          backgroundColor: '#f8f9fa',
          borderRadius: 2
        }}>
          <FavoriteIcon sx={{ fontSize: 48, color: '#dee2e6', mb: 2 }} />
          <Typography color="text.secondary">
            Henüz hiç gönderi beğenmediniz
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {likedPosts.map((post) => (
            <Card
              key={post._id}
              sx={{
                borderRadius: '16px',
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RouterLink 
                    to={`/profile/${post.user._id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Avatar
                      src={post.user?.avatar}
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        mr: 2,
                        bgcolor: '#5E35B1',
                      }}
                    >
                      {post.user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </RouterLink>
                  <Box sx={{ flexGrow: 1 }}>
                    <RouterLink 
                      to={`/profile/${post.user._id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Typography 
                        variant="subtitle1"
                        sx={{ 
                          fontWeight: 600,
                          color: '#2D3436',
                          '&:hover': { color: '#5E35B1' }
                        }}
                      >
                        {post.user?.username}
                      </Typography>
                    </RouterLink>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(post.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {post.content}
                </Typography>

                {post.image && (
                  <Box 
                    sx={{ 
                      mb: 2,
                      backgroundColor: '#f8f9fa',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      paddingTop: '56.25%'
                    }}
                  >
                    <img
                      src={`http://localhost:5000${post.image}`}
                      alt="Post resmi"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    startIcon={post.likes?.includes(user?.id) ? 
                      <FavoriteIcon sx={{ color: '#e74c3c' }} /> : 
                      <FavoriteBorderIcon />
                    }
                    onClick={() => handleLike(post._id)}
                    sx={{ color: 'text.secondary' }}
                  >
                    {post.likes?.length || 0} Beğeni
                  </Button>
                  <Button
                    startIcon={<CommentIcon />}
                    sx={{ color: 'text.secondary' }}
                  >
                    {post.comments?.length || 0} Yorum
                  </Button>
                  <Button
                    startIcon={<ShareIcon />}
                    sx={{ color: 'text.secondary' }}
                  >
                    Paylaş
                  </Button>
                </Box>

                {/* Yorum Formu */}
                <Box component="form" onSubmit={(e) => handleCommentSubmit(post._id, e)} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Avatar
                      src={user?.avatar}
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: '#5E35B1',
                      }}
                    >
                      {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Bir yorum yazın..."
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({
                        ...prev,
                        [post._id]: e.target.value
                      }))}
                      disabled={commentLoading[post._id]}
                    />
                    <IconButton
                      type="submit"
                      disabled={!commentInputs[post._id]?.trim() || commentLoading[post._id]}
                      sx={{ color: '#5E35B1' }}
                    >
                      {commentLoading[post._id] ? (
                        <CircularProgress size={24} />
                      ) : (
                        <SendIcon />
                      )}
                    </IconButton>
                  </Box>
                </Box>

                {/* Yorumlar */}
                {post.comments?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={2}>
                      {post.comments.map((comment) => (
                        <Box
                          key={comment._id}
                          sx={{
                            display: 'flex',
                            gap: 2,
                            backgroundColor: '#f8f9fa',
                            p: 2,
                            borderRadius: '8px'
                          }}
                        >
                          <RouterLink 
                            to={`/profile/${comment.user._id}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <Avatar
                              src={comment.user?.avatar}
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: '#5E35B1'
                              }}
                            >
                              {comment.user?.username?.charAt(0).toUpperCase()}
                            </Avatar>
                          </RouterLink>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <RouterLink 
                                  to={`/profile/${comment.user._id}`}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                      color: '#2D3436',
                                      '&:hover': { color: '#5E35B1' }
                                    }}
                                  >
                                    {comment.user?.username}
                                  </Typography>
                                </RouterLink>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDateTime(comment.createdAt)}
                                </Typography>
                              </Box>
                              {canDeleteComment(post, comment) && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteComment(post._id, comment._id)}
                                  sx={{ color: '#e74c3c' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ color: '#2D3436' }}>
                              {comment.content}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default Favorites;