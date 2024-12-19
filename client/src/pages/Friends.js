// src/pages/Friends.js
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Paper,
  InputBase,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  SportsEsports as GamesIcon,
  Public as PublicIcon,
  FiberManualRecord as OnlineIcon
} from '@mui/icons-material';
import axios from '../utils/axios';

const Friends = () => {
  const [tabValue, setTabValue] = useState(0);
  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchData();
  }, [tabValue]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        friendsRes,
        onlineFriendsRes,
        requestsRes,
        suggestionsRes
      ] = await Promise.all([
        axios.get('/users/friends'),
        axios.get('/users/friends/online'),
        axios.get('/users/friend-requests'),
        axios.get('/users/friend-suggestions')
      ]);

      setFriends(friendsRes.data);
      setOnlineFriends(onlineFriendsRes.data);
      setFriendRequests(requestsRes.data);
      setSuggestions(suggestionsRes.data);
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
      handleSnackbar('Veriler yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await axios.delete(`/users/friends/${friendId}`);
      setFriends(friends.filter(friend => friend._id !== friendId));
      handleSnackbar('Arkadaşlıktan çıkarıldı');
      setConfirmDialog(false);
    } catch (err) {
      console.error('Arkadaşlıktan çıkarma hatası:', err);
      handleSnackbar('İşlem başarısız oldu', 'error');
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await axios.post(`/users/accept-friend/${userId}`);
      setFriendRequests(requests => 
        requests.filter(request => request._id !== userId)
      );
      fetchData(); // Arkadaş listesini güncelle
      handleSnackbar('Arkadaşlık isteği kabul edildi');
    } catch (err) {
      console.error('İstek kabul hatası:', err);
      handleSnackbar('İşlem başarısız oldu', 'error');
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await axios.post(`/users/reject-friend/${userId}`);
      setFriendRequests(requests => 
        requests.filter(request => request._id !== userId)
      );
      handleSnackbar('Arkadaşlık isteği reddedildi');
    } catch (err) {
      console.error('İstek reddetme hatası:', err);
      handleSnackbar('İşlem başarısız oldu', 'error');
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await axios.post(`/users/friend-request/${userId}`);
      setSuggestions(suggestions => 
        suggestions.filter(suggestion => suggestion._id !== userId)
      );
      handleSnackbar('Arkadaşlık isteği gönderildi');
    } catch (err) {
      console.error('İstek gönderme hatası:', err);
      handleSnackbar('İşlem başarısız oldu', 'error');
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFriendCard = (friend) => (
    <Card 
      key={friend._id}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <RouterLink 
            to={`/profile/${friend._id}`}
            style={{ textDecoration: 'none' }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                friend.status === 'online' && (
                  <OnlineIcon sx={{ color: '#44b700', width: 12, height: 12 }} />
                )
              }
            >
              <Avatar
                src={friend.avatar}
                sx={{ 
                  width: 60, 
                  height: 60,
                  bgcolor: '#5E35B1',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
              >
                {friend.username.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
          </RouterLink>
          <Box sx={{ ml: 2 }}>
            <RouterLink 
              to={`/profile/${friend._id}`}
              style={{ textDecoration: 'none' }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#2D3436',
                  '&:hover': {
                    color: '#5E35B1'
                  }
                }}
              >
                {friend.username}
              </Typography>
            </RouterLink>
            <Typography variant="body2" color="text.secondary">
              {friend.status === 'online' ? 'Çevrimiçi' : 'Son görülme: ' + 
                new Date(friend.lastActive).toLocaleDateString('tr-TR')}
            </Typography>
          </Box>
        </Box>

        {friend.bio && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {friend.bio}
          </Typography>
        )}

        {friend.games?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              <GamesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Oyunlar
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {friend.games.map((game, index) => (
                <Chip
                  key={index}
                  label={game.name}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: game.favorite ? '#5E35B1' : undefined,
                    color: game.favorite ? '#5E35B1' : undefined
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
          <Button
            component={RouterLink}
            to={`/profile/${friend._id}`}
            variant="outlined"
            size="small"
            sx={{ 
              borderColor: '#5E35B1',
              color: '#5E35B1',
              '&:hover': {
                borderColor: '#4527A0',
                backgroundColor: 'rgba(94, 53, 177, 0.04)'
              }
            }}
          >
            Profili Görüntüle
          </Button>
          <IconButton
            onClick={() => {
              setSelectedFriend(friend);
              setConfirmDialog(true);
            }}
            sx={{
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.04)'
              }
            }}
          >
            <PersonRemoveIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const renderRequestCard = (request) => (
    <Card 
      key={request._id}
      sx={{ 
        mb: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={request.avatar}
            sx={{ width: 50, height: 50, bgcolor: '#5E35B1' }}
          >
            {request.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ ml: 2, flexGrow: 1 }}>
            <Typography variant="subtitle1">
              {request.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Arkadaşlık isteği gönderdi
            </Typography>
          </Box>
          <Box>
            <IconButton
              onClick={() => handleAcceptRequest(request._id)}
              sx={{ color: 'success.main' }}
            >
              <CheckIcon />
            </IconButton>
            <IconButton
              onClick={() => handleRejectRequest(request._id)}
              sx={{ color: 'error.main' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSuggestionCard = (suggestion) => (
    <Card 
      key={suggestion._id}
      sx={{ 
        mb: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={suggestion.avatar}
            sx={{ width: 50, height: 50, bgcolor: '#5E35B1' }}
          >
            {suggestion.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ ml: 2, flexGrow: 1 }}>
            <Typography variant="subtitle1">
              {suggestion.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {suggestion.mutualFriendsCount} ortak arkadaş
            </Typography>
          </Box>
          <Button
            startIcon={<PersonAddIcon />}
            variant="outlined"
            onClick={() => handleSendRequest(suggestion._id)}
            sx={{ 
              borderColor: '#5E35B1',
              color: '#5E35B1',
              '&:hover': {
                borderColor: '#4527A0',
                backgroundColor: 'rgba(94, 53, 177, 0.04)'
              }
            }}
          >
            Arkadaş Ekle
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: '#ffffff'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 3
              },
              '& .Mui-selected': {
                color: '#5E35B1'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#5E35B1'
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>Arkadaşlar</Typography>
                  <Chip 
                    label={friends.length} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>İstekler</Typography>
                  {friendRequests.length > 0 && (
                    <Chip 
                      label={friendRequests.length} 
                      color="primary"
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
            />
            <Tab label="Öneriler" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <>
            <Box sx={{ py: 2 }}>
              <Paper
                sx={{
                  p: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  width: 400,
                  backgroundColor: '#F8F9FA'
                }}
              >
                <IconButton sx={{ p: '10px' }}>
                  <SearchIcon />
                </IconButton>
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Arkadaşlarında ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Paper>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredFriends.map(friend => (
                  <Grid item xs={12} sm={6} md={4} key={friend._id}>
                    {renderFriendCard(friend)}
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {tabValue === 1 && (
          <Box sx={{ py: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : friendRequests.length === 0 ? (
              <Typography textAlign="center" color="text.secondary">
                Bekleyen arkadaşlık isteği yok
              </Typography>
            ) : (
              friendRequests.map(request => renderRequestCard(request))
            )}
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ py: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : suggestions.length === 0 ? (
              <Typography textAlign="center" color="text.secondary">
                Şu anda önerilebilecek kullanıcı yok
              </Typography>
            ) : (
              suggestions.map(suggestion => renderSuggestionCard(suggestion))
            )}
          </Box>
        )}
      </Paper>

      {/* Arkadaşlıktan çıkarma dialog'u */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
      >
        <DialogTitle>
          Arkadaşlıktan Çıkar
        </DialogTitle>
        <DialogContent>
          <Typography>
            {selectedFriend?.username} adlı kullanıcıyı arkadaşlıktan çıkarmak istediğinize emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog(false)}
            sx={{ color: 'text.secondary' }}
          >
            İptal
          </Button>
          <Button 
            onClick={() => handleRemoveFriend(selectedFriend?._id)}
            color="error"
            variant="contained"
          >
            Çıkar
          </Button>
        </DialogActions>
      </Dialog>

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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Friends;