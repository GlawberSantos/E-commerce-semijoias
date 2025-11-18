import React, { useState, useEffect } from 'react';
import '../styles/EditProductModal.css';

function EditProductModal({ product, onClose, onSave }) {
    const [editedProduct, setEditedProduct] = useState({
        ...product,
        total_installments: product.total_installments || 10,
        max_installments_no_interest: product.max_installments_no_interest || 0
    });

    useEffect(() => {
        setEditedProduct({
            ...product,
            total_installments: product.total_installments || 10,
            max_installments_no_interest: product.max_installments_no_interest || 0
        });
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProduct(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'max_installments_no_interest' ? parseFloat(value) : value
        }));
    };

    const handleDescriptionChange = (e) => {
        const { name, value } = e.target;
        setEditedProduct(prev => ({
            ...prev,
            description: {
                ...prev.description,
                [name]: value
            }
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(editedProduct);
    };

    if (!product) return null;

    return (
        <div className="modal-overlay edit-product-modal" onClick={(e) => {
            if (e.target.className.includes('modal-overlay')) {
                onClose();
            }
        }}>
            <div className="modal-content">
                <button 
                    className="close-btn" 
                    onClick={onClose}
                    aria-label="Fechar modal"
                >
                    ×
                </button>

                <h2>Editar Produto</h2>
                
                <form onSubmit={handleSave}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nome do Produto</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={editedProduct.name || ''} 
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Preço (R$)</label>
                            <input 
                                type="number" 
                                name="price" 
                                value={editedProduct.price || ''} 
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Estoque</label>
                            <input 
                                type="number" 
                                name="stock" 
                                value={editedProduct.stock || 0} 
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Parcelas Sem Juros (máx. 10)</label>
                            <input 
                                type="number" 
                                name="max_installments_no_interest" 
                                value={editedProduct.max_installments_no_interest || 0} 
                                onChange={handleChange} 
                                min="0" 
                                max="10"
                            />
                        </div>
                    </div>

                    <h3>Detalhes do Produto</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Comprimento Aproximado</label>
                            <input 
                                type="text" 
                                name="comprimento" 
                                value={editedProduct.description?.comprimento || ''} 
                                onChange={handleDescriptionChange}
                                placeholder="Ex: 45 cm"
                            />
                        </div>

                        <div className="form-group">
                            <label>Material</label>
                            <input 
                                type="text" 
                                name="material" 
                                value={editedProduct.description?.material || ''} 
                                onChange={handleDescriptionChange}
                                placeholder="Ex: Ouro 18k"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Pedras</label>
                            <input 
                                type="text" 
                                name="pedras" 
                                value={editedProduct.description?.pedras || ''} 
                                onChange={handleDescriptionChange}
                                placeholder="Ex: Zircônia"
                            />
                        </div>

                        <div className="form-group">
                            <label>Sugestão de Uso</label>
                            <input 
                                type="text" 
                                name="sugestao" 
                                value={editedProduct.description?.sugestao || ''} 
                                onChange={handleDescriptionChange}
                                placeholder="Ex: Unissex"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Observações</label>
                        <textarea 
                            name="observacao" 
                            value={editedProduct.description?.observacao || ''} 
                            onChange={handleDescriptionChange}
                            placeholder="Informações adicionais sobre o produto..."
                            rows="4"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="submit">Salvar Alterações</button>
                        <button type="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProductModal;