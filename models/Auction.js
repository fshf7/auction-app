//models\Auction.js
const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startingPrice: {
        type: Number,
        required: true,
        min: [0, 'Starting price must be a positive number']
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                // Проверяем дату только при создании или если аукцион активен
                return this.status === 'closed' || value > new Date();
            },
            message: 'End date must be in the future',
        },
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bid' }],
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active',
        index: true
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    currentBid: {
        type: Number,
        default: 0 // Инициализируем как начальную цену
    }
});

AuctionSchema.methods.getCurrentBid = async function () {
    const Bid = mongoose.model('Bid');
    const highestBid = await Bid.findOne({ auction: this._id })
        .sort({ amount: -1 })
        .limit(1);
    return highestBid ? highestBid.amount : this.startingPrice;
};

// Метод для получения выигрышной ставки
AuctionSchema.methods.getWinningBid = async function () {
    const Bid = mongoose.model('Bid');

    // Используем агрегацию для поиска ставки с максимальной суммой и минимальным временем
    const winningBid = await Bid.aggregate([
        { $match: { auction: this._id } }, // Фильтруем ставки для текущего аукциона
        { $sort: { amount: -1, timestamp: 1 } }, // Сортируем по сумме (по убыванию) и времени (по возрастанию)
        { $limit: 1 }, // Берём первую ставку
        {
            $lookup: { // Подтягиваем данные пользователя
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' } // Разворачиваем массив user в объект
    ]);

    return winningBid.length > 0 ? winningBid[0] : null;
};

// Метод для закрытия аукциона
// models/Auction.js

AuctionSchema.methods.closeAuction = async function () {
    if (this.status === 'closed') return;

    const winningBid = await this.getWinningBid();

    if (winningBid && winningBid.amount > this.startingPrice) {
        this.winner = winningBid?.user._id; // Устанавливаем победителя
        this.currentBid = winningBid.amount; // Сохраняем максимальную ставку
    }

    this.status = 'closed';
    this.endDate = new Date(); // Фиксируем актуальное время закрытия

    // Включаем валидацию, но обновляем только разрешенные поля
    await this.save({
        validateBeforeSave: true,
        validateModifiedOnly: true // Валидируем только измененные поля
    });
};

module.exports = mongoose.model('Auction', AuctionSchema);