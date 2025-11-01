import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productsAPI } from '../api';
import '../styles/ProductDetailsPage.css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      console.log('Fetching product with ID:', id);
      try {
        setLoading(true);
        const data = await productsAPI.getById(id);
        console.log('Product API response:', data);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="loading"><p>Carregando detalhes do produto...</p></div>;
  if (error) return <div className="error-container"><p>Erro ao carregar o produto: {error}</p></div>;
  if (!product) return <div className="error-container"><p>Produto não encontrado.</p></div>;

  return (
    <div className="product-details-page">
      <div className="product-details-content">
        <div className="product-details-images">
          <img src={`/products/${product.category}/${product.image}`} alt={product.name} />
        </div>
        <div className="product-details-info">
          <h1>{product.name}</h1>
          <div className="product-description">
            <h2>O que você precisa saber sobre este produto</h2>
            <ul>
              <li>Unidades por kit: 1.</li>
              <li>Acabamento: Camadas de Ouro.</li>
              <li>Diâmetro: 1.5 cm.</li>
              <li>Tipo de pedra: Zircônia.</li>
              <li>Altura: 1.5 cm.</li>
              <li>Comprimento: 50 cm.</li>
              <li>Material banhado a ouro 18k para durabilidade e beleza.</li>
              <li>Pingente de borboleta elegante e detalhada.</li>
              <li>Pedras de zircônias cravejadas para brilho extra.</li>
              <li>Corrente de 45 cm com extensor de 5 cm para ajuste perfeito.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
