import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ordersAPI } from '../api';
import '../styles/ProductDetailsPage.css';

function OrderDetailsPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        ordersAPI.getById(id)
            .then(data => {
                setOrder(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="loading-spinner">Carregando detalhes do pedido...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!order) return <div>Pedido não encontrado.</div>;

    return (
        <div className="product-details-page">
            <div className="details-card">
                <div className="details-header">
                    <h1>Detalhes do Pedido #{order.order_number}</h1>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                </div>
                <div className="details-body">
                    <div className="customer-details">
                        <h2>Cliente</h2>
                        <p><strong>Nome:</strong> {order.first_name} {order.last_name}</p>
                        <p><strong>Email:</strong> {order.email}</p>
                        <p><strong>Telefone:</strong> {order.phone}</p>
                    </div>
                    <div className="shipping-details">
                        <h2>Endereço de Entrega</h2>
                        <p>{order.street}, {order.number} {order.complement}</p>
                        <p>{order.neighborhood}, {order.city} - {order.state}</p>
                        <p>{order.cep}</p>
                    </div>
                    <div className="payment-details">
                        <h2>Pagamento</h2>
                        <p><strong>Método:</strong> {order.payment_method}</p>
                        <p><strong>Total:</strong> {order.total_amount}</p>
                    </div>
                    <div className="order-items">
                        <h2>Itens do Pedido</h2>
                        <ul>
                            {order.items.map(item => (
                                <li key={item.id}>
                                    <span>{item.product_name}</span>
                                    <span>{item.quantity} x {item.unit_price}</span>
                                    <span>Subtotal: {item.subtotal}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailsPage;
