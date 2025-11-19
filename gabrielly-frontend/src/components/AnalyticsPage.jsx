import React, { useState, useEffect } from 'react';
import '../styles/AnalyticsPage.css';

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">⏳ Carregando dados...</div>;
  }

  if (!analytics) {
    return <div className="analytics-empty">Dados não disponíveis</div>;
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>📊 Análise de Vendas</h1>
        
        <div className="period-selector">
          <button 
            className={`period-btn ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            Semana
          </button>
          <button 
            className={`period-btn ${period === 'month' ? 'active' : ''}`}
            onClick={() => setPeriod('month')}
          >
            Mês
          </button>
          <button 
            className={`period-btn ${period === 'year' ? 'active' : ''}`}
            onClick={() => setPeriod('year')}
          >
            Ano
          </button>
        </div>
      </div>

      {/* KPIs principais */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <p className="kpi-label">Receita Total</p>
            <p className="kpi-value">R$ {parseFloat(analytics.total_revenue).toFixed(2)}</p>
            <p className="kpi-change">
              {analytics.revenue_change >= 0 ? '📈' : '📉'} {Math.abs(analytics.revenue_change).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🛍️</div>
          <div className="kpi-content">
            <p className="kpi-label">Total de Vendas</p>
            <p className="kpi-value">{analytics.total_orders}</p>
            <p className="kpi-change">
              {analytics.orders_change >= 0 ? '📈' : '📉'} {Math.abs(analytics.orders_change).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">💹</div>
          <div className="kpi-content">
            <p className="kpi-label">Lucro Líquido</p>
            <p className="kpi-value">R$ {parseFloat(analytics.net_profit).toFixed(2)}</p>
            <p className="kpi-percentage">{((analytics.net_profit / analytics.total_revenue) * 100).toFixed(1)}% de margem</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <p className="kpi-label">Ticket Médio</p>
            <p className="kpi-value">R$ {parseFloat(analytics.average_ticket).toFixed(2)}</p>
            <p className="kpi-secondary">{analytics.total_orders} vendas</p>
          </div>
        </div>
      </div>

      {/* Análise de Produtos Próprios vs Fornecedores */}
      <div className="analytics-section">
        <h2>📦 Análise de Origem</h2>
        
        <div className="comparison-grid">
          <div className="comparison-card own">
            <h3>🏪 Produtos Próprios</h3>
            <div className="comparison-content">
              <div className="metric">
                <span className="label">Vendas</span>
                <span className="value">{analytics.own_products_orders}</span>
              </div>
              <div className="metric">
                <span className="label">Receita</span>
                <span className="value">R$ {parseFloat(analytics.own_products_revenue).toFixed(2)}</span>
              </div>
              <div className="metric">
                <span className="label">Custo Total</span>
                <span className="value">R$ {parseFloat(analytics.own_products_cost).toFixed(2)}</span>
              </div>
              <div className="metric highlight">
                <span className="label">Lucro</span>
                <span className="value">R$ {(analytics.own_products_revenue - analytics.own_products_cost).toFixed(2)}</span>
              </div>
              <div className="metric">
                <span className="label">Margem</span>
                <span className="value">{(((analytics.own_products_revenue - analytics.own_products_cost) / analytics.own_products_revenue) * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="label">Percentual</span>
                <span className="value">{((analytics.own_products_orders / analytics.total_orders) * 100).toFixed(1)}% do total</span>
              </div>
            </div>
          </div>

          <div className="comparison-card suppliers">
            <h3>🏭 Produtos Fornecedores</h3>
            <div className="comparison-content">
              <div className="metric">
                <span className="label">Vendas</span>
                <span className="value">{analytics.supplier_products_orders}</span>
              </div>
              <div className="metric">
                <span className="label">Receita</span>
                <span className="value">R$ {parseFloat(analytics.supplier_products_revenue).toFixed(2)}</span>
              </div>
              <div className="metric">
                <span className="label">Custo Total</span>
                <span className="value">R$ {parseFloat(analytics.supplier_products_cost).toFixed(2)}</span>
              </div>
              <div className="metric highlight">
                <span className="label">Lucro</span>
                <span className="value">R$ {(analytics.supplier_products_revenue - analytics.supplier_products_cost).toFixed(2)}</span>
              </div>
              <div className="metric">
                <span className="label">Margem</span>
                <span className="value">{(((analytics.supplier_products_revenue - analytics.supplier_products_cost) / analytics.supplier_products_revenue) * 100).toFixed(1)}%</span>
              </div>
              <div className="metric">
                <span className="label">Percentual</span>
                <span className="value">{((analytics.supplier_products_orders / analytics.total_orders) * 100).toFixed(1)}% do total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Produtos */}
      <div className="analytics-section">
        <h2>⭐ Produtos Mais Vendidos</h2>
        
        <div className="top-products">
          {analytics.top_products && analytics.top_products.length > 0 ? (
            analytics.top_products.slice(0, 10).map((product, idx) => (
              <div key={idx} className="top-product-item">
                <div className="rank">#{idx + 1}</div>
                <div className="product-name">{product.name}</div>
                <div className="product-stats">
                  <span className="sales">{product.sales} vendas</span>
                  <span className="revenue">R$ {parseFloat(product.revenue).toFixed(2)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="empty">Nenhum dado disponível</p>
          )}
        </div>
      </div>

      {/* Categorias */}
      <div className="analytics-section">
        <h2>📂 Vendas por Categoria</h2>
        
        <div className="categories-grid">
          {analytics.by_category && Object.entries(analytics.by_category).map(([category, data]) => (
            <div key={category} className="category-card">
              <h4>
                {category === 'aneis' && '💍'}
                {category === 'brincos' && '💎'}
                {category === 'colares' && '📿'}
                {category === 'pulseiras' && '⌚'}
                {category === 'conjuntos' && '✨'} 
                {category}
              </h4>
              <div className="category-stats">
                <div className="stat">
                  <span className="stat-label">Vendas</span>
                  <span className="stat-value">{data.orders}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Receita</span>
                  <span className="stat-value">R$ {parseFloat(data.revenue).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estoque Crítico */}
      <div className="analytics-section">
        <h2>⚠️ Produtos com Estoque Baixo</h2>
        
        <div className="low-stock-list">
          {analytics.low_stock && analytics.low_stock.length > 0 ? (
            analytics.low_stock.map((product) => (
              <div key={product.id} className="low-stock-item">
                <div className="product-info">
                  <p className="product-name">{product.name}</p>
                  <p className="stock-level">
                    <span className="stock-badge">Estoque: {product.stock}</span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="empty">✅ Todos os produtos com estoque adequado!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
