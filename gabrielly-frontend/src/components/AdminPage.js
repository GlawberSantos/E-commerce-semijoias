import React, { useState } from 'react';
import '../styles/AdminPage.css';

function AdminPage() {
    const [product, setProduct] = useState({
        name: '',
        price: '',
        installments: '',
        description: {
            comprimento: '',
            material: '',
            pedras: '',
            sugestao: '',
            observacao: ''
        },
        images: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prevProduct => ({
            ...prevProduct,
            [name]: value
        }));
    };

    const handleDescriptionChange = (e) => {
        const { name, value } = e.target;
        setProduct(prevProduct => ({
            ...prevProduct,
            description: {
                ...prevProduct.description,
                [name]: value
            }
        }));
    };

    const handleImageChange = (e) => {
        setProduct(prevProduct => ({
            ...prevProduct,
            images: [...e.target.files]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica para enviar os dados do produto para o backend
        console.log(product);
    };

    return (
        <div className="admin-page-container">
            <h1>Adicionar Novo Produto</h1>
            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                    <label htmlFor="name">Nome do Produto</label>
                    <input type="text" id="name" name="name" value={product.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Preço</label>
                    <input type="number" id="price" name="price" value={product.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="installments">Parcelas sem juros</label>
                    <input type="number" id="installments" name="installments" value={product.installments} onChange={handleChange} required />
                </div>

                <h2>Descrição</h2>
                <div className="form-group">
                    <label htmlFor="comprimento">Comprimento (20 ou 30cm)</label>
                    <input type="text" id="comprimento" name="comprimento" value={product.description.comprimento} onChange={handleDescriptionChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="material">Material</label>
                    <input type="text" id="material" name="material" value={product.description.material} onChange={handleDescriptionChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="pedras">Pedras (sim/não)</label>
                    <input type="text" id="pedras" name="pedras" value={product.description.pedras} onChange={handleDescriptionChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="sugestao">Sugestão</label>
                    <input type="text" id="sugestao" name="sugestao" value={product.description.sugestao} onChange={handleDescriptionChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="observacao">Observação</label>
                    <textarea id="observacao" name="observacao" value={product.description.observacao} onChange={handleDescriptionChange}></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="images">Imagens (4 arquivos)</label>
                    <input type="file" id="images" name="images" onChange={handleImageChange} multiple required />
                </div>

                <button type="submit" className="submit-button">Adicionar Produto</button>
            </form>
        </div>
    );
}

export default AdminPage;