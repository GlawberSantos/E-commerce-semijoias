import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '../utils/format';
import '../styles/QuickViewModal.css';
import { useCart } from '../contexts/CartContext';

function QuickViewModal({ product, onClose }) {
    const { addToCart } = useCart();
    const [zoomLevel, setZoomLevel] = useState(1);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef(null);
    const navigate = useNavigate();

    const installmentPrice = product.price / 10.0;

    // Lógica para o efeito de zoom (move a imagem)
    const handleMouseMove = (e) => {
        if (zoomLevel > 1 && imageRef.current) {
            const { left, top, width, height } = imageRef.current.getBoundingClientRect();
            // Calcula a posição do mouse relativa à imagem (de 0 a 1)
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;
            setMousePosition({ x, y });
        }
    };

    // Alterna o zoom (ao clicar)
    const handleZoomToggle = () => {
        setZoomLevel(zoomLevel === 1 ? 2.5 : 1); // Alterna entre zoom normal e 2.5x
    };

    // Estilo que aplica o zoom e o movimento
    const transformStyle = {
        transform: `scale(${zoomLevel}) translate(${-mousePosition.x * 100 * (zoomLevel - 1) / zoomLevel}%, ${-mousePosition.y * 100 * (zoomLevel - 1) / zoomLevel}%)`,
        transformOrigin: `${mousePosition.x * 100}% ${mousePosition.y * 100}%`,
        cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in',
    };

    // Lógica de fechamento ao clicar fora do modal
    const handleBackdropClick = (e) => {
        if (e.target.className === 'modal-backdrop') {
            onClose();
        }
    };

    // Função para adicionar ao carrinho e fechar o modal
    const handleAddToCart = () => {
        addToCart(product);
        onClose(); // Fecha o modal após adicionar
        navigate('/carrinho'); // <--- AQUI ESTÁ O REDIRECIONAMENTO!
    };

    // Caminho da imagem: prioriza a category da URL, senão usa a chave 'folder' do produto
    const imagePath = `/products/${product.folder}/${product.image}`;


    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
                <button className="close-button" onClick={onClose} aria-label="Fechar visualização rápida">
                    &times;
                </button>

                <div className="modal-body">
                    {/* Imagem do Produto com Efeito Zoom */}
                    <div
                        className="modal-image-container"
                        onMouseMove={handleMouseMove}
                        onClick={handleZoomToggle}
                        onMouseLeave={() => setZoomLevel(1)} // Reseta o zoom ao sair
                    >
                        <img
                            ref={imageRef}
                            src={imagePath}
                            alt={product.name}
                            style={transformStyle}
                            className="zoomable-image"
                        />
                    </div>

                    {/* Detalhes do Produto */}
                    <div className="modal-details">
                        <h2 id="quick-view-title">{product.name}</h2>

                        <div className="price-info">
                            {/* Preço Total (Principal) */}
                            <p className="price-total">{formatCurrency(product.price)}</p>
                            {/* Condição de Parcelamento */}
                            <p className="price-installments">10x sem juros de {formatCurrency(installmentPrice)}</p>
                        </div>

                        <div className="action-area">
                            <button
                                className="btn-add-to-cart-modal"
                                aria-label={`Adicionar ${product.name} ao carrinho`}
                                onClick={handleAddToCart} // Adiciona ao carrinho e fecha
                            >
                                Adicionar ao Carrinho
                            </button>
                            {/* Link para a página completa do produto */}
                            <p className="link-full-details">
                                {/* O link deve ser ajustado para a rota real de detalhes do produto */}
                                <Link to={`/catalogo/${product.folder}/${product.id}`} onClick={onClose}>Ver detalhes completos &rarr;</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuickViewModal;