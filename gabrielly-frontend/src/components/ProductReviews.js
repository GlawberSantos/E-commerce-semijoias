import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProductReviews.css';

const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}/reviews`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setReviews(data.reviews);
            
            if (user) {
                const userReview = data.reviews.find(review => review.userId === user.id);
                setUserReview(userReview);
            }
        } catch (error) {
            setError('Erro ao carregar avaliações');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!user) {
            alert('Faça login para deixar uma avaliação');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newReview)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setReviews([...reviews, data.review]);
            setUserReview(data.review);
            setNewReview({ rating: 5, comment: '' });

        } catch (error) {
            setError('Erro ao enviar avaliação');
        }
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}/reviews/${userReview.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newReview)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setReviews(reviews.map(review => 
                review.id === userReview.id ? data.review : review
            ));
            setUserReview(data.review);
            setNewReview({ rating: 5, comment: '' });

        } catch (error) {
            setError('Erro ao atualizar avaliação');
        }
    };

    const handleDeleteReview = async () => {
        if (!window.confirm('Tem certeza que deseja excluir sua avaliação?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}/reviews/${userReview.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
            }

            setReviews(reviews.filter(review => review.id !== userReview.id));
            setUserReview(null);

        } catch (error) {
            setError('Erro ao excluir avaliação');
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

    if (loading) return <div className="reviews-loading">Carregando avaliações...</div>;
    if (error) return <div className="reviews-error">{error}</div>;

    return (
        <div className="product-reviews">
            <h3>Avaliações dos Clientes</h3>
            
            <div className="reviews-summary">
                <div className="average-rating">
                    <span className="rating-value">{averageRating}</span>
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                                key={star}
                                className={star <= averageRating ? 'star filled' : 'star'}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <span className="total-reviews">
                        {reviews.length} avaliação{reviews.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {!userReview && user && (
                    <form onSubmit={handleSubmitReview} className="review-form">
                        <div className="rating-input">
                            <span>Sua avaliação:</span>
                            {[5, 4, 3, 2, 1].map((star) => (
                                <label key={star}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={star}
                                        checked={newReview.rating === star}
                                        onChange={(e) => setNewReview({
                                            ...newReview,
                                            rating: Number(e.target.value)
                                        })}
                                    />
                                    <span className={star <= newReview.rating ? 'star filled' : 'star'}>
                                        ★
                                    </span>
                                </label>
                            ))}
                        </div>

                        <textarea
                            placeholder="Conte sua experiência com o produto..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview({
                                ...newReview,
                                comment: e.target.value
                            })}
                            required
                        ></textarea>

                        <button type="submit">Enviar avaliação</button>
                    </form>
                )}

                {userReview && (
                    <div className="user-review">
                        <h4>Sua avaliação</h4>
                        <div className="review-actions">
                            <button onClick={() => {
                                setNewReview({
                                    rating: userReview.rating,
                                    comment: userReview.comment
                                });
                            }}>Editar</button>
                            <button onClick={handleDeleteReview}>Excluir</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="reviews-list">
                {reviews.map((review) => (
                    <div key={review.id} className="review-item">
                        <div className="review-header">
                            <div className="reviewer-info">
                                <span className="reviewer-name">{review.userName}</span>
                                <span className="review-date">
                                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <div className="review-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span 
                                        key={star}
                                        className={star <= review.rating ? 'star filled' : 'star'}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductReviews;