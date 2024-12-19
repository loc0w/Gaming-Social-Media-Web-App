import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Avatar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Typography,
  Divider,
  Stack,
  Menu,
  MenuItem,
  Select,
  FormControl,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutline as CommentIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Sort as SortIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/posts?sort=${sortBy}`);
      setPosts(res.data);
    } catch (err) {
      console.error('Post yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      setLoading(true);
      const res = await axios.post('/posts', { content: newPost });
      setPosts([res.data, ...posts]);
      setNewPost('');
    } catch (err) {
      console.error('Post paylaşma hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.put(`/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post._id === postId ? res.data : post
      ));
    } catch (err) {
      console.error('Beğeni hatası:', err);
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
      
      setPosts(posts.map(post => 
        post._id === postId ? res.data : post
      ));
      
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Yorum hatası:', err);
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await axios.delete(`/posts/${postId}/comments/${commentId}`);
      setPosts(posts.map(post => 
        post._id === postId ? res.data : post
      ));
    } catch (err) {
      console.error('Yorum silme hatası:', err);
    }
  };

  const handleMenuClick = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    try {
      await axios.delete(`/posts/${selectedPost._id}`);
      setPosts(posts.filter(post => post._id !== selectedPost._id));
      handleMenuClose();
    } catch (err) {
      console.error('Post silme hatası:', err);
    }
  };

  const canDeleteComment = (post, comment) => {
    return comment.user._id === user?.id || post.user._id === user?.id;
  };

  const handleProfileClick = (clickedUserId) => {
    return clickedUserId === user?.id ? '/profile' : `/profile/${clickedUserId}`;
  };

  return (
    <Stack spacing={3}>
      {/* Filtreleme */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          Gönderiler
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            displayEmpty
            variant="outlined"
            startAdornment={<SortIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="newest">En Yeni</MenuItem>
            <MenuItem value="oldest">En Eski</MenuItem>
            <MenuItem value="popular">En Popüler</MenuItem>
            <MenuItem value="trending">Trendler</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Post Paylaşma */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '16px',
          backgroundColor: '#ffffff',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <RouterLink to="/profile" style={{ textDecoration: 'none' }}>
            <Avatar
              src={user?.avatar}
              sx={{ 
                width: 48, 
                height: 48, 
                bgcolor: '#5E35B1',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                }
              }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </RouterLink>
          <Box sx={{ flexGrow: 1 }}>
            <form onSubmit={handlePostSubmit}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Ne düşünüyorsun?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#F8F9FA',
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!newPost.trim() || loading}
                sx={{
                  borderRadius: '20px',
                  float: 'right',
                  backgroundColor: '#5E35B1',
                  '&:hover': {
                    backgroundColor: '#4527A0',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Paylaş'
                )}
              </Button>
            </form>
          </Box>
        </Box>
      </Paper>

      {/* Postlar */}
      {loading && posts.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          Henüz gönderi yok
        </Typography>
      ) : (
        posts.map((post) => (
          <Card
            key={post._id}
            sx={{
              borderRadius: '16px',
              backgroundColor: '#ffffff',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RouterLink 
                  to={handleProfileClick(post.user?._id)} 
                  style={{ textDecoration: 'none' }}
                >
                  <Avatar
                    src={post.user?.avatar}
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      mr: 2, 
                      bgcolor: '#5E35B1',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                  >
                    {post.user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </RouterLink>
                <Box sx={{ flexGrow: 1 }}>
                  <RouterLink 
                    to={handleProfileClick(post.user?._id)}
                    style={{ textDecoration: 'none' }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#2D3436',
                        cursor: 'pointer',
                        '&:hover': {
                          color: '#5E35B1'
                        }
                      }}
                    >
                      {post.user?.username}
                    </Typography>
                  </RouterLink>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(post.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
                {post.user?._id === user?.id && (
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuClick(e, post)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {post.content}
              </Typography>
            </CardContent>
            
            <Divider />
            
            {/* Post Actions */}
            <CardActions sx={{ px: 2 }}>
              <Button
                startIcon={post.likes?.includes(user?.id) ? 
                  <FavoriteIcon color="error" /> : 
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
            </CardActions>

            <Divider />

            {/* Yorum Bölümü */}
            <Box sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              {/* Yorum Yapma Formu */}
              <Box component="form" onSubmit={(e) => handleCommentSubmit(post._id, e)} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <RouterLink to="/profile" style={{ textDecoration: 'none' }}>
                    <Avatar
                      src={user?.avatar}
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: '#5E35B1',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                    >
                      {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  </RouterLink>
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        backgroundColor: '#fff',
                      }
                    }}
                  />
                  <IconButton 
                    type="submit"
                    disabled={!commentInputs[post._id]?.trim() || commentLoading[post._id]}
                    sx={{
                      color: '#5E35B1',
                      '&:hover': {
                        backgroundColor: 'rgba(94, 53, 177, 0.04)',
                      }
                    }}
                  >
                    {commentLoading[post._id] ? (
                      <CircularProgress size={24} />
                    ) : (
                      <SendIcon />
                    )}
                  </IconButton>
                </Box>
              </Box>

              {/* Yorumlar Listesi */}
              {post.comments && post.comments.length > 0 ? (
                <List disablePadding>
                  {post.comments.map((comment) => (
                    <ListItem
                      key={comment._id}
                      alignItems="flex-start"
                      sx={{ px: 0, py: 1 }}
                    >
                      <ListItemAvatar>
                        <RouterLink 
                          to={handleProfileClick(comment.user?._id)}
                          style={{ textDecoration: 'none' }}
                        >
                          <Avatar
                            src={comment.user?.avatar}
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: '#5E35B1',
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.8
                              }
                            }}
                          >
                            {comment.user?.username?.charAt(0).toUpperCase()}
                          </Avatar>
                        </RouterLink>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <RouterLink 
                              to={handleProfileClick(comment.user?._id)}
                              style={{ textDecoration: 'none' }}
                            >
                              <Typography 
                                variant="subtitle2"
                                sx={{ 
                                  cursor: 'pointer',
                                  color: '#2D3436',
                                  '&:hover': {
                                    color: '#5E35B1'
                                  }
                                }}
                              >
                                {comment.user?.username}
                              </Typography>
                            </RouterLink>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(comment.createdAt).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                        }
                        secondary={comment.content}
                      />
                      {canDeleteComment(post, comment) && (
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDeleteComment(post._id, comment._id)}
                            sx={{
                              '&:hover': {
                                color: 'error.main',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Henüz yorum yok
                </Typography>
              )}
            </Box>
          </Card>
        ))
      )}

      {/* Post Menüsü */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleDeletePost}>
          <Typography color="error">Sil</Typography>
        </MenuItem>
      </Menu>
    </Stack>
  );
};

export default PostList;