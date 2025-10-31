import React, { useState, useEffect } from 'react';
import '../styles/EditProductModal.css';

function EditProductModal({ product, onClose, onSave }) {
    const [editedProduct, setEditedProduct] = useState(product);

    useEffect(() => {
        setEditedProduct(product);
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProduct(prev => ({ ...prev, [name]: value }));
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
                        <label>Parcelas</label>
                        <input type="number" name="installments" value={editedProduct.installments} onChange={handleChange} />
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
