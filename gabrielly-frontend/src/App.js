import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
import ProductDetailsPage from './components/ProductDetailsPage';
import CheckoutPage from './components/CheckoutPage';
import SuccessPage from './components/SuccessPage';
import AdminPage from './components/AdminPage';
import AccountPage from './components/AccountPage';
import OrdersPage from './components/OrdersPage';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><ProductDetailsPage /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
