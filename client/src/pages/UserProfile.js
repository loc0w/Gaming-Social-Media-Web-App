// src/pages/UserProfile.js - Bölüm 1
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Divider,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Chip,
  Button,
  TextField,
  Alert,
  Snackbar,
  Tooltip,
  Badge,
  Grid,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutline as CommentIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Mail as MailIcon,
  Circle as CircleIcon,
  SportsEsports as GamesIcon,
  Public as LocationIcon,
  CalendarToday as CalendarIcon,
  Link as LinkIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from '../utils/axios';

const UserProfile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: '',
    title: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [friendshipStatus, setFriendshipStatus] = useState('none');
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchUserProfile();
  }, [userId]); // userId değiştiğinde profili yeniden yükle
  
  useEffect(() => {
    if (userProfile) {
      setFriendshipStatus(userProfile.friendshipStatus || 'none');
    }
  }, [userProfile]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/users/profile/${userId}`);
      setUserProfile(res.data);
    } catch (err) {
      setError('Kullanıcı profili yüklenirken bir hata oluştu');
      console.error('Profil yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    navigate('/messages', { 
      state: { 
        recipientId: userId,
        recipientName: userProfile?.username,
        recipientAvatar: userProfile?.avatar
      } 
    });
  };

  const handleFriendshipAction = async (action) => {
    try {
      setLoading(true);
  
      switch (action) {
        case 'add':
          await axios.post(`/users/friend-request/${userId}`);
          setFriendshipStatus('pending_sent');
          handleSnackbar('Arkadaşlık isteği gönderildi');
          break;
        case 'accept':
          await axios.post(`/users/accept-friend/${userId}`);
          setFriendshipStatus('friends');
          handleSnackbar('Arkadaşlık isteği kabul edildi');
          break;
        case 'reject':
          await axios.post(`/users/reject-friend/${userId}`);
          setFriendshipStatus('none');
          handleSnackbar('Arkadaşlık isteği reddedildi');
          break;
        case 'remove':
          await axios.delete(`/users/friends/${userId}`);
          setFriendshipStatus('none');
          handleSnackbar('Arkadaşlıktan çıkarıldı');
          break;
        case 'cancel':
          await axios.delete(`/users/friend-request/${userId}`);
          setFriendshipStatus('none');
          handleSnackbar('Arkadaşlık isteği iptal edildi');
          break;
      }
  
      await fetchUserProfile();
    } catch (err) {
      console.error('İşlem hatası:', err);
      handleSnackbar(err.response?.data?.message || 'Bir hata oluştu', 'error');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false });
    }
  };

  const handleConfirmDialog = (type) => {
    const dialogConfig = {
      add: {
        title: 'Arkadaş Ekle',
        message: `${userProfile?.username} kullanıcısına arkadaşlık isteği göndermek istediğinize emin misiniz?`
      },
      remove: {
        title: 'Arkadaşlıktan Çıkar',
        message: `${userProfile?.username} kullanıcısını arkadaşlıktan çıkarmak istediğinize emin misiniz?`
      },
      cancel: {
        title: 'İsteği İptal Et',
        message: 'Arkadaşlık isteğini iptal etmek istediğinize emin misiniz?'
      }
    };

    setConfirmDialog({
      open: true,
      type,
      ...dialogConfig[type]
    });
  };

  const handleSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#44b700';
      case 'away':
        return '#ff9800';
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

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

    const renderFriendshipButton = () => {
    if (isOwnProfile) return null;

    switch (friendshipStatus) {
        case 'friends':
        return (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {/* ... mevcut butonlar ... */}
            </Box>
        );

        case 'pending_received':
        return (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {/* ... mevcut butonlar ... */}
            </Box>
        );

        case 'pending_sent':
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="İsteği İptal Et" placement="top">
                <Button
                variant="outlined"
                onClick={() => handleConfirmDialog('cancel')}
                startIcon={<PersonAddIcon />}
                sx={{
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                    '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    borderColor: theme.palette.error.main,
                    color: theme.palette.error.main
                    },
                    textTransform: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
                >
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    Beklemede
                    <CircleIcon 
                    sx={{ 
                        ml: 1,
                        width: 8,
                        height: 8,
                        color: theme.palette.warning.main
                    }} 
                    />
                </Box>
                </Button>
            </Tooltip>
            </Box>
        );

        default:
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
                variant="contained"
                onClick={() => handleConfirmDialog('add')}
                startIcon={<PersonAddIcon />}
                sx={{
                bgcolor: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.dark },
                textTransform: 'none'
                }}
            >
                Arkadaş Ekle
            </Button>
            </Box>
        );
    }
    };

return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Sol Kolon - Profil Bilgileri */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Profil Kartı */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Tooltip title={getStatusText(userProfile?.status)}>
                        <CircleIcon
                          sx={{
                            color: getStatusColor(userProfile?.status),
                            bgcolor: 'background.paper',
                            borderRadius: '50%',
                            width: 16,
                            height: 16,
                            border: '2px solid white'
                          }}
                        />
                      </Tooltip>
                    }
                  >
                    <Avatar
                      src={userProfile?.avatar}
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '3rem'
                      }}
                    >
                      {userProfile?.username?.[0]?.toUpperCase()}
                    </Avatar>
                  </Badge>
                  <Typography variant="h5" gutterBottom>
                    {userProfile?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {userProfile?.email}
                  </Typography>
                  {renderFriendshipButton()}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Temel Bilgiler */}
                <Stack spacing={2}>
                  {userProfile?.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon color="action" />
                      <Typography variant="body2">{userProfile.location}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="action" />
                    <Typography variant="body2">
                      Katılma: {formatDate(userProfile?.createdAt)}
                    </Typography>
                  </Box>
                  {userProfile?.birthDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon color="action" />
                      <Typography variant="body2">
                        Doğum Tarihi: {formatDate(userProfile.birthDate)}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {/* Sosyal Medya Linkleri */}
                {(userProfile?.socialLinks?.discord ||
                  userProfile?.socialLinks?.steam ||
                  userProfile?.socialLinks?.twitter) && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Sosyal Medya
                    </Typography>
                    <Stack spacing={1}>
                      {Object.entries(userProfile.socialLinks).map(([platform, link]) => (
                        link && (
                          <Box key={platform} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinkIcon color="action" fontSize="small" />
                            <Typography variant="body2">
                              {platform.charAt(0).toUpperCase() + platform.slice(1)}: {link}
                            </Typography>
                          </Box>
                        )
                      ))}
                    </Stack>
                  </>
                )}
              </Paper>

              {/* İstatistikler Kartı */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  İstatistikler
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary">
                        {userProfile?.friends?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Arkadaş
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary">
                        {userProfile?.posts?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Gönderi
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Oyunlar Kartı */}
              {userProfile?.games?.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Oyunlar
                  </Typography>
                  <Stack spacing={1}>
                    {userProfile.games.map((game, index) => (
                      <Chip
                        key={index}
                        icon={<GamesIcon />}
                        label={game.name}
                        variant={game.favorite ? "filled" : "outlined"}
                        color={game.favorite ? "primary" : "default"}
                        sx={{ justifyContent: 'flex-start' }}
                      />
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* Sağ Kolon - Sekmeler ve İçerik */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                bgcolor: 'background.paper',
                overflow: 'hidden'
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant={isMobile ? "fullWidth" : "standard"}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  px: 2
                }}
              >
                <Tab label="Hakkında" />
                <Tab label="Gönderiler" />
                <Tab label="Arkadaşlar" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {activeTab === 0 && (
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Biyografi
                      </Typography>
                      <Typography variant="body1">
                        {userProfile?.bio || 'Henüz bir biyografi eklenmemiş.'}
                      </Typography>
                    </Box>

                    {userProfile?.interests?.length > 0 && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          İlgi Alanları
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {userProfile.interests.map((interest, index) => (
                            <Chip
                              key={index}
                              label={interest}
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Stack>
                )}

                {activeTab === 1 && (
                  <Box>
                    {/* Gönderiler bileşeni buraya gelecek */}
                    <Typography color="text.secondary" textAlign="center">
                      Henüz gönderi yok
                    </Typography>
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box>
                    {userProfile?.friends?.length > 0 ? (
                      <Grid container spacing={2}>
                        {userProfile.friends.map((friend) => (
                          <Grid item xs={12} sm={6} key={friend._id}>
                            <Card variant="outlined">
                              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  src={friend.avatar}
                                  sx={{ width: 50, height: 50 }}
                                >
                                  {friend.username[0].toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1">
                                    {friend.username}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {getStatusText(friend.status)}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography color="text.secondary" textAlign="center">
                        Henüz arkadaş yok
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Onay Dialog'u */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="inherit"
          >
            İptal
          </Button>
          <Button
            onClick={() => handleFriendshipAction(confirmDialog.type)}
            color={confirmDialog.type === 'remove' ? 'error' : 'primary'}
            variant="contained"
            autoFocus
          >
            Onayla
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;