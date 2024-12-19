// components/FriendCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Avatar,
  Box,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';

const FriendCard = ({ friend }) => {
  const navigate = useNavigate();

  return (
    <Card
      elevation={0}
      onClick={() => navigate(`/profile/${friend._id}`)}
      sx={{
        display: 'flex',
        p: 2,
        borderRadius: 3,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderColor: 'primary.main'
        }
      }}
    >
      <Avatar
        src={friend.avatar}
        sx={{
          width: 50,
          height: 50,
          mr: 2,
          border: '2px solid',
          borderColor: 'primary.main'
        }}
      >
        {friend.username?.[0]?.toUpperCase()}
      </Avatar>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {friend.username}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {friend.location || 'Konum belirtilmemiş'}
        </Typography>
      </Box>
    </Card>
  );
};

FriendCard.propTypes = {
  friend: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    username: PropTypes.string.isRequired,
    location: PropTypes.string
  }).isRequired
};

export default FriendCard;