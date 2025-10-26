import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ProductsPage.css';
import '../styles/Filters.css';
import { formatCurrency } from '../utils/format';
import { useCart } from '../contexts/CartContext';
import { productsAPI } from '../api';
import ProductFilters from './ProductFilters'; // Importando o componente de filtros

const ProductsPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const [filters, setFilters] = useState({
    price: { min: '', max: '' },
    materiais: [],
    cores: [],
    estilos: [],
    ocasião: []
  });

  // Filtros disponíveis (mock)
  const availableFilters = {
    materiais: ['Prata 925', 'Ouro 18k', 'Aço Inoxidável', 'Zircônia'],
    cores: ['dourado', 'prateado', 'rosé', 'multicor'],
    estilos: ['Clássico', 'Moderno', 'Casual', 'Elegante', 'Minimalista'],
    ocasião: ['Casual', 'Festa', 'Casamento', 'Trabalho', 'Presente']
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
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

  const fetchProducts = useCallback(async (categoryFilter) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getAll(categoryFilter);
      setProducts(data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(category);
  }, [category, fetchProducts]);

  const categoryTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Catálogo';

  if (loading) return <div className="loading"><p>Carregando produtos...</p></div>;
  if (error) return <div className="error-container"><p>Erro ao carregar produtos: {error}</p></div>;

  return (
    <div className="products-page-container">
      <ProductFilters 
        filters={filters} 
        setFilters={setFilters} 
        availableFilters={availableFilters} 
        handleFilterChange={handleFilterChange} 
      />

      <div className="main-content">
        <div className="products-header">
            <div className="breadcrumb">
                Home / {categoryTitle}
            </div>
            <div className="view-options">
                <select name="sort-by" id="sort-by">
                    <option value="position">Posição</option>
                    <option value="price-asc">Preço: Menor ao Maior</option>
                    <option value="price-desc">Preço: Maior ao Menor</option>
                </select>
                <select name="display" id="display">
                    <option value="6">6 por página</option>
                    <option value="12">12 por página</option>
                    <option value="24">24 por página</option>
                </select>
            </div>
        </div>

        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => {
              const imageFolder = category || product.folder || product.category;
              return (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={`/products/${imageFolder}/${product.image}`}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>
                  
                  <h3>{product.name}</h3>

                  <div className="product-rating">★★★★★</div>

                  <p className="product-description">
                    Integer neque quam, convallis sed malesuada eget, tempus ac tortor.
                  </p>

                  <div className="product-prices">
                    <span className="price-total">{formatCurrency(product.price)}</span>
                  </div>

                  <div className="buy-actions">
                    <input type="number" defaultValue="1" min="1" max={product.stock} />
                    <button
                      className="btn-buy-now"
                      onClick={() => addToCart(product)} // Simplificado por agora
                      disabled={product.stock === 0}
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p>Nenhum produto encontrado.</p>
          )}
        </div>

        <div className="pagination">
            <span>1</span>
            <button>2</button>
            <button className="next-page">Next</button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
