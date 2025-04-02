//routes\auctionRoutes.js
const Auction = require('../models/Auction'); // Импортируем модель Auction
const express = require('express');
const { createAuction, getAuctions, getAuctionById } = require('../controllers/auctionController');
const authMiddleware = require('../middlewares/authMiddleware');
const { getBidsForAuctionId } = require('../controllers/bidController');
const router = express.Router();
const { updateAuction } = require('../controllers/auctionController');

/**
 * @swagger
 * tags:
 *   name: Auctions
 *   description: Auction management
 */

/**
 * @swagger
 * /api/auctions:
 *   post:
 *     summary: Create a new auction
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startingPrice:
 *                 type: number
 *               endDate:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Auction created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authMiddleware, createAuction);

/**
 * @swagger
 * /api/auctions:
 *   get:
 *     summary: Get all auctions with pagination
 *     tags: [Auctions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of auctions per page
 *     responses:
 *       200:
 *         description: List of auctions
 */
router.get('/', getAuctions);



/**
 * @swagger
 * /api/auctions/{id}:
 *   get:
 *     summary: Get auction by ID
 *     tags: [Auctions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Auction ID
 *     responses:
 *       200:
 *         description: Auction details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Auction'
 *       404:
 *         description: Auction not found
 */
router.get('/:id', getAuctionById);

/**
 * @swagger
 * /api/auctions/bids/{id}:
 *   get:
 *     summary: Get all bids for an auction
 *     tags: [Auctions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Auction ID
 *     responses:
 *       200:
 *         description: List of bids
 *       404:
 *         description: Auction not found
 */
router.get('/bids/:id', getBidsForAuctionId);

/**
 * @swagger
 * /api/auctions/user/{id}:
 *   get:
 *     summary: Get auctions created by a specific user
 *     tags: [Auctions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of auctions created by the user
 *       404:
 *         description: User not found or no auctions available
 */
router.get('/user/:id', async (req, res) => {
    try {
        const auctions = await Auction.find({ seller: req.params.id })
            .populate('category', 'name') // Подтягиваем название категории
            .sort({ endDate: -1 }); // Сортировка по дате окончания

        if (auctions.length === 0) {
            return res.status(200).json({ message: 'No auctions found for this user' });
        }

        res.json(auctions);
    } catch (error) {
        console.error('Error fetching user auctions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @swagger
 * /api/auctions/{id}:
 *   delete:
 *     summary: Delete an auction by ID
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Auction ID
 *     responses:
 *       200:
 *         description: Auction deleted successfully
 *       403:
 *         description: You are not authorized to delete this auction
 *       404:
 *         description: Auction not found
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const auctionId = req.params.id;

        // Логирование для отладки
        console.log('Attempting to delete auction with masked ID:', maskId(auctionId));
        console.log('Requesting User ID:', maskId(req.user.id));

        // Поиск аукциона
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Логирование для отладки
        console.log('Auction owner ID:', maskId(auction.seller.toString()));

        // Проверка, что пользователь является владельцем аукциона
        if (auction.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this auction' });
        }

        // Удаление аукциона
        await Auction.findByIdAndDelete(auctionId);

        res.json({ message: 'Auction deleted successfully' });
    } catch (error) {
        console.error('Error deleting auction:', error.message);
        res.status(500).json({ 
            message: 'Error deleting auction', 
            error: error.message 
        });
    }
});

/**
 * @swagger
 * /api/auctions/{id}:
 *   put:
 *     summary: Update an auction by ID
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Auction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Auction updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: You are not authorized to update this auction
 *       404:
 *         description: Auction not found
 */
router.put('/:id', authMiddleware, updateAuction);

// Обработка несуществующих эндпоинтов
router.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Функция для маскирования ObjectId
function maskId(id) {
    if (!id || typeof id !== 'string') return '[INVALID_ID]';
    return id.substring(0, 4) + '...' + id.substring(id.length - 4);
}

module.exports = router;