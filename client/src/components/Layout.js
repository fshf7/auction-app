// client\src\components\Layout.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Импортируем AuthContext

const Layout = ({ children }) => {
    const { isLogged } = useContext(AuthContext); // Получаем состояние авторизации

    return (
        <div>
            {/* Шапка */}
            <header className="bg-light p-3">
                <nav>
                    {/* Общие ссылки */}
                    <Link to="/" className="me-3">Home</Link>
                    <Link to="/auctions" className="me-3">Auctions</Link>

                    {/* Условное отображение ссылок */}
                    {isLogged ? (
                        <>
                            <Link to="/profile" className="me-3">Profile</Link>
                            <Link to="/logout" className="me-3">Logout</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="me-3">Login</Link>
                            <Link to="/register" className="me-3">Register</Link>
                        </>
                    )}
                </nav>
            </header>

            {/* Основной контент */}
            <main className="container mt-4">
                {children}
            </main>

            {/* Футер */}
            <footer className="bg-light p-3 text-center">
                © 2025 Auction App
            </footer>
        </div>
    );
};

export default Layout;