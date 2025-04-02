//client\src\pages\RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';

function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'buyer' });
    const [error, setError] = useState(''); // Состояние для отображения ошибок
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Простая валидация
            if (formData.password.length < 6) {
                return setError('Password must be at least 6 characters long');
            }

            await registerUser(formData);
            navigate('/login'); // Перенаправление на страницу входа
        } catch (error) {
            console.error('Registration error', error);
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Register</h2>
            {error && <p className="text-danger">{error}</p>}
            <form onSubmit={handleSubmit} className="w-50">
                <div className="mb-3">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>
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
                <div className="mb-3">
                    <div className="form-check form-check-inline">
                        <input
                            type="radio"
                            id="role-buyer"
                            name="role"
                            value="buyer"
                            checked={formData.role === 'buyer'}
                            onChange={handleChange}
                            className="form-check-input"
                        />
                        <label htmlFor="role-buyer" className="form-check-label">
                            Buyer
                        </label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            type="radio"
                            id="role-seller"
                            name="role"
                            value="seller"
                            checked={formData.role === 'seller'}
                            onChange={handleChange}
                            className="form-check-input"
                        />
                        <label htmlFor="role-seller" className="form-check-label">
                            Seller
                        </label>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">
                    Register
                </button>
            </form>
        </div>
    );
}

export default RegisterPage;