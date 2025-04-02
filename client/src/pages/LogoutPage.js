// client\src\pages\LogoutPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Импортируем AuthContext

function LogoutPage() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext); // Получаем функцию logout

    useEffect(() => {
        logout(); // Вызываем функцию logout
        console.log('User logged out successfully.');
        setTimeout(() => {
            navigate('/', { replace: true });
        }, 500);
    }, [navigate, logout]);

    return (
        <div className="text-center mt-5">
            <h3>Logging out...</h3>
            <p>You will be redirected to the home page shortly.</p>
        </div>
    );
}

export default LogoutPage;