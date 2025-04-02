//controllers\bidController.js
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const { body, validationResult } = require('express-validator');

// Создание новой ставки
exports.createBid = [
    // Валидация входных данных
    body('auctionId').isMongoId().withMessage('Invalid auction ID'),
    body('amount').isFloat({ min: 0 }).withMessage('Bid amount must be positive'),

    async (req, res) => {
        // Проверка ошибок валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { auctionId, amount } = req.body;
        
            // Логирование входных данных
            console.log('Creating bid with:', { auctionId, amount });
        
            const auction = await Auction.findById(auctionId).populate('bids');
            if (!auction) {
                console.error('Auction not found for ID:', auctionId);
                return res.status(404).json({ message: 'Auction not found' });
            }
        
            console.log('Auction status:', auction.status);
        
            if (auction.status !== 'active') {
                console.error('Auction is already closed:', auctionId);
                return res.status(400).json({ message: 'Auction is already closed' });
            }

            // Проверка, что пользователь не делает ставку на свой аукцион
            if (auction.seller.toString() === req.user.id) {
                return res.status(403).json({ message: 'You cannot bid on your own auction' });
            }
        
            const currentBid = await auction.getCurrentBid();
            const minBid = currentBid * 1.10; // +10% шаг

            if (amount < minBid) {
                return res.status(400).json({ 
                    message: `Minimum bid is ${minBid.toFixed(2)}` 
                });
            }
        
            const bid = new Bid({
                auction: auctionId,
                user: req.user.id,
                amount,
            });
        
            auction.bids.push(bid);
        
            await bid.save();
            await auction.save();
        
            res.status(201).json(bid);
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ 
                    message: error.message 
                });
            }
            res.status(500).json({ 
                message: 'Error creating bid', 
                error: error.message 
            });
        }
    },
];

// Получение всех ставок для конкретного аукциона
exports.getBidsForAuctionId = async (req, res) => {
    try {
        const bids = await Bid.find({ auction: req.params.id })
            .populate('user', 'name') // Получаем данные о пользователе, сделавшем ставку
            .sort({ timestamp: -1 }); // Сортировка по времени (самые новые ставки сверху)

        res.json(bids);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bids', error });
    }
};