import React, { useState, useEffect } from 'react';
import '../styles/SuppliersManagement.css';

function SuppliersManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    brand_name: '',
    company_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    payment_terms: '',
    default_margin: '',
    notes: '',
    status: 'active'
  });

  // Carregar fornecedores
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/suppliers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      alert('Erro ao carregar fornecedores: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const payload = {
        ...formData,
        default_margin: formData.default_margin ? parseFloat(formData.default_margin) : null
      };

      const url = editingSupplier 
        ? `/api/suppliers/${editingSupplier.id}`
        : '/api/suppliers';
      
      const method = editingSupplier ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingSupplier ? 'Fornecedor atualizado!' : 'Fornecedor criado!');
        setShowForm(false);
        setEditingSupplier(null);
        resetForm();
        fetchSuppliers();
      } else {
        alert('Erro ao salvar fornecedor');
      }
    } catch (error) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      brand_name: '',
      company_name: '',
      contact_email: '',
      contact_phone: '',
      website: '',
      address: '',
      city: '',
      state: '',
      payment_terms: '',
      default_margin: '',
      notes: '',
      status: 'active'
    });
  };

  // Editar fornecedor
  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      brand_name: supplier.brand_name || '',
      company_name: supplier.company_name || '',
      contact_email: supplier.contact_email || '',
      contact_phone: supplier.contact_phone || '',
      website: supplier.website || '',
      address: supplier.address || '',
      city: supplier.city || '',
      state: supplier.state || '',
      payment_terms: supplier.payment_terms || '',
      default_margin: supplier.default_margin || '',
      notes: supplier.notes || '',
      status: supplier.status || 'active'
    });
    setShowForm(true);
  };

  // Deletar fornecedor
  const handleDelete = async (supplierId) => {
    if (!window.confirm('Tem certeza que deseja deletar este fornecedor? Produtos vinculados não serão removidos.')) return;

    try {
      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        alert('Fornecedor deletado!');
        fetchSuppliers();
      }
    } catch (error) {
      alert('Erro ao deletar: ' + error.message);
    }
  };

  // Filtrar fornecedores
  const filteredSuppliers = filter === 'all' 
    ? suppliers 
    : suppliers.filter(s => s.status === filter);

  return (
    <div className="suppliers-management">
      {/* Botão flutuante */}
      {!showForm && (
        <button 
          className="fab-button"
          onClick={() => {
            setShowForm(true);
            setEditingSupplier(null);
            resetForm();
          }}
        >
          ➕
        </button>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="supplier-form-container">
          <div className="form-header">
            <h2>{editingSupplier ? '✏️ Editar Fornecedor' : '🏭 Novo Fornecedor'}</h2>
            <button 
              className="close-btn"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="supplier-form">
            {/* Informações Básicas */}
            <div className="form-section">
              <h3>📋 Informações Básicas</h3>
              
              <input
                type="text"
                placeholder="Nome da Marca"
                value={formData.brand_name}
                onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                required
              />

              <input
                type="text"
                placeholder="Empresa / Razão Social"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              />

              <input
                type="email"
                placeholder="Email de Contato"
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
              />

              <input
                type="tel"
                placeholder="Telefone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
              />

              <input
                type="url"
                placeholder="Website"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
              />
            </div>

            {/* Endereço */}
            <div className="form-section">
              <h3>📍 Localização</h3>
              
              <textarea
                placeholder="Endereço"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows="2"
              />

              <div className="row">
                <input
                  type="text"
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Estado"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
              </div>
            </div>

            {/* Termos Comerciais */}
            <div className="form-section">
              <h3>💼 Termos Comerciais</h3>
              
              <textarea
                placeholder="Condições de Pagamento (ex: À vista, 30 dias, 10+30)"
                value={formData.payment_terms}
                onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                rows="2"
              />

              <input
                type="number"
                placeholder="Margem Padrão (%)"
                step="0.01"
                value={formData.default_margin}
                onChange={(e) => setFormData({...formData, default_margin: e.target.value})}
              />

              <textarea
                placeholder="Observações (acordo especial, desconto em volume, etc)"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="3"
              />
            </div>

            {/* Status */}
            <div className="form-section">
              <h3>⚙️ Status</h3>
              
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">✅ Ativo</option>
                <option value="inactive">⏸️ Inativo</option>
                <option value="blocked">🚫 Bloqueado</option>
              </select>
            </div>

            {/* Botões */}
            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? '⏳ Salvando...' : '✅ Salvar'}
              </button>
              <button 
                type="button"
                className="btn-cancel"
                onClick={() => setShowForm(false)}
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Fornecedores */}
      {!showForm && (
        <div className="suppliers-list">
          <h2>🏭 Fornecedores ({suppliers.length})</h2>

          {/* Filtro */}
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todos ({suppliers.length})
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Ativos ({suppliers.filter(s => s.status === 'active').length})
            </button>
            <button
              className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilter('inactive')}
            >
              Inativos ({suppliers.filter(s => s.status === 'inactive').length})
            </button>
          </div>

          {loading ? (
            <p className="loading">⏳ Carregando...</p>
          ) : filteredSuppliers.length === 0 ? (
            <p className="empty">Nenhum fornecedor {filter !== 'all' ? 'nesta categoria' : ''}. Adicione um! ➕</p>
          ) : (
            <div className="suppliers-grid">
              {filteredSuppliers.map(supplier => (
                <div key={supplier.id} className="supplier-card">
                  <div className="supplier-header">
                    <h4>{supplier.brand_name}</h4>
                    <span className={`status-badge status-${supplier.status}`}>
                      {supplier.status === 'active' ? '✅' : supplier.status === 'inactive' ? '⏸️' : '🚫'}
                    </span>
                  </div>

                  <div className="supplier-body">
                    {supplier.company_name && (
                      <p className="company">
                        <strong>Empresa:</strong> {supplier.company_name}
                      </p>
                    )}

                    {supplier.contact_email && (
                      <p className="contact">
                        <strong>Email:</strong> <a href={`mailto:${supplier.contact_email}`}>{supplier.contact_email}</a>
                      </p>
                    )}

                    {supplier.contact_phone && (
                      <p className="contact">
                        <strong>Telefone:</strong> <a href={`tel:${supplier.contact_phone}`}>{supplier.contact_phone}</a>
                      </p>
                    )}

                    {supplier.website && (
                      <p className="contact">
                        <strong>Website:</strong> <a href={supplier.website} target="_blank" rel="noopener noreferrer">Visitar</a>
                      </p>
                    )}

                    {supplier.city && (
                      <p className="location">
                        📍 {supplier.city}, {supplier.state}
                      </p>
                    )}

                    {supplier.default_margin && (
                      <div className="margin-badge">
                        💹 Margem: {supplier.default_margin}%
                      </div>
                    )}

                    {supplier.payment_terms && (
                      <p className="terms">
                        <strong>Pagamento:</strong> {supplier.payment_terms}
                      </p>
                    )}

                    {supplier.notes && (
                      <p className="notes">
                        <strong>Notas:</strong> {supplier.notes}
                      </p>
                    )}
                  </div>

                  <div className="supplier-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(supplier)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(supplier.id)}
                      title="Deletar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SuppliersManagement;
