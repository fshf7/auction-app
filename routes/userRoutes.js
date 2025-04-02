//routes\userRoutes.js
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User'); // Модель пользователя
const Auction = require('../models/Auction'); // Модель аукциона
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Исключаем пароль
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password'); // Исключаем пароль
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @swagger
 * /api/users/auctions:
 *   get:
 *     summary: Get auctions created by the seller
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of auctions created by the seller
 *       401:
 *         description: Unauthorized
 */
router.get('/auctions', authMiddleware, async (req, res) => {
    try {
        // Проверяем роль пользователя
        if (req.user.role !== 'seller') {
            return res.status(403).json({ message: 'Only sellers can view their auctions' });
        }

        // Получаем аукционы, созданные пользователем, с подтянутой категорией
        const auctions = await Auction.find({ seller: req.user._id })
            .populate('category', 'name') // Подтягиваем название категории
            .sort({ endDate: -1 }); // Сортируем по дате окончания

        res.json(auctions);
    } catch (error) {
        console.error('Error fetching user auctions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Обработка несуществующих эндпоинтов
router.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = router;