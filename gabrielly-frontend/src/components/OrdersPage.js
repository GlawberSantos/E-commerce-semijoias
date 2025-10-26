import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/format';
import '../styles/OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/orders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar pedidos');
            }

            const data = await response.json();
            setOrders(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        const statusMap = {
            'pending': 'status-pending',
            'processing': 'status-processing',
            'shipped': 'status-shipped',
            'delivered': 'status-delivered',
            'cancelled': 'status-cancelled'
        };
        return statusMap[status] || 'status-pending';
    };

    const formatStatus = (status) => {
        const statusMap = {
            'pending': 'Aguardando pagamento',
            'processing': 'Em processamento',
            'shipped': 'Enviado',
            'delivered': 'Entregue',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    if (loading) {
        return (
            <div className="orders-page">
                <div className="loading">Carregando pedidos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-page">
                <div className="error">
                    <p>{error}</p>
                    <button onClick={fetchOrders}>Tentar novamente</button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <h1>Meus Pedidos</h1>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <p>Você ainda não tem nenhum pedido.</p>
                    <Link to="/catalogo" className="start-shopping">
                        Começar a comprar
                    </Link>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <div>
                                    <h3>Pedido #{order.id}</h3>
                                    <p className="order-date">
                                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <span className={`order-status ${getStatusClass(order.status)}`}>
                                    {formatStatus(order.status)}
                                </span>
                            </div>

                            <div className="order-items">
                                {order.items.map((item) => (
                                    <div key={item.id} className="order-item">
                                        <img 
                                            src={`/products/${item.category}/${item.image}`}
                                            alt={item.name}
                                        />
                                        <div className="item-details">
                                            <p className="item-name">{item.name}</p>
                                            <p className="item-quantity">Quantidade: {item.quantity}</p>
                                            <p className="item-price">
                                                {formatCurrency(item.price)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-footer">
                                <div className="order-total">
                                    <span>Total:</span>
                                    <span className="total-value">
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                                
                                {order.tracking && (
                                    <div className="tracking-info">
                                        <p>Rastreamento:</p>
                                        <a 
                                            href={`https://www.linkcorreios.com.br/${order.tracking}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {order.tracking}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;