import React from 'react';
import { Grid, Box } from '@mui/material';
import Announcements from '../components/Announcements';
import VoiceChannels from '../components/VoiceChannels';
import PostList from '../components/PostList';

const Home = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Sol Panel - Duyurular */}
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              position: 'sticky',
              top: 80,
              height: 'calc(100vh - 100px)',
              overflowY: 'auto',
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
            <Announcements />
          </Box>
        </Grid>

        {/* Orta Panel - Gönderiler */}
        <Grid item xs={12} md={6}>
          <PostList />
        </Grid>

        {/* Sağ Panel - Sesli Sohbet */}
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              position: 'sticky',
              top: 80,
              height: 'calc(100vh - 100px)',
              overflowY: 'auto',
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
            <VoiceChannels />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;