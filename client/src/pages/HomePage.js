//client\src\pages\HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Исправленный импорт

function HomePage() {
    const token = localStorage.getItem('token');
    let menu;

    if (token) {
        try {
            // Декодирование токена
            const decodedToken = jwtDecode(token); // Исправленное использование
            const role = decodedToken.role;

            if (role === 'seller') {
                menu = (
                    <span>
                        <Link to="/logout">Logout</Link> {'|'}{' '}
                        <Link to="/auctions/create">Create Auction</Link>
                    </span>
                );
            } else {
                menu = <Link to="/logout">Logout</Link>;
            }
        } catch (error) {
            console.error('Invalid token:', error);
            menu = (
                <span>
                    <Link to="/login">Login</Link> {'|'}{' '}
                    <Link to="/register">Register</Link>
                </span>
            );
        }
    } else {
        menu = (
            <span>
                <Link to="/login">Login</Link> {'|'}{' '}
                <Link to="/register">Register</Link>
            </span>
        );
    }

    return (
        <div className="text-center mt-5">
            <h1 className="mb-4">Welcome to the Auction Site</h1>
            <div>
                {menu} {'|'}{' '}
                <Link to="/auctions">View Auctions</Link>
            </div>
        </div>
    );
}

export default HomePage;