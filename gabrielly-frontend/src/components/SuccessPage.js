import React from 'react';
import { useLocation, Link } from 'react-router-dom';

function SuccessPage() {
    const location = useLocation();
    const orderNumber = location.state?.orderNumber || 'não encontrado';
    const orderId = location.state?.orderId || null;

    return (
        <div style={{ textAlign: 'center', padding: '100px', backgroundColor: '#000', color: '#fff', minHeight: '80vh' }}>
            <h1 style={{ color: 'var(--briliant-color)' }}>Obrigado por seu pedido!</h1>
            <p style={{ fontSize: '1.2em', marginTop: '20px' }}>
                Seu pedido foi realizado com sucesso e está sendo processado.
            </p>
            <p style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '20px 0' }}>
                Nº do Pedido: {orderNumber}
            </p>
            <p style={{ marginBottom: '40px' }}>
                Um email de confirmação foi enviado para o endereço fornecido.
            </p>
            {orderId && (
                <Link to={`/orders/${orderId}`} style={{ color: 'var(--briliant-color)', textDecoration: 'underline', marginRight: '20px' }}>
                    Ver detalhes do pedido
                </Link>
            )}
            <Link to="/" style={{ color: 'var(--briliant-color)', textDecoration: 'underline' }}>
                Voltar para a página inicial
            </Link>
        </div>
    );
}

export default SuccessPage;
