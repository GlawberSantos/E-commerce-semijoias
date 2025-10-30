/*Ver detalhes completos*/
import React, { useRef, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { formatCurrency } from '../utils/format';
import '../styles/QuickViewModal.css';
import { useCart } from '../contexts/CartContext';

function QuickViewModal({ product, onClose }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef(null);
    const navigate = useNavigate();
    const { category } = useParams();
    const [isHovered, setIsHovered] = useState(false);

    const installmentPrice = product.price / 10.0;

    const handleMouseMove = (e) => {
        if (imageRef.current) {
            const { left, top, width, height } = imageRef.current.getBoundingClientRect();
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;
            setMousePosition({ x, y });
        }
    };

    const handleZoomToggle = (e) => {
        const { left, top, width, height } = imageRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;
        setMousePosition({ x, y });
        setZoomLevel(zoomLevel === 1 ? 2.5 : 1);
    };

    const transformStyle = {
        transform: `scale(${zoomLevel})`,
        transformOrigin: `${mousePosition.x * 100}% ${mousePosition.y * 100}%`,
        cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in',
    };

    const handleBackdropClick = (e) => {
        if (e.target.className === 'modal-backdrop') {
            onClose();
        }
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
        onClose();
        navigate('/carrinho');
    };

    const imageFolder = category || product.folder || product.category;
    
    // Mock images array, assuming product has an 'images' property
    const productImages = product.images || [
        product.image,
        product.image_hover,
        'brinco-argola.webp', // Placeholder, replace with actual image names
        'coracao.webp'      // Placeholder, replace with actual image names
    ];

    const [selectedImage, setSelectedImage] = useState(productImages[0]);

    const imageName = isHovered && product.image_hover ? product.image_hover : selectedImage;
    const imagePath = `/products/${imageFolder}/${imageName}`;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
                <button className="close-button" onClick={onClose} aria-label="Fechar visualização rápida">
                    &times;
                </button>

                <div className="modal-body">
                    <div className="modal-image-section">
                        <div
                            className="modal-image-container"
                            onMouseMove={handleMouseMove}
                            onClick={handleZoomToggle}
                            onMouseLeave={() => {
                                setZoomLevel(1);
                                setIsHovered(false);
                            }}
                            onMouseEnter={() => setIsHovered(true)}
                        >
                            <img
                                ref={imageRef}
                                src={imagePath}
                                alt={product.name}
                                style={transformStyle}
                                className="zoomable-image"
                            />
                        </div>
                        <div className="thumbnail-images">
                            {productImages.map((img, index) => (
                                <img
                                    key={index}
                                    src={`/products/${imageFolder}/${img}`}
                                    alt={`${product.name} - thumbnail ${index + 1}`}
                                    className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(img)}
                                    onMouseEnter={() => setSelectedImage(img)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="modal-details">
                        <h2 id="quick-view-title">{product.name}</h2>

                        <div className="price-info">
                            <p className="price-total">{formatCurrency(product.price)}</p>
                            <p className="price-installments">10x sem juros de {formatCurrency(installmentPrice)}</p>
                        </div>

                        <div class="product-details-static">
                            <p><strong>Comprimento aprox:</strong> 45 cm</p>
                            <p><strong>Material:</strong> ouro amarelo</p>
                            <p><strong>Pedras:</strong> Sem pedra</p>
                            <p><strong>Sugestão:</strong> Unissex</p>
                            <p><strong>Observação:</strong> Todas as medidas são aproximadas e podem variar de acordo com a produção.</p>
                        </div>

                        <div class="quantity-selector-modal">
                            <label>Quantidade:</label>
                            <div class="quantity-controls">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <input type="number" value={quantity} readOnly />
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                            <span class="stock-info">({product.stock} disponíveis)</span>
                        </div>

                        <div class="shipping-calculator">
                            <label>Calcular frete e prazo:</label>
                            <div class="shipping-form">
                                <input type="text" placeholder="Digite seu CEP" />
                                <button>Calcular</button>
                            </div>
                        </div>

                        <div className="action-area">
                            <button
                                className="btn-add-to-cart-modal"
                                aria-label={`Adicionar ${product.name} ao carrinho`}
                                onClick={handleAddToCart}
                            >
                                Adicionar ao Carrinho
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuickViewModal;