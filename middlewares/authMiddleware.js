//middlewares\authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Middleware для аутентификации пользователя
 * Проверяет наличие и валидность JWT токена
 */
module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Декодируем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Преобразуем id в строку
        decoded.id = decoded.id.toString();

        // Добавляем данные пользователя в объект запроса
        req.user = decoded;

        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

/**
 * Middleware для авторизации по роли
 * @param {string} role - Требуемая роль пользователя
 */
module.exports.authorizeRole = (role) => {
    return (req, res, next) => {
        // Проверка роли пользователя
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
        }
        next();
    };
};