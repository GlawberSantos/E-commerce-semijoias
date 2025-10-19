// src/contexts/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

// Chave para armazenar o carrinho no localStorage
const LOCAL_STORAGE_KEY = 'gabrielly_cart';

export const CartProvider = ({ children }) => {
    // 1. Inicializa o estado lendo do localStorage, se houver dados
    const [cartItems, setCartItems] = useState(() => {
        try {
            const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error("Erro ao ler o carrinho do localStorage:", error);
            return []; // Retorna um array vazio em caso de erro
        }
    });

    // 2. Salva o carrinho no localStorage sempre que cartItems mudar
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
            console.error("Erro ao salvar o carrinho no localStorage:", error);
        }
    }, [cartItems]);

    // FUNÇÃO PARA ADICIONAR ITEM (com verificação de estoque)
    const addToCart = (product) => {
        setCartItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.id === product.id);
            const maxStock = product.stock || 50; // Usa o stock do produto ou 50 por padrão

            if (existingItem) {
                if (existingItem.quantity >= maxStock) {
                    alert(`Estoque máximo atingido! Apenas ${maxStock} unidades disponíveis.`);
                    return currentItems;
                }
                return currentItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...currentItems, { ...product, quantity: 1 }];
            }
        });
    };

    // FUNÇÃO PARA AUMENTAR QUANTIDADE (com verificação de estoque)
    const increaseQuantity = (productId) => {
        setCartItems((currentItems) =>
            currentItems.map((item) => {
                const maxStock = item.stock || 50;
                if (item.id === productId) {
                    if (item.quantity >= maxStock) {
                        alert(`Estoque máximo atingido! Apenas ${maxStock} unidades disponíveis.`);
                        return item;
                    }
                    return { ...item, quantity: item.quantity + 1 };
                }
                return item;
            })
        );
    };

    // FUNÇÃO PARA DIMINUIR QUANTIDADE
    const decreaseQuantity = (productId) => {
        setCartItems((currentItems) =>
            currentItems
                .map((item) => {
                    if (item.id === productId) {
                        return { ...item, quantity: item.quantity - 1 };
                    }
                    return item;
                })
                .filter((item) => item.quantity > 0)
        );
    };

    // FUNÇÃO PARA REMOVER ITEM
    const removeFromCart = (productId) => {
        setCartItems((currentItems) => currentItems.filter((item) => item.id !== productId));
    };

    // Função para obter quantidade em outros componentes
    const getItemQuantityInCart = (productId) => {
        const item = cartItems.find((i) => i.id === productId);
        return item ? item.quantity : 0;
    };

    // Calcula o total de itens no carrinho
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    // NOVO: Adicionei a função para limpar o carrinho (útil após o checkout)
    const clearCart = () => {
        setCartItems([]);
    };

    const cartContextValue = {
        cartItems,
        totalItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        getItemQuantityInCart,
        clearCart, // Adicionado ao valor do Contexto
    };

    return (
        <CartContext.Provider value={cartContextValue}>
            {children}
        </CartContext.Provider>
    );
};

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart deve ser usado dentro de um CartProvider");
    }
    return context;
}