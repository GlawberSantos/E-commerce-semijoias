import React, { useState, useRef, useEffect } from 'react';
import '../styles/ProductManagementMobile.css';

function ProductManagementMobile() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    price_discount: '',
    category: 'aneis',
    material: '',
    color: '',
    style: '',
    occasion: '',
    stock: '',
    description: '',
    supplier_id: '',
    supplier_sku: '',
    cost_price: '',
  });

  // Carregar produtos
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Abrir câmera do celular
  const openCamera = () => {
    cameraInputRef.current.click();
  };

  // Abrir galeria do celular
  const openGallery = () => {
    fileInputRef.current.click();
  };

  // Processar imagens selecionadas
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, {
          data: event.target.result,
          file: file,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remover imagem
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        price_discount: formData.price_discount ? parseFloat(formData.price_discount) : null,
        stock: parseInt(formData.stock),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      };

      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Upload de imagens
        if (images.length > 0 && !editingProduct) {
          const formDataImg = new FormData();
          images.forEach(img => {
            formDataImg.append('images', img.file);
          });
          
          const productId = editingProduct?.id || (await response.json()).id;
          await fetch(`/api/products/${productId}/images`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formDataImg
          });
        }

        alert(editingProduct ? 'Produto atualizado!' : 'Produto criado!');
        setShowForm(false);
        setEditingProduct(null);
        setFormData({
          name: '', price: '', price_discount: '', category: 'aneis',
          material: '', color: '', style: '', occasion: '', stock: '',
          description: '', supplier_id: '', supplier_sku: '', cost_price: ''
        });
        setImages([]);
        fetchProducts();
      }
    } catch (error) {
      alert('Erro ao salvar produto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Editar produto
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      price_discount: product.price_discount || '',
      category: product.category,
      material: product.material || '',
      color: product.color || '',
      style: product.style || '',
      occasion: product.occasion || '',
      stock: product.stock,
      description: product.description || '',
      supplier_id: product.supplier_id || '',
      supplier_sku: product.supplier_sku || '',
      cost_price: product.cost_price || '',
    });
    setShowForm(true);
  };

  // Deletar produto
  const handleDelete = async (productId) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        alert('Produto deletado!');
        fetchProducts();
      }
    } catch (error) {
      alert('Erro ao deletar: ' + error.message);
    }
  };

  return (
    <div className="product-management-mobile">
      {/* Botão flutuante para adicionar produto */}
      {!showForm && (
        <button 
          className="fab-button"
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
            setFormData({
              name: '', price: '', price_discount: '', category: 'aneis',
              material: '', color: '', style: '', occasion: '', stock: '',
              description: '', supplier_id: '', supplier_sku: '', cost_price: ''
            });
            setImages([]);
          }}
        >
          ➕
        </button>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="product-form-container">
          <div className="form-header">
            <h2>{editingProduct ? '✏️ Editar Produto' : '📸 Novo Produto'}</h2>
            <button 
              className="close-btn"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="product-form">
            {/* Fotos */}
            <div className="form-section">
              <h3>📷 Fotos do Produto</h3>
              
              <div className="image-buttons">
                <button 
                  type="button"
                  className="img-btn camera-btn"
                  onClick={openCamera}
                >
                  📸 Câmera
                </button>
                <button 
                  type="button"
                  className="img-btn gallery-btn"
                  onClick={openGallery}
                >
                  🖼️ Galeria
                </button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                hidden
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                hidden
              />

              {/* Preview das imagens */}
              {images.length > 0 && (
                <div className="image-preview">
                  {images.map((img, idx) => (
                    <div key={idx} className="preview-item">
                      <img src={img.data} alt="preview" />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="remove-img-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informações Básicas */}
            <div className="form-section">
              <h3>📝 Informações Básicas</h3>
              
              <input
                type="text"
                placeholder="Nome do Produto"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />

              <textarea
                placeholder="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
              />

              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="aneis">Anéis</option>
                <option value="brincos">Brincos</option>
                <option value="colares">Colares</option>
                <option value="pulseiras">Pulseiras</option>
                <option value="conjuntos">Conjuntos</option>
              </select>
            </div>

            {/* Preços */}
            <div className="form-section">
              <h3>💰 Preços</h3>
              
              <input
                type="number"
                placeholder="Preço de Venda (R$)"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />

              <input
                type="number"
                placeholder="Preço com Desconto (R$) - Opcional"
                step="0.01"
                value={formData.price_discount}
                onChange={(e) => setFormData({...formData, price_discount: e.target.value})}
              />

              <input
                type="number"
                placeholder="Preço de Custo (R$) - Para Relatórios"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
              />

              {formData.price && formData.cost_price && (
                <div className="margin-info">
                  💹 Margem: {(((formData.price - formData.cost_price) / formData.price) * 100).toFixed(1)}%
                </div>
              )}
            </div>

            {/* Características */}
            <div className="form-section">
              <h3>✨ Características</h3>
              
              <input
                type="text"
                placeholder="Material (ex: Ouro 18k, Prata 925)"
                value={formData.material}
                onChange={(e) => setFormData({...formData, material: e.target.value})}
              />

              <input
                type="text"
                placeholder="Cor"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
              />

              <input
                type="text"
                placeholder="Estilo"
                value={formData.style}
                onChange={(e) => setFormData({...formData, style: e.target.value})}
              />

              <input
                type="text"
                placeholder="Ocasião"
                value={formData.occasion}
                onChange={(e) => setFormData({...formData, occasion: e.target.value})}
              />
            </div>

            {/* Estoque e Fornecedor */}
            <div className="form-section">
              <h3>📦 Estoque e Fornecedor</h3>
              
              <input
                type="number"
                placeholder="Quantidade em Estoque"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                required
              />

              <input
                type="text"
                placeholder="ID do Fornecedor (opcional)"
                value={formData.supplier_id}
                onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
              />

              <input
                type="text"
                placeholder="SKU do Fornecedor (código do fornecedor)"
                value={formData.supplier_sku}
                onChange={(e) => setFormData({...formData, supplier_sku: e.target.value})}
              />
            </div>

            {/* Botões de Ação */}
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

      {/* Lista de Produtos */}
      {!showForm && (
        <div className="products-list">
          <h2>📦 Produtos ({products.length})</h2>
          
          {loading ? (
            <p className="loading">⏳ Carregando...</p>
          ) : products.length === 0 ? (
            <p className="empty">Nenhum produto ainda. Adicione um! ➕</p>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img 
                      src={product.image || '📦'} 
                      alt={product.name}
                      onError={(e) => e.target.src = '📦'}
                    />
                  </div>
                  
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="category">
                      {product.category === 'aneis' && '💍'}
                      {product.category === 'brincos' && '💎'}
                      {product.category === 'colares' && '📿'}
                      {product.category === 'pulseiras' && '⌚'}
                      {product.category === 'conjuntos' && '✨'} 
                      {product.category}
                    </p>
                    
                    <div className="price-info">
                      <span className="price">R$ {parseFloat(product.price).toFixed(2)}</span>
                      {product.price_discount && (
                        <span className="discount">
                          R$ {parseFloat(product.price_discount).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="stock-info">
                      <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                        {product.stock > 0 ? `✅ ${product.stock} em estoque` : '❌ Fora de estoque'}
                      </span>
                    </div>
                  </div>

                  <div className="product-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(product)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(product.id)}
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

export default ProductManagementMobile;
