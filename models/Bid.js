//models\Bid.js
const mongoose = require('mongoose');
const BidSchema = new mongoose.Schema({
    auction: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Auction', 
        required: true, 
        index: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },
    amount: {
        type: Number,
        required: true,
        validator: async function (value) {
            const Auction = mongoose.model('Auction');
            const auction = await Auction.findById(this.auction);
            if (!auction) throw new Error('Auction not found');
            const currentBid = await auction.getCurrentBid();
            return value > currentBid;
        },
        message: 'Bid must exceed the current highest bid',
    },
    timestamp: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Bid', BidSchema);