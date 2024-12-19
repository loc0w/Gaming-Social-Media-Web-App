import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Chat from './pages/Chat';
import Favorites from './pages/Favorites';
import Friends from './pages/Friends';
import Events from './pages/Events';


// Tema yapılandırması
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5E35B1',
      light: '#7E57C2',
      dark: '#4527A0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#673AB7',
      light: '#9575CD',
      dark: '#512DA8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F5F5F5',
      paper: '#ffffff',
    },
    text: {
      primary: '#2D3436',
      secondary: '#636E72',
    },
    error: {
      main: '#e74c3c',
      light: '#ff6b6b',
      dark: '#c0392b',
    },
    success: {
      main: '#00b894',
      light: '#55efc4',
      dark: '#00a885',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F5F5F5',
          scrollBehavior: 'smooth',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '*::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(94, 53, 177, 0.08)',
          borderRadius: '16px',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(94, 53, 177, 0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(94, 53, 177, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: '#F8F9FA',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 0 2px rgba(94, 53, 177, 0.2)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(94, 53, 177, 0.08)',
          borderRadius: '16px',
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(94, 53, 177, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 20px rgba(94, 53, 177, 0.12)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(94, 53, 177, 0.04)',
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#5E35B1',
          boxShadow: '0 2px 8px rgba(94, 53, 177, 0.15)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(45, 52, 54, 0.9)',
          borderRadius: '8px',
          fontSize: '0.875rem',
        },
      },
    },
  },
});

// Route Guard bileşeni
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  const isAuthenticated = localStorage.getItem('token');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}>
          {isAuthenticated && <Navbar />}
          
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1,
              width: '100%',
              minHeight: '100vh',
              pt: isAuthenticated ? '70px' : 0, // Navbar yüksekliğine göre ayarlandı
              pb: 4,
            }}
          >
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />

              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile/:userId" 
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <PrivateRoute>
                    <Chat />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/favorites" 
                element={
                  <PrivateRoute>
                    <Favorites />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/friends" 
                element={
                  <PrivateRoute>
                    <Friends />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/events" 
                element={
                  <PrivateRoute>
                    <Events />
                  </PrivateRoute>
                } 
              />

              {/* 404 - Catch all route */}
              <Route 
                path="*" 
                element={
                  <Navigate to="/" replace />
                } 
              />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;