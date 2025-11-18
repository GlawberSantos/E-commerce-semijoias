import React, { useState, useEffect } from 'react';
import { productsAPI } from '../api';
import EditProductModal from './EditProductModal';
import '../styles/AdminPage.css'; // I'll reuse the same CSS for now

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState({
        name: '',
        price: '',
        total_installments: 10, // Assumindo 10 parcelas totais fixas
        max_installments_no_interest: 0, // Novo campo para parcelas sem juros
        description: {
            comprimento: '',
            material: '',
            pedras: '',
            sugestao: '',
            observacao: ''
        },
        images: []
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productsAPI.getAll();
                setProducts(data);
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
            }
        };

        fetchProducts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prevProduct => ({
            ...prevProduct,
            [name]: name === 'price' || name === 'max_installments_no_interest' ? parseFloat(value) : value
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('price', product.price);
        formData.append('total_installments', product.total_installments);
        formData.append('max_installments_no_interest', product.max_installments_no_interest);
        formData.append('description', JSON.stringify(product.description));
        
        for (let i = 0; i < product.images.length; i++) {
            formData.append('images', product.images[i]);
        }

        try {
            const newProduct = await productsAPI.create(formData);
            setProducts([...products, newProduct]);
            setProduct({
                name: '',
                price: '',
                total_installments: 10,
                max_installments_no_interest: 0,
                description: {
                    comprimento: '',
                    material: '',
                    pedras: '',
                    sugestao: '',
                    observacao: ''
                },
                images: []
            });
        } catch (error) {
            console.error("Erro ao adicionar o produto:", error);
        }
    };

    const handleEditClick = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
    };

    const handleSaveProduct = async (updatedProduct) => {
        try {
            await productsAPI.update(updatedProduct.id, updatedProduct);
            setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            handleCloseModal();
        } catch (error) {
            console.error("Erro ao salvar o produto:", error);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm("Tem certeza que deseja excluir este produto?")) {
            try {
                await productsAPI.delete(productId);
                setProducts(products.filter(p => p.id !== productId));
            } catch (error) {
                console.error("Erro ao excluir o produto:", error);
            }
        }
    };

    return (
        <div>
            <h1>Gerenciar Produtos</h1>

            <div className="product-list">
                <h2>Produtos Existentes</h2>
                {products.map(p => (
                    <div key={p.id} className="product-item">
                        <span>{p.name} - R$ {p.price}</span>
                        <div>
                            <button onClick={() => handleEditClick(p)}>Editar</button>
                            <button onClick={() => handleDelete(p.id)}>Excluir</button>
                        </div>
                    </div>
                ))}
            </div>

            {isEditModalOpen && (
                <EditProductModal
                    product={selectedProduct}
                    onClose={handleCloseModal}
                    onSave={handleSaveProduct}
                />
            )}

            <h2>Adicionar Novo Produto</h2>
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
                    <label htmlFor="max_installments_no_interest">Parcelas Sem Juros (máx. 10)</label>
                    <input type="number" id="max_installments_no_interest" name="max_installments_no_interest" value={product.max_installments_no_interest} onChange={handleChange} min="0" max="10" />
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

export default ProductManagement;