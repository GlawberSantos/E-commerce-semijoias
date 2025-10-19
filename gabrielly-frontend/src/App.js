import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
import CartPage from './components/CartPage';
import AboutUsPage from './components/AboutUsPage';
import CheckoutPage from './components/CheckoutPage';
import { CartProvider } from './contexts/CartContext';
import SuccessPage from './components/SuccessPage';

function App() {
  return (
    <CartProvider> {/* NOVO: Envolvemos toda a aplicação aqui */}
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quem-somos" element={<AboutUsPage />} />
          <Route path="/catalogo" element={<ProductsPage />} />
          <Route path="/catalogo/:category" element={<ProductsPage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} /> 
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </Layout>
    </CartProvider>
  );
}

export default App;