//routes\bidRoutes.js
const express = require('express');
const { createBid } = require('../controllers/bidController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bids
 *   description: Bid management
 */

/**
 * @swagger
 * /api/bids:
 *   post:
 *     summary: Create a new bid
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               auctionId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Bid created successfully
 *       400:
 *         description: Validation error or invalid bid amount
 */
router.post('/', authMiddleware, createBid);

// Обработка несуществующих эндпоинтов
router.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = router;