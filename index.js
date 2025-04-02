require('dotenv').config(); // Загрузка переменных окружения
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // Для логирования запросов
const connectDB = require('./config/db'); // Функция подключения к базе данных
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes = require('./routes/bidRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const swaggerSetup = require('./config/swagger'); // Подключение Swagger

// Создание экземпляра Express
const app = express();

// Middleware
app.use(cors()); // Настройка CORS
app.use(express.json()); // Парсинг JSON
app.use(morgan('dev')); // Логирование запросов

// Middleware для парсинга даты в формате ISO 8601
app.use((req, res, next) => {
    if (req.body.endDate) {
        req.body.endDate = new Date(req.body.endDate).toISOString();
    }
    next();
});

// Подключение к базе данных
connectDB();

const Auction = require('./models/Auction');

/**
 * Фоновая задача для закрытия аукционов
 */
const checkExpiredAuctions = async () => {
    try {
        const now = new Date();
        const expiredAuctions = await Auction.find({
            endDate: { $lte: now },
            status: 'active'
        });

        for (const auction of expiredAuctions) {
            await auction.closeAuction();
            console.log(`Auction ${auction._id} closed`.yellow);
        }
    } catch (error) {
        console.error('Error closing auctions:', error);
    }
};

/**
 * Проверка просроченных аукционов при запуске сервера
 */
const handleMissedAuctionsOnStartup = async () => {
    try {
        console.log('Checking for missed auctions on startup...'.cyan);
        await checkExpiredAuctions(); // Проверяем и закрываем просроченные аукционы
        console.log('Missed auctions processing completed.'.green);
    } catch (error) {
        console.error('Error handling missed auctions on startup:', error);
    }
};

// Запуск проверки каждую минуту
setInterval(checkExpiredAuctions, 60000);

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/categories', categoryRoutes);

// Настройка Swagger
swaggerSetup(app);

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`.yellow.bold);
    await handleMissedAuctionsOnStartup(); // Проверка просроченных аукционов при запуске
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});