import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  SportsEsports as GameIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/', { replace: true });
      window.location.reload();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5', // Açık gri arka plan
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: '16px', // Yuvarlak köşeler
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 12px rgba(94, 53, 177, 0.08)', // Mor gölge
        }}
      >
        {/* Logo ve Başlık */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <GameIcon sx={{ fontSize: 40, color: '#5E35B1', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#2D3436' }}>
            META V
          </Typography>
          <Typography variant="body2" sx={{ color: '#636E72', mt: 1 }}>
            Oyun topluluğuna hoş geldin!
          </Typography>
        </Box>

        {/* Hata Mesajı */}
        {error && (
          <Typography
            color="error"
            variant="body2"
            sx={{ mb: 2, textAlign: 'center' }}
          >
            {error}
          </Typography>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="E-posta"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#5E35B1',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#5E35B1',
                },
              }
            }}
          />

          <TextField
            fullWidth
            label="Şifre"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#5E35B1',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#5E35B1',
                },
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(94, 53, 177, 0.04)',
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              mb: 2,
              height: '48px',
              borderRadius: '8px',
              backgroundColor: '#5E35B1',
              '&:hover': {
                backgroundColor: '#4527A0',
              },
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(94, 53, 177, 0.15)',
                backgroundColor: '#4527A0',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Giriş Yap'
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#636E72' }}>
              Hesabın yok mu?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/register')}
                underline="hover"
                sx={{
                  color: '#5E35B1',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#4527A0',
                  },
                }}
              >
                Kayıt Ol
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;