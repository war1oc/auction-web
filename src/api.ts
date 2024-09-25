import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for adding the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const login = async (identifier: string, password: string) => {
  const response = await api.post('/api/auth/local', { identifier, password });
  return response.data;
};

export const fetchAuctionItems = async (page = 1, pageSize = 9) => {
    const response = await api.get('/api/items', {
      params: {
        populate: '*',
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
      }
    });
    return response.data;
  };

  export const fetchItemDetails = async (id: string) => {
    const response = await api.get(`/api/items/${id}`, {
      params: {
        populate: '*',
      }
    });
    return response.data;
  };

  export const fetchItemBids = async (itemId: string) => {
    const response = await api.get('/api/bids', {
      params: {
        'filters[item][id][$eq]': itemId,
        sort: 'amount:desc',
        populate: {
          item: {
            populate: '*'
          },
          users_permissions_user: {
            fields: ['id']
          }
        }
      }
    });
    return response.data;
  };

  export const submitBid = async (itemId: string, amount: number) => {
    const response = await api.post('/api/bids', {
      data: {
        amount,
        item: itemId,
      }
    });
    return response.data;
  };

  export const fetchWinnerDetails = async (userId: number) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  };

export default api;