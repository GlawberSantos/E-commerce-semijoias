import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../api';
import '../styles/SearchBar.css';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 2) {
            setIsLoading(true);
            try {
                const response = await productsAPI.searchProducts(value);
                setSuggestions(response.slice(0, 5));
            } catch (error) {
                console.error('Erro ao buscar sugestões:', error);
                setSuggestions([]);
            }
            setIsLoading(false);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (product) => {
        navigate(`/catalogo/${product.category}`, {
            state: { searchTerm: product.name }
        });
        setSearchTerm('');
        setSuggestions([]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/catalogo`, {
                state: { searchTerm: searchTerm.trim() }
            });
            setSearchTerm('');
            setSuggestions([]);
        }
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className="search-form">
                <input
                    type="search"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                    aria-label="Buscar produtos"
                />
                <button type="submit" className="search-button" aria-label="Buscar">
                    <i className="fas fa-search"></i>
                </button>
            </form>

            {suggestions.length > 0 && (
                <div className="suggestions-container">
                    {suggestions.map((product) => (
                        <div
                            key={product.id}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(product)}
                        >
                            <img 
                                src={`/products/${product.category}/${product.image}`} 
                                alt={product.name}
                                className="suggestion-image"
                            />
                            <div className="suggestion-info">
                                <span className="suggestion-name">{product.name}</span>
                                <span className="suggestion-price">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(product.price)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {isLoading && (
                <div className="search-loading">
                    <span>Buscando...</span>
                </div>
            )}
        </div>
    );
};

export default SearchBar;