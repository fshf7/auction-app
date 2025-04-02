//client\src\pages\LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Импортируем AuthContext

function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(''); // Состояние для отображения ошибок
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Получаем функцию login

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Очистка ошибки при изменении полей
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Простая валидация
            if (!formData.email || !formData.password) {
                return setError('All fields are required');
            }

            const response = await loginUser(formData);
            localStorage.setItem('token', response.data.token); // Сохранение токена
            login(); // Обновляем состояние авторизации
            navigate('/auctions'); // Перенаправление на страницу аукционов
        } catch (error) {
            console.error('Login error', error);
            setError('Invalid email or password. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            {error && <p className="text-danger">{error}</p>}
            <form onSubmit={handleSubmit} className="w-50">
                <div className="mb-3">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Login
                </button>
            </form>
        </div>
    );
}

export default LoginPage;