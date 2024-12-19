import axios from './axios';

const RAWG_API_KEY = 'your_rawg_api_key'; // RAWG API anahtarınızı buraya ekleyin
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export const searchGames = async (query) => {
  try {
    const response = await axios.get(`${RAWG_BASE_URL}/games`, {
      params: {
        key: RAWG_API_KEY,
        search: query,
        page_size: 10
      }
    });
    return response.data.results;
  } catch (error) {
    console.error('Oyun arama hatası:', error);
    return [];
  }
};

export const getGameDetails = async (gameId) => {
  try {
    const response = await axios.get(`${RAWG_BASE_URL}/games/${gameId}`, {
      params: {
        key: RAWG_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Oyun detayları alınamadı:', error);
    return null;
  }
};