import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api';
import { Link } from 'react-router-dom';
import '../styles/OrdersPage.css';

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        ordersAPI.getAll()
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="loading-spinner">Carregando pedidos...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="orders-page">
            <h1>Meus Pedidos</h1>
            {orders.length === 0 ? (
                <p>Você ainda não fez nenhum pedido.</p>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <h2>Pedido #{order.order_number}</h2>
                                <span className={`order-status ${order.status}`}>{order.status}</span>
                            </div>
                            <div className="order-body">
                                <p><strong>Data:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                                <p><strong>Total:</strong> {order.total_amount}</p>
                                <p><strong>Itens:</strong> {order.items_count}</p>
                            </div>
                            <div className="order-footer">
                                <Link to={`/orders/${order.id}`} className="details-link">Ver Detalhes</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrdersPage;
