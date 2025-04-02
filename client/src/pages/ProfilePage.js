import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // Для декодирования токена
import { getUserById, getUserAuctions, deleteAuction } from '../api'; // Используем apiClient
import { Link } from 'react-router-dom';

function ProfilePage() {
    const [user, setUser] = useState(null); // Данные пользователя
    const [auctions, setAuctions] = useState([]); // Аукционы пользователя (для seller)
    const [error, setError] = useState(''); // Ошибки

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('You are not logged in.');
                    return;
                }

                // Декодируем токен для получения ID пользователя
                let decodedToken;
                try {
                    decodedToken = jwtDecode(token);
                    console.log('Decoded token:', decodedToken); // Логирование для отладки
                } catch (decodeError) {
                    console.error('Error decoding token:', decodeError);
                    setError('Invalid token. Please log in again.');
                    return;
                }

                const userId = decodedToken.id || decodedToken._id; // Поддержка разных форматов токена
                if (!userId) {
                    setError('User ID not found in token. Please log in again.');
                    return;
                }

                // Запрос данных пользователя
                const userResponse = await getUserById(userId);
                setUser(userResponse.data);

                // Если пользователь — seller, получаем его аукционы
                if (decodedToken.role === 'seller') {
                    const auctionsResponse = await getUserAuctions(userId);
                    setAuctions(auctionsResponse.data);
                }
            } catch (error) {
                console.error('Error fetching user data', error);
                setError('Failed to load profile data.');
            }
        };

        fetchUserData();
    }, []);

    // Функция для удаления аукциона
    const handleDeleteAuction = async (auctionId) => {
        if (!window.confirm('Are you sure you want to delete this auction?')) {
            return; // Отмена, если пользователь отказался
        }

        try {
            // Удаляем аукцион на сервере
            const response = await deleteAuction(auctionId);
            console.log('Server response:', response); // Логирование для отладки

            // Обновляем состояние только после успешного удаления на сервере
            setAuctions((prevAuctions) => prevAuctions.filter((auction) => auction._id !== auctionId));
            alert('Auction deleted successfully'); // Уведомление об успешном удалении
        } catch (error) {
            console.error('Error deleting auction', error);

            // Обработка ошибки 403
            if (error.response && error.response.status === 403) {
                setError('You are not authorized to delete this auction.');
            } else {
                setError('Failed to delete auction. Please try again.');
            }
        }
    };

    if (error) {
        return <p className="text-danger">{error}</p>;
    }

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container mt-5">
            <h2>Profile</h2>
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">{user.name}</h5>
                    <p className="card-text"><strong>Email:</strong> {user.email}</p>
                    <p className="card-text"><strong>Role:</strong> {user.role}</p>

                    {user.role === 'seller' && (
                        <div>
                            <h4 className="mt-4">Your Auctions</h4>
                            {auctions.length > 0 ? (
                                <ul className="list-group">
                                    {auctions.map((auction) => (
                                        <li key={auction._id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <Link to={`/auctions/${auction._id}`}>{auction.title}</Link>
                                            {auction.bids.length === 0 ? (
                                                <Link to={`/auctions/edit/${auction._id}`} className="btn btn-primary btn-sm me-2">
                                                    Edit
                                                </Link>
                                            ) : (
                                                <span className="text-muted me-2">Editing disabled</span>
                                            )}
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteAuction(auction._id)}
                                            >
                                                Delete
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No auctions created yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;