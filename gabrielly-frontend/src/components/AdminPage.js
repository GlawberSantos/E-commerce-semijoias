import React, { useState } from 'react';
import '../styles/AdminPage.css';
import ProductManagement from './ProductManagement';
import CouponManagement from './CouponManagement';
import ContentManagement from './ContentManagement';

function AdminPage() {
    const [activeTab, setActiveTab] = useState('products');

    const renderContent = () => {
        switch (activeTab) {
            case 'products':
                return <ProductManagement />;
            case 'coupons':
                return <CouponManagement />;
            case 'content':
                return <ContentManagement />;
            default:
                return <ProductManagement />;
        }
    };

    return (
        <div className="admin-page-container">
            <div className="admin-nav">
                <button onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}>
                    Produtos
                </button>
                <button onClick={() => setActiveTab('coupons')} className={activeTab === 'coupons' ? 'active' : ''}>
                    Cupons
                </button>
                <button onClick={() => setActiveTab('content')} className={activeTab === 'content' ? 'active' : ''}>
                    Conteúdo
                </button>
            </div>
            <div className="admin-content">
                {renderContent()}
            </div>
        </div>
    );
}

export default AdminPage;