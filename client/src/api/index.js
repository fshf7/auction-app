// src/api/index.js
import axios from 'axios';

// Базовый URL для API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Создание экземпляра Axios с базовым URL
const apiClient = axios.create({
    baseURL: API_URL,
});

// Перехватчик для добавления токена в заголовки
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Получаем токен из localStorage
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Перехватчик для обработки ошибок
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.data.message || error.message);
        } else {
            console.error('API Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// Функции для взаимодействия с API
export const registerUser = (userData) => apiClient.post('/auth/register', userData);
export const loginUser = (userData) => apiClient.post('/auth/login', userData);
export const getAuctions = () => apiClient.get('/auctions');
export const getBidsForAuctionId = (id) => apiClient.get(`/auctions/bids/${id}`);
export const getAuctionById = (id) => apiClient.get(`/auctions/${id}`);
export const createAuction = (auctionData) => apiClient.post('/auctions', auctionData);
export const getCategories = () => apiClient.get('/categories');
export const createBid = (bidData) => apiClient.post('/bids', bidData);
export const getUserById = (userId) => apiClient.get(`/users/${userId}`);
export const getUserAuctions = (userId) => apiClient.get(`/auctions/user/${userId}`);
export const deleteAuction = (auctionId) =>
    apiClient.delete(`/auctions/${auctionId}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
    });
export const updateAuction = (auctionId, auctionData) => apiClient.put(`/auctions/${auctionId}`, auctionData);