import React, { useState } from 'react';
import '../styles/AdminPage.css'; // Reusing styles

function CouponManagement() {
    const [coupon, setCoupon] = useState({
        code: '',
        discount: '',
        expiryDate: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCoupon(prevCoupon => ({
            ...prevCoupon,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to send coupon data to the backend
    };

    return (
        <div>
            <h1>Gerenciar Cupons</h1>
            {/* I will add a list of coupons here later */}

            <h2>Adicionar Novo Cupom</h2>
            <form onSubmit={handleSubmit} className="coupon-form">
                <div className="form-group">
                    <label htmlFor="code">Código do Cupom</label>
                    <input type="text" id="code" name="code" value={coupon.code} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="discount">Desconto (%)</label>
                    <input type="number" id="discount" name="discount" value={coupon.discount} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="expiryDate">Data de Expiração</label>
                    <input type="date" id="expiryDate" name="expiryDate" value={coupon.expiryDate} onChange={handleChange} required />
                </div>
                <button type="submit" className="submit-button">Adicionar Cupom</button>
            </form>
        </div>
    );
}

export default CouponManagement;