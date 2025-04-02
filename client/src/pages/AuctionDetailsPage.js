import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAuctionById, getBidsForAuctionId, createBid } from '../api';

function AuctionDetailsPage() {
    const { id } = useParams();
    const [auction, setAuction] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const [bids, setBids] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const auctionResponse = await getAuctionById(id);
                const bidsResponse = await getBidsForAuctionId(id);

                // Сортировка ставок по убыванию суммы
                const sortedBids = bidsResponse.data.sort((a, b) => b.amount - a.amount);

                setAuction(auctionResponse.data);
                setBids(sortedBids);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load auction details');
            }
        };
        fetchData();
    }, [id]);

    const handleBidSubmit = async (e) => {
        e.preventDefault();

        // Проверка статуса аукциона
        if (auction.status !== 'active') {
            return setError('Auction is already closed');
        }

        // Валидация ставки
        const currentBid = bids.length > 0 ? bids[0].amount : auction.startingPrice;
        const minBid = currentBid * 1.1; // Минимальная ставка — на 10% больше текущей

        if (bidAmount <= currentBid) {
            return setError(`Minimum bid: ${minBid.toFixed(2)}`);
        }

        try {
            await createBid({ auctionId: id, amount: bidAmount });
            setBidAmount('');
            setError('');
            alert('Bid placed successfully!');
        } catch (error) {
            console.error('Error placing bid:', error);
            setError(error.response?.data?.message || 'Failed to place bid. Please try again.');
        }
    };

    if (!auction) return <p>Loading...</p>;

    return (
        <div className="container mt-5">
            <h2>{auction.title}</h2>
            <p>{auction.description}</p>
            <p>Starting Price: ${auction.startingPrice}</p>
            <p>End Date: {new Date(auction.endDate).toLocaleString()}</p>
            <p>Category: {auction.category?.name || 'N/A'}</p>

            {auction.status === 'active' ? (
                <div>
                    {error && <p className="text-danger">{error}</p>}
                    <form onSubmit={handleBidSubmit} className="mb-3">
                        <div className="input-group">
                            <input
                                type="number"
                                placeholder="Enter bid amount"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                required
                                className="form-control"
                                disabled={auction.status !== 'active'} // Отключение поля при закрытом аукционе
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={auction.status !== 'active'} // Отключение кнопки при закрытом аукционе
                            >
                                Place Bid
                            </button>
                        </div>
                    </form>
                    <ul className="list-group">
                        {bids.map((bid) => (
                            <li key={bid._id} className="list-group-item">
                                ${bid.amount} by {bid.user?.name} ({new Date(bid.timestamp).toLocaleDateString()})
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>
                    <p className="text-muted">Auction has ended.</p>
                    {auction.winner ? (
                        <p>Winner: {auction.winner.name} with ${auction.currentBid}</p>
                    ) : (
                        <p>No valid bids received.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default AuctionDetailsPage;