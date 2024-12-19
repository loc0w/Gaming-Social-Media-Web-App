import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  InputBase,
  Divider,
  ListItemIcon,
  Tooltip,
  Paper,
  Fade,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  SportsEsports as GameIcon,
  Dashboard as DashboardIcon,
  Favorite as FavoriteIcon,
  Group as GroupIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: 'none',
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
}));

const StyledToolbar = styled(Toolbar)({
  minHeight: '70px',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 24px',
});

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  cursor: 'pointer',
  '&:hover': {
    '& .logo-icon': {
      transform: 'scale(1.1)',
    },
    '& .logo-text': {
      color: theme.palette.primary.main,
    },
  },
}));

const SearchBox = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '400px',
  height: '45px',
  borderRadius: '12px',
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.06),
  },
  padding: '0 16px',
  transition: 'all 0.3s ease',
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  borderRadius: '10px',
  padding: '8px 16px',
  textTransform: 'none',
  fontWeight: active ? 600 : 500,
  position: 'relative',
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
  '&::after': active ? {
    content: '""',
    position: 'absolute',
    bottom: -1,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    height: '3px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '3px 3px 0 0',
    transition: 'all 0.3s ease'
  } : {},
  transition: 'all 0.2s ease',
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  transition: 'all 0.2s ease',
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

const ProfileMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '12px',
    marginTop: '8px',
    minWidth: 280,
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)',
    '& .MuiMenu-list': {
      padding: '8px',
    },
    '& .MuiMenuItem-root': {
      borderRadius: '8px',
      padding: '12px 16px',
      gap: '12px',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
      },
    },
  },
}));

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { icon: DashboardIcon, text: 'Ana Sayfa', path: '/' },
    { icon: FavoriteIcon, text: 'Beğendiklerim', path: '/favorites' },
    { icon: GroupIcon, text: 'Arkadaşlarım', path: '/friends' },
  ];

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        <LogoSection onClick={() => navigate('/')}>
          <GameIcon 
            className="logo-icon"
            sx={{ 
              fontSize: 35, 
              color: 'primary.main',
              transition: 'transform 0.3s ease',
            }} 
          />
          <Typography
            className="logo-text"
            variant="h5"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #5E35B1, #7B1FA2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transition: 'all 0.3s ease',
            }}
          >
            META V
          </Typography>
        </LogoSection>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/' && location.pathname === '/');
            
            return (
              <NavButton
                key={item.text}
                startIcon={
                  <item.icon 
                    sx={{ 
                      color: isActive ? 'primary.main' : 'inherit',
                      transition: 'color 0.2s ease'
                    }} 
                  />
                }
                onClick={() => navigate(item.path)}
                active={isActive ? 1 : 0}
              >
                {item.text}
              </NavButton>
            );
          })}
        </Box>

        <IconContainer>
          <SearchBox elevation={0}>
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase
              placeholder="Ara..."
              sx={{ flex: 1, fontSize: '0.95rem' }}
            />
          </SearchBox>

          <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
            <Tooltip title="Bildirimler" arrow>
              <StyledIconButton>
                <StyledBadge badgeContent={3}>
                  <NotificationsIcon sx={{ fontSize: 22 }} />
                </StyledBadge>
              </StyledIconButton>
            </Tooltip>

            <Tooltip title="Mesajlar" arrow>
              <StyledIconButton onClick={() => navigate('/chat')}>
                <StyledBadge badgeContent={2}>
                  <MailIcon sx={{ fontSize: 22 }} />
                </StyledBadge>
              </StyledIconButton>
            </Tooltip>

            <Tooltip title="Profil" arrow>
              <StyledIconButton
                onClick={handleProfileMenuOpen}
                sx={{ 
                  overflow: 'hidden',
                  '&:hover': {
                    '& .profile-avatar': {
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              >
                <Avatar
                  className="profile-avatar"
                  src={user?.avatar}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </StyledIconButton>
            </Tooltip>
          </Box>
        </IconContainer>

        <ProfileMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          TransitionComponent={Fade}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                src={user?.avatar}
                sx={{ 
                  width: 48, 
                  height: 48,
                  backgroundColor: 'primary.main',
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Divider />
          </Box>

          <MenuItem onClick={() => navigate('/profile')}>
            <ListItemIcon>
              <PersonIcon sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            Profilim
          </MenuItem>

          <MenuItem onClick={() => navigate('/settings')}>
            <ListItemIcon>
              <SettingsIcon sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            Ayarlar
          </MenuItem>

          <Divider sx={{ my: 1 }} />

          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LogoutIcon sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Çıkış Yap
          </MenuItem>
        </ProfileMenu>
      </StyledToolbar>
    </StyledAppBar>
  );
};

export default Navbar;