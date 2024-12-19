import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Badge,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Headset as HeadsetIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';

const VoiceChannels = () => {
  const channels = [
    {
      id: 1,
      name: 'Genel Sohbet',
      users: [
        { id: 1, name: 'User 1', isSpeaking: true, isMuted: false },
        { id: 2, name: 'User 2', isSpeaking: false, isMuted: true },
      ],
      isActive: true,
    },
    {
      id: 2,
      name: 'CS2',
      users: [
        { id: 3, name: 'User 3', isSpeaking: true, isMuted: false },
      ],
      isActive: true,
    },
    {
      id: 3,
      name: 'Valorant',
      users: [],
      isActive: false,
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
          <HeadsetIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Sesli Sohbet</Typography>
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
          {channels.map((channel) => (
            <Card 
              key={channel.id}
              sx={{ 
                borderRadius: '12px',
                backgroundColor: channel.isActive ? 'rgba(255, 75, 145, 0.05)' : 'background.paper'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <VolumeUpIcon sx={{ mr: 1, color: channel.isActive ? 'primary.main' : 'text.secondary' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {channel.name}
                  </Typography>
                  <Chip 
                    size="small"
                    label={`${channel.users.length} kişi`}
                    sx={{ ml: 'auto' }}
                  />
                </Box>

                <List dense>
                  {channel.users.map((user) => (
                    <ListItem
                      key={user.id}
                      secondaryAction={
                        <IconButton edge="end" size="small">
                          {user.isMuted ? <MicOffIcon /> : <MicIcon />}
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                          color={user.isSpeaking ? "success" : "default"}
                        >
                          <Avatar sx={{ width: 32, height: 32 }}>{user.name[0]}</Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={user.name}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                {channel.users.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Henüz kimse yok
                  </Typography>
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HeadsetIcon />}
                  sx={{ mt: 1 }}
                >
                  Katıl
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default VoiceChannels;