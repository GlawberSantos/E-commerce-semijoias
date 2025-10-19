import React from 'react';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import '../styles/pages.css';

const CartPage = () => {
  const { cartItems, totalItems, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

  const handleContinueShopping = () => navigate('/catalogo');
  const handleCheckout = () => navigate('/checkout');

  return (
    <div className="cart-page">
      <h2 className="page-title">RESUMO DO PEDIDO ({totalItems} ITENS)</h2>

      {cartItems.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '30px' }}>
          Seu carrinho está vazio. Comece a explorar nossa coleção!
        </p>
      ) : (
        <>
          <table className="cart-table" role="grid">
            <thead>
              <tr>
                <th scope="col">Produto</th>
                <th scope="col">Preço</th>
                <th scope="col">Quantidade</th>
                <th scope="col">Subtotal</th>
                <th scope="col" aria-label="Remover"></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => {
                const isMaxedOut = item.quantity >= item.stock;

                return (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <strong>{item.name}</strong>
                        {item.stock && (
                          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                            Estoque: {item.stock} unidades
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{formatCurrency(item.price)}</td>
                    <td className="quantity-controls">
                      <button
                        className="btn-quantity"
                        onClick={() => decreaseQuantity(item.id)}
                        aria-label={`Diminuir quantidade de ${item.name}`}
                      >
                        -
                      </button>
                      <span className="current-quantity">{item.quantity || 0}</span>
                      <button
                        className="btn-quantity"
                        onClick={() => increaseQuantity(item.id)}
                        aria-label={`Aumentar quantidade de ${item.name}`}
                        disabled={isMaxedOut}
                        style={{
                          opacity: isMaxedOut ? 0.5 : 1,
                          cursor: isMaxedOut ? 'not-allowed' : 'pointer'
                        }}
                        title={isMaxedOut ? 'Estoque máximo atingido' : ''}
                      >
                        +
                      </button>
                      {isMaxedOut && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#ff6b6b',
                          marginTop: '4px',
                          textAlign: 'center'
                        }}>
                          Máximo atingido
                        </div>
                      )}
                    </td>
                    <td>{formatCurrency((item.price || 0) * (item.quantity || 0))}</td>
                    <td>
                      <button
                        className="btn-remove"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remover ${item.name} completamente`}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                <td style={{ fontWeight: 'bold' }}>{formatCurrency(subtotal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div className="cart-actions">
            <button className="btn-continue-shopping" onClick={handleContinueShopping}>
              ← Continuar Comprando
            </button>
            <button className="btn-checkout" onClick={handleCheckout}>
              Finalizar Compra →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;