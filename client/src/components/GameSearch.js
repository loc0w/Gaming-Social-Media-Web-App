import React, { useState } from 'react';
import { TextField, Autocomplete, Box, Typography } from '@mui/material';
import { searchGames } from '../utils/gameApi';

const GameSearch = ({ onGameSelect }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    if (query.length < 3) return;
    
    setLoading(true);
    const results = await searchGames(query);
    setOptions(results);
    setLoading(false);
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.name}
      loading={loading}
      onInputChange={(event, value) => handleSearch(value)}
      onChange={(event, value) => onGameSelect(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Oyun Ara"
          variant="outlined"
          fullWidth
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {option.background_image && (
              <img
                src={option.background_image}
                alt={option.name}
                style={{ width: 50, height: 50, marginRight: 10, objectFit: 'cover' }}
              />
            )}
            <Box>
              <Typography variant="body1">{option.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {option.released}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    />
  );
};

export default GameSearch;