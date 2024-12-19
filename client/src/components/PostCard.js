// components/PostCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutline as CommentIcon,
  Delete as DeleteIcon,
  Send as SendIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const PostCard = ({
  post,
  onLike,
  onComment,
  onDeleteComment,
  onDeletePost,
  commentInputs,
  setCommentInputs,
  commentLoading,
  currentUser,
  formatDateTime
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <CardContent>
        {/* Post Başlığı */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={post.user?.avatar}
              sx={{ width: 40, height: 40 }}
            >
              {post.user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1">
                {post.user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(post.createdAt)}
              </Typography>
            </Box>
          </Box>
          {post.user._id === currentUser?.id && (
            <IconButton
              size="small"
              onClick={() => onDeletePost(post._id)}
              sx={{
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.light'
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        {/* Post İçeriği */}
        <Typography variant="body1" sx={{ mb: 2 }}>
          {post.content}
        </Typography>

        {/* Post Görseli */}
        {post.image && (
          <Box
            sx={{
              mb: 2,
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: 'grey.100'
            }}
          >
            <img
              src={`http://localhost:5000${post.image}`}
              alt="Post görseli"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'contain'
              }}
            />
          </Box>
        )}

        {/* Etkileşim Butonları */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="small"
              onClick={() => onLike(post._id)}
              sx={{
                color: post.likes?.includes(currentUser?.id) ? 'error.main' : 'action.active'
              }}
            >
              {post.likes?.includes(currentUser?.id) ? (
                <FavoriteIcon />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {post.likes?.length || 0}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="small">
              <CommentIcon />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {post.comments?.length || 0}
            </Typography>
          </Box>
        </Box>

        {/* Yorum Formu */}
        <Box
          component="form"
          onSubmit={(e) => onComment(post._id, e)}
          sx={{ mb: 2 }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Bir yorum yazın..."
              value={commentInputs[post._id] || ''}
              onChange={(e) => setCommentInputs(prev => ({
                ...prev,
                [post._id]: e.target.value
              }))}
              disabled={commentLoading[post._id]}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
            <IconButton
              type="submit"
              disabled={!commentInputs[post._id]?.trim() || commentLoading[post._id]}
              sx={{ color: 'primary.main' }}
            >
              {commentLoading[post._id] ? (
                <CircularProgress size={24} />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
        </Box>

        {/* Yorumlar */}
        {post.comments?.length > 0 && (
          <Stack spacing={2}>
            {post.comments.map((comment) => (
              <Box
                key={comment._id}
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'grey.50'
                }}
              >
                <Avatar
                  src={comment.user?.avatar}
                  sx={{ width: 32, height: 32 }}
                >
                  {comment.user?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {comment.user?.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(comment.createdAt)}
                      </Typography>
                    </Box>
                    {(comment.user._id === currentUser?.id || post.user._id === currentUser?.id) && (
                      <IconButton
                        size="small"
                        onClick={() => onDeleteComment(post._id, comment._id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="body2">
                    {comment.content}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

PostCard.propTypes = {
  post: PropTypes.object.isRequired,
  onLike: PropTypes.func.isRequired,
  onComment: PropTypes.func.isRequired,
  onDeleteComment: PropTypes.func.isRequired,
  onDeletePost: PropTypes.func.isRequired,
  commentInputs: PropTypes.object.isRequired,
  setCommentInputs: PropTypes.func.isRequired,
  commentLoading: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  formatDateTime: PropTypes.func.isRequired
};

export default PostCard;