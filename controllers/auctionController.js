//controllers\auctionController.js
const Auction = require('../models/Auction');
const Category = require('../models/Category');
const { body, validationResult } = require('express-validator');

// Создание нового аукциона
exports.createAuction = [
    // Валидация входных данных
    body('title').notEmpty().withMessage('Title is required'),
    body('startingPrice')
        .isFloat({ min: 0 })
        .withMessage('Starting price must be a positive number'),
    body('endDate')
        .custom((value) => {
            const parsedEndDate = new Date(value); // Преобразуем в объект Date
            const now = new Date(); // Текущее время в UTC
            if (isNaN(parsedEndDate.getTime())) {
                throw new Error('Invalid date format');
            }
            if (parsedEndDate <= now) {
                throw new Error('End date must be in the future');
            }
            return true;
        }),
    body('category')
        .notEmpty()
        .withMessage('Category is required')
        .custom(async (value) => {
            const category = await Category.findById(value);
            if (!category) throw new Error('Category not found');
            return true;
        }),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { title, description, startingPrice, endDate, category } = req.body;

            // Поиск категории по ObjectId
            const categoryDoc = await Category.findById(category);
            if (!categoryDoc) {
                return res.status(400).json({ message: 'Category not found' });
            }

            // Преобразуем дату в объект Date
            const parsedEndDate = new Date(endDate);

            const auction = new Auction({
                title,
                description,
                startingPrice,
                endDate: parsedEndDate,
                seller: req.user.id,
                category: categoryDoc._id,
            });

            await auction.save();
            res.status(201).json(auction);
        } catch (error) {
            console.error('Error creating auction:', error);
            res.status(500).json({
                message: 'Error creating auction',
                error: error.message
            });
        }
    },
];

// Получение списка аукционов с пагинацией
exports.getAuctions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const auctions = await Auction.find()
            .populate('seller', 'name')
            .populate('category', 'name') // Добавлено подключение категории
            .sort({ endDate: 1 }) // Сортировка по дате окончания
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Auction.countDocuments();

        res.json({
            page,
            limit,
            total,
            auctions,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching auctions',
            error: error.message
        });
    }
};

// Получение аукциона по ID
exports.getAuctionById = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id)
            .populate('seller', 'name')
            .populate('category', 'name') // Добавлено подключение категории
            .populate({
                path: 'bids',
                populate: { path: 'user', select: 'name' }
            })
            .populate('winner', 'name');

        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Проверка, нужно ли закрыть аукцион
        if (auction.status === 'active' && new Date(auction.endDate) <= new Date()) {
            await auction.closeAuction();
            console.log(`Auction ${auction._id} was closed during request`.yellow);
        }

        res.json(auction);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching auction',
            error: error.message
        });
    }
};

// Обновление аукциона
exports.updateAuction = async (req, res) => {
    try {
        const auctionId = req.params.id;
        const { title, description, endDate } = req.body;

        // Поиск аукциона
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Проверка, что пользователь является владельцем аукциона
        if (auction.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to edit this auction' });
        }

        // Проверка, что на аукцион уже были сделаны ставки
        if (auction.bids.length > 0) {
            return res.status(400).json({ message: 'Editing is not allowed after receiving bids' });
        }

        // Обновление данных аукциона
        auction.title = title || auction.title;
        auction.description = description || auction.description;
        auction.endDate = endDate ? new Date(endDate) : auction.endDate;

        // Валидация даты окончания
        if (auction.endDate <= new Date()) {
            return res.status(400).json({ message: 'End date must be in the future' });
        }

        await auction.save();
        res.json(auction);
    } catch (error) {
        console.error('Error updating auction:', error);
        res.status(500).json({ message: 'Error updating auction', error: error.message });
    }
};