import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ProductsPage.css';
import '../styles/Filters.css';
import { formatCurrency } from '../utils/format';
import QuickViewModal from '../components/QuickViewModal';
import { useCart } from '../contexts/CartContext';
import { productsAPI } from '../api'; // ← IMPORTAÇÃO DO NOVO API

const ProductsPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, getItemQuantityInCart } = useCart();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    price: { min: '', max: '' },
    materiais: [],
    cores: [],
    estilos: [],
    ocasião: []
  });

  // Filtros disponíveis (você pode carregar isso da API)
  const availableFilters = {
    materiais: ['Prata 925', 'Ouro 18k', 'Aço Inoxidável', 'Zircônia'],
    cores: ['dourado', 'prateado', 'rosé', 'multicor'],
    estilos: ['Clássico', 'Moderno', 'Casual', 'Elegante', 'Minimalista'],
    ocasião: ['Casual', 'Festa', 'Casamento', 'Trabalho', 'Presente']
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const closeQuickView = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product => {
    if (filters.price.min && product.price < parseFloat(filters.price.min)) return false;
    if (filters.price.max && product.price > parseFloat(filters.price.max)) return false;

    if (filters.materiais.length > 0 && !filters.materiais.includes(product.material)) return false;
    if (filters.cores.length > 0 && !filters.cores.includes(product.color)) return false;
    if (filters.estilos.length > 0 && !filters.estilos.includes(product.style)) return false;
    if (filters.ocasião.length > 0 && !filters.ocasião.includes(product.occasion)) return false;

    return true;
  });

// 🔄 FUNÇÃO ATUALIZADA PARA BUSCAR PRODUTOS DA API
const fetchProducts = useCallback(async (categoryFilter) => {
  try {
    setLoading(true);
    setError(null);

    console.log('🔍 Buscando produtos da API:', categoryFilter || 'todos');

    // USA A NOVA API
    const data = await productsAPI.getAll(categoryFilter);

    console.log('✅ Produtos carregados:', data.length);
    setProducts(data);

  } catch (err) {
    console.error('❌ Erro ao buscar produtos:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, []);

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
        Verifique se o servidor backend está rodando
      </p>
    </div>
  );
}

  return (
    <div className="products-page">
      {isModalOpen && <QuickViewModal product={selectedProduct} onClose={closeQuickView} />}

      <div className="filters-sidebar">
        <button
          className="toggle-filters-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>

        {showFilters && (
          <div className="filters-content">
            <div className="filter-section">
              <h3>Faixa de Preço</h3>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters.price.min}
                  onChange={(e) => handleFilterChange('price', { ...filters.price, min: e.target.value })}
                />
                <span>até</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters.price.max}
                  onChange={(e) => handleFilterChange('price', { ...filters.price, max: e.target.value })}
                />
              </div>
            </div>

            {Object.entries(availableFilters).map(([filterType, options]) => (
              <div key={filterType} className="filter-section">
                <h3>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</h3>
                <div className="filter-options">
                  {options.map(option => (
                    <label key={option} className="filter-option">
                      <input
                        type="checkbox"
                        checked={filters[filterType].includes(option)}
                        onChange={(e) => {
                          const newValues = e.target.checked
                            ? [...filters[filterType], option]
                            : filters[filterType].filter(v => v !== option);
                          handleFilterChange(filterType, newValues);
                        }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="products-container">
        <div className="products-header">
          <h2>{categoryTitle}</h2>
        </div>

        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => {
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
                        e.target.src = '/placeholder-product.jpg';
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
      </div>
    </div>
  );
};

export default ProductsPage;