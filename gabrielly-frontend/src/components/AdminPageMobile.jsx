import React, { useState, useRef } from 'react';
import '../styles/AdminPageMobile.css';
import ProductManagementMobile from './ProductManagementMobile';
import SuppliersManagement from './SuppliersManagement';
import AnalyticsPage from './AnalyticsPage';

function AdminPageMobile() {
  const [activeTab, setActiveTab] = useState('products');
  const [user, setUser] = useState(null);

  // Verificar autenticação
  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagementMobile />;
      case 'suppliers':
        return <SuppliersManagement />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return <ProductManagementMobile />;
    }
  };

  return (
    <div className="admin-mobile-container">
      {/* Header */}
      <header className="admin-mobile-header">
        <h1>📦 Gabrielly Semijoias</h1>
        <button onClick={handleLogout} className="logout-btn">
          Sair
        </button>
      </header>

      {/* Content */}
      <main className="admin-mobile-content">
        {renderContent()}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="admin-bottom-nav">
        <button
          onClick={() => setActiveTab('products')}
          className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
          title="Produtos"
        >
          📷 Produtos
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`nav-item ${activeTab === 'suppliers' ? 'active' : ''}`}
          title="Fornecedores"
        >
          🏭 Fornecedores
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          title="Relatórios"
        >
          📊 Relatórios
        </button>
      </nav>
    </div>
  );
}

export default AdminPageMobile;
