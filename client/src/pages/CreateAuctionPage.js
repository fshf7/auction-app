//client\src\pages\CreateAuctionPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAuction, getCategories } from '../api';

function CreateAuctionPage() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startingPrice: '',
        endDate: '', // Хранит значение в локальном времени
        category: '' 
    });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories', error);
                setError('Failed to load categories. Please try again later.');
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = (e) => {
        const selectedCategoryId = e.target.value;
        setFormData({ ...formData, category: selectedCategoryId });
        setError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!formData.title || !formData.description || !formData.startingPrice || !formData.endDate || !formData.category) {
            return setError('All fields are required');
        }
        if (formData.startingPrice <= 0) {
            return setError('Starting price must be greater than 0');
        }
    
        // Преобразуем дату в UTC
        const localEndDate = new Date(formData.endDate); // Локальное время
        const utcEndDate = new Date(
            localEndDate.getUTCFullYear(),
            localEndDate.getUTCMonth(),
            localEndDate.getUTCDate(),
            localEndDate.getUTCHours()+3,
            localEndDate.getUTCMinutes()
        );
    
        // Проверяем, что дата окончания в будущем
        if (utcEndDate <= new Date()) {
            return setError('End date must be in the future');
        }
    
        try {
            // Отправляем данные с преобразованной датой
            await createAuction({
                ...formData,
                endDate: utcEndDate.toISOString() // Преобразуем в строку ISO
            });
    
            // Очищаем форму после успешного создания
            setFormData({
                title: '',
                description: '',
                startingPrice: '',
                endDate: '',
                category: ''
            });
            navigate('/auctions');
        } catch (error) {
            console.error('Error creating auction', error);
            setError('Failed to create auction. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Create Auction</h2>
            {error && <p className="text-danger">{error}</p>}
            <form onSubmit={handleSubmit} className="w-50">
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="startingPrice" className="form-label">Starting Price</label>
                    <input
                        type="number"
                        name="startingPrice"
                        id="startingPrice"
                        value={formData.startingPrice}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="endDate" className="form-label">End Date</label>
                    <input
                        type="datetime-local"
                        name="endDate"
                        id="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleCategoryChange}
                        required
                        className="form-select"
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">
                    Create Auction
                </button>
            </form>
        </div>
    );
}

export default CreateAuctionPage;