import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Link,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  SportsEsports as GameIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt olurken bir hata oluştu');
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
        backgroundColor: '#F5F5F5',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 12px rgba(94, 53, 177, 0.08)',
        }}
      >
        {/* Logo ve Başlık */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <GameIcon sx={{ fontSize: 40, color: '#5E35B1', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#2D3436' }}>
            META V
          </Typography>
          <Typography variant="body2" sx={{ color: '#636E72', mt: 1 }}>
            Oyun topluluğuna katıl!
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
            label="Kullanıcı Adı"
            name="username"
            value={formData.username}
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
            type="password"
            value={formData.password}
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
            label="Şifre Tekrar"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
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
              'Kayıt Ol'
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#636E72' }}>
              Zaten hesabın var mı?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/login')}
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
                Giriş Yap
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;