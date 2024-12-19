import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Avatar, 
  Button, 
  TextField, 
  Tabs, 
  Tab,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Stack,
  Tooltip,
  Badge,
  Grid,
  useTheme
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutline as CommentIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  PersonAdd as PersonAddIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Link as LinkIcon,
  SportsEsports as GamesIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import FriendCard from '../components/FriendCard';
import axios from '../utils/axios';

const Profile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [editForm, setEditForm] = useState({
    bio: '',
    birthDate: '',
    location: '',
    interests: [],
    socialLinks: {
      discord: '',
      steam: '',
      twitter: ''
    }
  });
  const [newInterest, setNewInterest] = useState('');
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFriends: 0
  });

  const user = JSON.parse(localStorage.getItem('user'));
  useEffect(() => {
    fetchProfile();
    fetchFriendRequests();
  }, []);

  useEffect(() => {
    if (profile) {
      updateStats();
    }
  }, [profile]);

  const updateStats = () => {
    const totalLikes = profile.posts?.reduce((total, post) => total + (post.likes?.length || 0), 0);
    const totalComments = profile.posts?.reduce((total, post) => total + (post.comments?.length || 0), 0);
    
    setStats({
      totalPosts: profile.posts?.length || 0,
      totalLikes,
      totalComments,
      totalFriends: profile.friends?.length || 0
    });
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/users/profile/${user.id}`);
      setProfile(res.data);
      setUserPosts(res.data.posts || []);
      setEditForm({
        bio: res.data.bio || '',
        birthDate: res.data.birthDate ? new Date(res.data.birthDate).toISOString().split('T')[0] : '',
        location: res.data.location || '',
        interests: res.data.interests || [],
        socialLinks: res.data.socialLinks || {
          discord: '',
          steam: '',
          twitter: ''
        }
      });
    } catch (err) {
      console.error('Profil yüklenemedi:', err);
      handleSnackbar('Profil yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const res = await axios.get('/users/friend-requests');
      setFriendRequests(res.data);
    } catch (err) {
      console.error('Arkadaşlık istekleri yüklenemedi:', err);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    if (file.size > 5 * 1024 * 1024) {
      handleSnackbar('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
      return;
    }
  
    if (!file.type.startsWith('image/')) {
      handleSnackbar('Sadece resim dosyaları yüklenebilir', 'error');
      return;
    }
  
    const formData = new FormData();
    formData.append('avatar', file);
  
    try {
      setAvatarLoading(true);
      const res = await axios.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      // State'leri güncelle
      const updatedUser = { ...user, avatar: res.data.avatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
  
      setProfile(prev => ({
        ...prev,
        avatar: res.data.avatar
      }));
  
      handleSnackbar('Profil fotoğrafı güncellendi', 'success');
    } catch (err) {
      console.error('Avatar yükleme hatası:', err);
      handleSnackbar(err.response?.data?.message || 'Profil fotoğrafı yüklenirken bir hata oluştu', 'error');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put('/users/update-profile', editForm);
      
      setProfile(prev => ({
        ...prev,
        ...response.data
      }));
      
      setEditing(false);
      handleSnackbar('Profil başarıyla güncellendi', 'success');
    } catch (err) {
      console.error('Profil güncellenemedi:', err);
      handleSnackbar('Profil güncellenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await axios.put(`/posts/${postId}/like`);
      setUserPosts(posts => 
        posts.map(post => post._id === postId ? res.data : post)
      );
    } catch (err) {
      console.error('Beğeni hatası:', err);
      handleSnackbar('Beğeni işlemi başarısız oldu', 'error');
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
      
      setUserPosts(posts =>
        posts.map(post => post._id === postId ? res.data : post)
      );
      
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      handleSnackbar('Yorum başarıyla eklendi', 'success');
    } catch (err) {
      console.error('Yorum hatası:', err);
      handleSnackbar('Yorum eklenirken bir hata oluştu', 'error');
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await axios.delete(`/posts/${postId}/comments/${commentId}`);
      setUserPosts(posts =>
        posts.map(post => post._id === postId ? res.data : post)
      );
      handleSnackbar('Yorum başarıyla silindi', 'success');
    } catch (err) {
      console.error('Yorum silme hatası:', err);
      handleSnackbar('Yorum silinirken bir hata oluştu', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/posts/${postId}`);
      setUserPosts(posts => posts.filter(post => post._id !== postId));
      handleSnackbar('Gönderi başarıyla silindi', 'success');
    } catch (err) {
      console.error('Post silinemedi:', err);
      handleSnackbar('Gönderi silinirken bir hata oluştu', 'error');
    }
  };

  const handleSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };

  const canDeleteComment = (post, comment) => {
    return comment.user._id === user?.id || post.user._id === user?.id;
  };
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading && !profile ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      ) : (
        <>
          {/* Profil Başlık Kartı */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: 3,
              backgroundColor: '#ffffff',
              mb: 3,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Üst Kısım Gradient Arka Plan */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '120px',
                background: `linear-gradient(to right bottom, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                opacity: 0.1
              }}
            />
  
            {/* Profil Bilgileri */}
            <Box sx={{ position: 'relative', textAlign: 'center' }}>
              {/* Avatar ve Düzenleme Butonu */}
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                    <IconButton
                    component="label"
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        '&:hover': { backgroundColor: theme.palette.primary.dark },
                        width: 32,
                        height: 32,
                        border: '2px solid white',
                    }}
                    disabled={avatarLoading}
                    >
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                    {avatarLoading ? (
                        <CircularProgress size={16} sx={{ color: 'white' }} />
                    ) : (
                        <PhotoCameraIcon sx={{ color: 'white', fontSize: 16 }} />
                    )}
                    </IconButton>
                }
                >
                <Avatar
                      src={profile?.avatar ? `${process.env.REACT_APP_API_URL}${profile.avatar}` : ''}
                      sx={{
                      width: 120,
                      height: 120,
                      border: '4px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      bgcolor: theme.palette.primary.main,
                      fontSize: '2.5rem'
                      }}
                  >
                      {!profile?.avatar && profile?.username?.[0]?.toUpperCase()}
                      {avatarLoading && (
                      <CircularProgress
                          size={60}
                          sx={{
                          position: 'absolute',
                          color: 'white'
                          }}
                      />
                      )}
                </Avatar>
               </Badge>
               </Box>
                            {/* Kullanıcı Bilgileri */}
                            <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                {profile?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {profile?.email}
              </Typography>
  
              {/* İstatistikler */}
              <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {stats.totalPosts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gönderi
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {stats.totalFriends}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Arkadaş
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {stats.totalLikes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Beğeni
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {stats.totalComments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Yorum
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
  
              {/* Düzenleme Butonu */}
              {!editing ? (
                <Button
                  variant="contained"
                  onClick={() => setEditing(true)}
                  startIcon={<EditIcon />}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    '&:hover': { bgcolor: theme.palette.primary.dark },
                    px: 4,
                    py: 1,
                    borderRadius: 2
                  }}
                >
                  Profili Düzenle
                </Button>
              ) : (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={handleEditSubmit}
                    disabled={loading}
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      '&:hover': { bgcolor: theme.palette.primary.dark }
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Kaydet'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setEditing(false)}
                    disabled={loading}
                    sx={{
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        bgcolor: 'rgba(94, 53, 177, 0.04)'
                      }
                    }}
                  >
                    İptal
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
                    {/* Ana İçerik */}
                    <Grid container spacing={3}>
            {/* Sol Kolon */}
            <Grid item xs={12} md={4}>
              {/* Hakkında Kartı */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: '#ffffff',
                  mb: 3
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Hakkında
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Biyografi
                    </Typography>
                    <Typography variant="body2">
                      {profile?.bio || 'Henüz bir biyografi eklenmemiş.'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Konum
                    </Typography>
                    <Typography variant="body2">
                      {profile?.location || 'Belirtilmemiş'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Katılma Tarihi
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(profile?.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
  
              {/* İlgi Alanları Kartı */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: '#ffffff',
                  mb: 3
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  İlgi Alanları
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile?.interests?.length > 0 ? (
                    profile.interests.map((interest, index) => (
                      <Chip
                        key={index}
                        label={interest}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          '&:hover': { bgcolor: theme.palette.primary.dark }
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Henüz ilgi alanı eklenmemiş.
                    </Typography>
                  )}
                </Box>
              </Paper>
  
              {/* Sosyal Medya Kartı */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: '#ffffff'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Sosyal Medya
                </Typography>
                <Stack spacing={2}>
                  {Object.entries(profile?.socialLinks || {}).map(([platform, link]) => (
                    link && (
                      <Box key={platform} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinkIcon color="action" fontSize="small" />
                        <Typography variant="body2">
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}: {link}
                        </Typography>
                      </Box>
                    )
                  ))}
                  {!Object.values(profile?.socialLinks || {}).some(link => link) && (
                    <Typography variant="body2" color="text.secondary">
                      Henüz sosyal medya hesabı eklenmemiş.
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
                        {/* Sağ Kolon */}
                        <Grid item xs={12} md={8}>
              {/* Sekmeler */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  backgroundColor: '#ffffff',
                  overflow: 'hidden'
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                      minWidth: 120,
                      fontWeight: 600
                    }
                  }}
                >
                  <Tab label="Gönderiler" />
                  <Tab label="Arkadaşlar" />
                  <Tab label="Fotoğraflar" />
                </Tabs>
  
                <Box sx={{ p: 3 }}>
                  {/* Gönderi Sekmesi */}
                  {tabValue === 0 && (
                    <Stack spacing={3}>
                      {userPosts.map((post) => (
                        <PostCard
                          key={post._id}
                          post={post}
                          onLike={handleLikePost}
                          onComment={handleCommentSubmit}
                          onDeleteComment={handleDeleteComment}
                          onDeletePost={handleDeletePost}
                          commentInputs={commentInputs}
                          setCommentInputs={setCommentInputs}
                          commentLoading={commentLoading}
                          currentUser={user}
                          formatDateTime={formatDateTime}
                        />
                      ))}
                      {userPosts.length === 0 && (
                        <Typography color="text.secondary" textAlign="center">
                          Henüz gönderi yok.
                        </Typography>
                      )}
                    </Stack>
                  )}
  
                  {/* Arkadaşlar Sekmesi */}
                  {tabValue === 1 && (
                    <Grid container spacing={2}>
                      {profile?.friends?.map((friend) => (
                        <Grid item xs={12} sm={6} key={friend._id}>
                          <FriendCard friend={friend} />
                        </Grid>
                      ))}
                      {(!profile?.friends || profile.friends.length === 0) && (
                        <Grid item xs={12}>
                          <Typography color="text.secondary" textAlign="center">
                            Henüz arkadaş yok.
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  )}
  
                  {/* Fotoğraflar Sekmesi */}
                  {tabValue === 2 && (
                    <Typography color="text.secondary" textAlign="center">
                      Henüz fotoğraf eklenmemiş.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
  
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;