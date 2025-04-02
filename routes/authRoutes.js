//routes\authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Лимитирование запросов для регистрации и входа
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // лимит до 100 запросов
    message: 'Too many requests, please try again later',
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration successful
 *       400:
 *         description: Validation error or email already exists
 */
router.post('/register', authLimiter, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, login);

// Обработка несуществующих эндпоинтов
router.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = router;