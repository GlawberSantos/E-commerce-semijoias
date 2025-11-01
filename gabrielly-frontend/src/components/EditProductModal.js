import React, { useState, useEffect } from 'react';
import '../styles/EditProductModal.css';

function EditProductModal({ product, onClose, onSave }) {
    const [editedProduct, setEditedProduct] = useState({
        ...product,
        total_installments: product.total_installments || 10, // Garante que total_installments exista
        max_installments_no_interest: product.max_installments_no_interest || 0 // Garante que max_installments_no_interest exista
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

    const handleSave = () => {
        onSave(editedProduct);
    };

    if (!product) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Editar Produto</h2>
                <form>
                    <div className="form-group">
                        <label>Nome</label>
                        <input type="text" name="name" value={editedProduct.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Preço</label>
                        <input type="number" name="price" value={editedProduct.price} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Parcelas Sem Juros (máx. 10)</label>
                        <input type="number" name="max_installments_no_interest" value={editedProduct.max_installments_no_interest} onChange={handleChange} min="0" max="10" />
                    </div>
                    <h3>Descrição</h3>
                    <div className="form-group">
                        <label>Comprimento</label>
                        <input type="text" name="comprimento" value={editedProduct.description.comprimento} onChange={handleDescriptionChange} />
                    </div>
                    <div className="form-group">
                        <label>Material</label>
                        <input type="text" name="material" value={editedProduct.description.material} onChange={handleDescriptionChange} />
                    </div>
                    <div className="form-group">
                        <label>Pedras</label>
                        <input type="text" name="pedras" value={editedProduct.description.pedras} onChange={handleDescriptionChange} />
                    </div>
                    <div className="form-group">
                        <label>Sugestão</label>
                        <input type="text" name="sugestao" value={editedProduct.description.sugestao} onChange={handleDescriptionChange} />
                    </div>
                    <div className="form-group">
                        <label>Observação</label>
                        <textarea name="observacao" value={editedProduct.description.observacao} onChange={handleDescriptionChange}></textarea>
                    </div>
                </form>
                <div className="modal-actions">
                    <button onClick={handleSave}>Salvar</button>
                    <button onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}

export default EditProductModal;
