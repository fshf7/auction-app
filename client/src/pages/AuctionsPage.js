//client\src\pages\AuctionsPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuctions } from '../api';

function AuctionsPage() {
    const [auctions, setAuctions] = useState([]);
    const [error, setError] = useState(''); // Состояние для отображения ошибок
    const [currentPage, setCurrentPage] = useState(1); // Текущая страница
    const [totalPages, setTotalPages] = useState(1); // Общее количество страниц
    const [limit, setLimit] = useState(5); // Количество аукционов на странице

    const token = localStorage.getItem('token');
    const isLogged = !!token; // Преобразуем в булево значение

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const response = await getAuctions(currentPage, limit); // Передаем page и limit
                setAuctions(response.data.auctions);
                setTotalPages(Math.ceil(response.data.total / limit)); // Вычисляем общее количество страниц
            } catch (error) {
                console.error('Error fetching auctions', error);
                setError('Failed to load auctions. Please try again later.');
            }
        };
        fetchAuctions();
    }, [currentPage, limit]); // Зависимости для обновления при изменении страницы или лимита

    // Проверка роли пользователя (если токен существует)
    const userRole = token ? JSON.parse(atob(token.split('.')[1])).role : null;
    const canCreateAuction = isLogged && userRole === 'seller';

    // Обработчики для навигации по страницам
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Auctions</h1>
            {error && <p className="text-danger">{error}</p>}
            {canCreateAuction && (
                <Link to="/auctions/create" className="btn btn-primary mb-3">
                    Create Auction
                </Link>
            )}
            {!isLogged && <p className="text-muted mb-3">Please login to create an auction.</p>}
            <ul className="list-group">
                {auctions.length > 0 ? (
                    auctions.map((auction) => (
                        <li key={auction._id} className="list-group-item">
                            <Link to={`/auctions/${auction._id}`}>{auction.title}</Link>
                        </li>
                    ))
                ) : (
                    <p>No auctions available.</p>
                )}
            </ul>

            {/* Навигация по страницам */}
            <div className="mt-3">
                <button
                    className="btn btn-secondary me-2"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
                <p className="mt-2">
                    Page {currentPage} of {totalPages}
                </p>
            </div>
        </div>
    );
}

export default AuctionsPage;