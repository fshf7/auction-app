//client\src\App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import { AuthProvider } from './context/AuthContext'; // Импортируем AuthProvider

// Компоненты Layout
import Layout from './components/Layout'; // Общий макет (например, шапка и футер)
import NotFoundPage from './pages/NotFoundPage'; // Страница 404

// Страницы
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import RegisterPage from './pages/RegisterPage';
import AuctionsPage from './pages/AuctionsPage';
import AuctionDetailsPage from './pages/AuctionDetailsPage';
import CreateAuctionPage from './pages/CreateAuctionPage';
import ProfilePage from './pages/ProfilePage';
import EditAuctionPage from './pages/EditAuctionPage';

// Middleware для защиты маршрутов
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token'); // Проверяем наличие токена
    if (!token) {
        return <Navigate to="/login" replace />; // Перенаправляем на страницу входа
    }
    return children;
};

function App() {
    return (
        <AuthProvider> {/* Оборачиваем приложение в AuthProvider */}
            <Router>
                <Layout>
                    <Routes>
                        {/* Публичные маршруты */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/logout" element={<LogoutPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/auctions" element={<AuctionsPage />} />
                        <Route path="/auctions/:id" element={<AuctionDetailsPage />} />
                        {/* Защищенные маршруты */}
                        <Route
                            path="/auctions/create"
                            element={
                                <ProtectedRoute>
                                    <CreateAuctionPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/auctions/edit/:id"
                            element={
                                <ProtectedRoute>
                                    <EditAuctionPage />
                                </ProtectedRoute>
                            }
                        />
                        {/* Страница 404 */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
}

export default App;