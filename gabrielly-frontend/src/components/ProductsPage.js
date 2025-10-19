import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ProductsPage.css';
import { formatCurrency } from '../utils/format';
import QuickViewModal from '../components/QuickViewModal';
import { useCart } from '../contexts/CartContext';

const ProductsPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, getItemQuantityInCart } = useCart();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // URL da API
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleAddToCartAndNavigate = (product) => {
    const quantityInCart = getItemQuantityInCart(product.id);

    if (quantityInCart >= product.stock) {
      alert(`Estoque máximo atingido! Apenas ${product.stock} unidades disponíveis.`);
      return;
    }

    addToCart(product);
    navigate('/carrinho');
  };

  const openQuickView = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeQuickView = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // 🔄 FUNÇÃO PARA BUSCAR PRODUTOS DA API
  const fetchProducts = useCallback(async (categoryFilter) => {
    try {
      setLoading(true);
      setError(null);

      // Monta a URL com ou sem filtro de categoria
      const endpoint = categoryFilter
        ? `${API_URL}/products?category=${categoryFilter}`
        : `${API_URL}/products`;

      console.log('🔍 Buscando produtos da API:', endpoint);

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Falha ao carregar produtos`);
      }

      const data = await response.json();
      console.log('✅ Produtos carregados:', data.length);

      setProducts(data);
    } catch (err) {
      console.error('❌ Erro ao buscar produtos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchProducts(category);
  }, [category, fetchProducts]);

  const categoryTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'Catálogo Completo';

  if (loading) {
    return (
      <div className="loading" role="alert">
        <p>Carregando produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" style={{
        textAlign: 'center',
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h3>⚠️ Erro ao carregar produtos</h3>
        <p>{error}</p>
        <button
          onClick={() => fetchProducts(category)}
          style={{
            padding: '10px 20px',
            marginTop: '20px',
            backgroundColor: '#FFD700',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          🔄 Tentar novamente
        </button>
        <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
          Verifique se o servidor está rodando em {API_URL}
        </p>
      </div>
    );
  }

  return (
    <div className="products-page">
      {isModalOpen && <QuickViewModal product={selectedProduct} onClose={closeQuickView} />}

      <h2>{categoryTitle}</h2>

      <div className="products-grid">
        {products.length > 0 ? (
          products.map(product => {
            const quantityInCart = getItemQuantityInCart(product.id);
            const isOutOfStock = product.stock === 0;
            const isMaxedOut = quantityInCart >= product.stock;

            // Usa a pasta da categoria ou do próprio produto
            const imageFolder = category || product.folder || product.category;

            return (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img
                    src={`/products/${imageFolder}/${product.image}`}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', e.target.src);
                      e.target.src = '/placeholder-product.jpg'; // Imagem de fallback
                    }}
                  />
                  {isOutOfStock && (
                    <div className="out-of-stock-overlay">
                      <span>ESGOTADO</span>
                    </div>
                  )}
                  <div className="quick-view-overlay">
                    <button
                      className="quick-view-button"
                      onClick={() => openQuickView(product)}
                    >
                      Visualização rápida
                    </button>
                  </div>
                </div>

                <h3>{product.name}</h3>

                <div className="product-prices">
                  <p className="price-total">
                    {formatCurrency(product.price)}
                  </p>
                  <p className="price-installments">
                    10x sem juros de {formatCurrency(product.price / 10.0)}
                  </p>
                </div>

                <div className="stock-info">
                  {product.stock <= 5 && product.stock > 0 && (
                    <p className="low-stock">Apenas {product.stock} unidades disponíveis!</p>
                  )}
                  {quantityInCart > 0 && (
                    <p className="in-cart">{quantityInCart} no carrinho</p>
                  )}
                </div>

                <button
                  className="btn-add-to-cart"
                  aria-label={`Adicionar ${product.name} ao carrinho`}
                  onClick={() => handleAddToCartAndNavigate(product)}
                  disabled={isOutOfStock || isMaxedOut}
                >
                  {isOutOfStock ? 'ESGOTADO' : isMaxedOut ? 'LIMITE ATINGIDO' : 'Adicionar ao Carrinho'}
                </button>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem' }}>
            Nenhum produto encontrado nesta categoria.
          </p>
        )}
      </div>

      {/* Botão de debug apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <button
          style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            padding: '10px',
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 999
          }}
          onClick={() => {
            console.log('=== DEBUG INFO ===');
            console.log('API URL:', API_URL);
            console.log('Categoria atual:', category);
            console.log('Produtos carregados:', products.length);
            console.log('Produtos:', products);
            fetchProducts(category);
          }}
        >
          🐛 DEBUG
        </button>
      )}
    </div>
  );
};

export default ProductsPage;