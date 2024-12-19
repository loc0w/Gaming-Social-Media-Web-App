import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
} from '@mui/material';
import { Campaign as CampaignIcon, Circle as CircleIcon } from '@mui/icons-material';

const Announcements = () => {
  const announcements = [
    {
      id: 1,
      title: 'Yeni Güncelleme!',
      content: 'Yeni özellikler ve iyileştirmeler eklendi...',
      date: '2024-01-15',
      type: 'update',
      isNew: true,
    },
    {
      id: 2,
      title: 'Sunucu Bu hafta açılıyor!',
      content: 'MetaV Sunucumuz bu Cuma açılıyor!',
      date: '2024-01-14',
      type: 'event',
      isNew: true,
    },
    {
      id: 3,
      title: 'Sistem Bakımı',
      content: 'Yarın 03:00-05:00 arası bakım yapılacak...',
      date: '2024-01-13',
      type: 'maintenance',
      isNew: false,
    },
  ];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CampaignIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Duyurular</Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#666',
          },
        }}
      >
        <Stack spacing={2}>
          {announcements.map((announcement) => (
            <Card 
              key={announcement.id}
              sx={{ 
                borderRadius: '12px',
                position: 'relative',
                overflow: 'visible'
              }}
            >
              {announcement.isNew && (
                <CircleIcon 
                  sx={{ 
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    color: 'primary.main',
                    fontSize: 12
                  }}
                />
              )}
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {announcement.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {announcement.content}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Chip 
                    label={announcement.type}
                    size="small"
                    color={
                      announcement.type === 'update' ? 'primary' :
                      announcement.type === 'event' ? 'secondary' : 'default'
                    }
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(announcement.date).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default Announcements;