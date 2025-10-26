import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
import CartPage from './components/CartPage';
import AboutUsPage from './components/AboutUsPage';
import CheckoutPage from './components/CheckoutPage';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import SuccessPage from './components/SuccessPage';
import AccountPage from './components/AccountPage';
import OrdersPage from './components/OrdersPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quem-somos" element={<AboutUsPage />} />
            <Route path="/catalogo" element={<ProductsPage />} />
            <Route path="/catalogo/:category" element={<ProductsPage />} />
            <Route path="/carrinho" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} /> 
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/minha-conta" element={<AccountPage />} />
            <Route path="/meus-pedidos" element={<OrdersPage />} />
          </Routes>
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;