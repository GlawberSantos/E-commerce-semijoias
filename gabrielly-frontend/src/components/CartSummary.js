import React, { useState } from 'react';
import { formatCurrency } from '../utils/format';
import { useNavigate } from 'react-router-dom';

function CartSummary({ cartItems, totalItems, total, installments = 6 }) {
    const [isCouponVisible, setIsCouponVisible] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const navigate = useNavigate();

    const handleCouponVisibility = () => {
        setIsCouponVisible(!isCouponVisible);
    };

    const applyCoupon = () => {
        // Lista de cupons válidos (você pode mover isso para o backend depois)
        const validCoupons = {
            'PRIMEIRAS50': 50.00,
            'DESC10': total * 0.10, // 10% de desconto
            'DESC20': total * 0.20, // 20% de desconto
        };

        const upperCoupon = couponCode.toUpperCase();

        if (validCoupons[upperCoupon]) {
            setCouponDiscount(validCoupons[upperCoupon]);
            alert(`Cupom ${upperCoupon} aplicado com sucesso!`);
        } else {
            setCouponDiscount(0);
            alert('Cupom inválido!');
        }
    };

    const totalWithDiscount = total - couponDiscount;
    const currentInstallments = totalWithDiscount / installments;

    return (
        <div className="cart-summary-column">
            <h3>PRODUTOS ({totalItems})</h3>
            <div className="cart-items-list">
                {cartItems && cartItems.length > 0 ? (
                    cartItems.map((item) => (
                        <div key={item.id} className="cart-item">
                            <img
                                src={`/products/${item.folder || item.category}/${item.image}`}
                                alt={item.name}
                                className="item-image"
                                onError={(e) => {
                                    e.target.src = '/placeholder-product.jpg';
                                }}
                            />
                            <div className="item-details">
                                <p className="item-name">{item.name}</p>
                                <p className="item-qty">
                                    {item.quantity} unidade(s) por {formatCurrency(item.price)}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#888' }}>Carrinho vazio.</p>
                )}
                <button
                    className="edit-button"
                    onClick={() => navigate('/carrinho')}
                >
                    VER TODOS OS ITENS
                </button>
            </div>

            <div className="totals-box">
                <div className="total-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                </div>

                {/* CAMPO/BOTÃO DE CUPOM */}
                <div className="total-row coupon-area">
                    <span>Cupom de desconto</span>
                    {!isCouponVisible ? (
                        <button
                            className="coupon-btn"
                            onClick={handleCouponVisibility}
                            type="button"
                        >
                            Inserir cupom
                        </button>
                    ) : (
                        <div className="coupon-input-group">
                            <input
                                type="text"
                                placeholder="Código do Cupom"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="coupon-input"
                            />
                            <button
                                className="coupon-apply-btn"
                                onClick={applyCoupon}
                                type="button"
                            >
                                Aplicar
                            </button>
                        </div>
                    )}
                </div>

                {/* EXIBIÇÃO DO DESCONTO APLICADO */}
                {couponDiscount > 0 && (
                    <div className="total-row discount-applied">
                        <span>Desconto Cupom ({couponCode.toUpperCase()})</span>
                        <span style={{ color: '#28a745' }}>
                            - {formatCurrency(couponDiscount)}
                        </span>
                    </div>
                )}

                <div className="total-row">
                    <span>Frete</span>
                    <span>--</span>
                </div>
                <div className="total-row gift">
                    <span>Brindes (+1 item)</span>
                    <span>Grátis</span>
                </div>

                <div className="total-final">
                    <span>Total</span>
                    <span>{formatCurrency(totalWithDiscount)}</span>
                </div>
                <p className="installments-text">
                    ou {installments}x de {formatCurrency(currentInstallments)} sem juros
                </p>
            </div>
        </div>
    );
}

export default CartSummary;