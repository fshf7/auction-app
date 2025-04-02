import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuctionById, updateAuction } from '../api';

function EditAuctionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        endDate: '',
    });
    const [error, setError] = useState('');
    const [auction, setAuction] = useState(null);

    useEffect(() => {
        const fetchAuction = async () => {
            try {
                const response = await getAuctionById(id);
                const auctionData = response.data;
                setAuction(auctionData);
                setFormData({
                    title: auctionData.title,
                    description: auctionData.description,
                    endDate: new Date(auctionData.endDate).toISOString().slice(0, 16),
                });
            } catch (error) {
                console.error('Error fetching auction', error);
                setError('Failed to load auction details.');
            }
        };
        fetchAuction();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.endDate) {
            return setError('All fields are required');
        }

        if (new Date(formData.endDate) <= new Date()) {
            return setError('End date must be in the future');
        }

        try {
            await updateAuction(id, formData);
            navigate('/profile');
        } catch (error) {
            console.error('Error updating auction', error);
            setError('Failed to update auction. Please try again.');
        }
    };

    if (!auction) return <p>Loading...</p>;

    return (
        <div className="container mt-5">
            <h2>Edit Auction</h2>
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
                <button type="submit" className="btn btn-primary">
                    Update Auction
                </button>
            </form>
        </div>
    );
}

export default EditAuctionPage;