# 🎨 ProductsPage CSS Classes Reference

## 📋 Índice Completo de Classes

---

## 🎯 Container Principal

### `.products-page-container`
Container principal flexível que reorganiza em mobile

**Propriedades:**
```css
display: flex;
flex-direction: column-reverse;  /* Filtros abaixo em mobile */
gap: 20px;
width: 100%;
background-color: #f8f9fa;
min-height: 100vh;
```

**Estados:**
- `.products-page-container.blurred` → Blur quando modal aberto

**Breakpoints:**
- Mobile: `column-reverse`, `padding: 12px`
- Tablet+: `row`, `padding: 40px 20px`, `max-width: 1200px`

---

## 📱 Main Content

### `.main-content`
Wrapper do conteúdo principal

**Propriedades:**
```css
flex: 1;
padding: 0;
width: 100%;
```

---

## 📊 Header

### `.products-header`
Cabeçalho com breadcrumb e opções de visualização

**Layout Mobile:**
```css
display: flex;
flex-wrap: wrap;
gap: 12px;
padding: 16px;
background: white;
border-bottom: 1px solid #e3e3e3;
border-radius: 8px;
```

**Layout Tablet+:**
```css
background: transparent;
border: none;
border-bottom: 2px solid #e3e3e3;
```

### `.breadcrumb`
Navegação estruturada (ex: "Home > Brincos > Detalhes")

**Propriedades:**
```css
color: #666;
font-size: 0.85rem;
font-weight: 500;
order: 1;
width: 100%;  /* Mobile: 100% width */
```

### `.view-options`
Select para ordenação e visualização

**Propriedades:**
```css
display: flex;
gap: 8px;
order: 2;
width: 100%;  /* Mobile: full width */
```

**Elemento Select:**
```css
flex: 1;
padding: 10px 12px;
border: 1px solid #ddd;
border-radius: 6px;
font-size: 0.9rem;
cursor: pointer;

/* Hover */
border-color: #d4af37;
box-shadow: 0 2px 8px rgba(212, 175, 55, 0.1);

/* Focus */
outline: none;
border-color: #d4af37;
box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
```

---

## 📦 Grid de Produtos

### `.products-grid`
Grid responsivo de produtos

**Mobile (< 768px):**
```css
display: grid;
grid-template-columns: repeat(2, 1fr);  /* 2 colunas */
gap: 12px;
padding: 0;
```

**Tablet (768px - 1023px):**
```css
grid-template-columns: repeat(3, 1fr);  /* 3 colunas */
gap: 16px;
```

**Desktop (1024px+):**
```css
grid-template-columns: repeat(4, 1fr);  /* 4 colunas */
gap: 20px;
```

---

## 🛍️ Product Card

### `.product-card`
Container do card de produto

**Propriedades Base:**
```css
background: white;
border-radius: 8px;
overflow: hidden;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
display: flex;
flex-direction: column;
height: 100%;
cursor: pointer;
border: 1px solid #f0f0f0;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

**Estado Active (Mobile):**
```css
.product-card:active {
    transform: scale(0.98);  /* Feedback tátil */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: #d4af37;
}
```

**Estado Hover (Desktop):**
```css
.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    border-color: #d4af37;
}
```

### `.product-image-container`
Wrapper da imagem do produto

**Propriedades:**
```css
position: relative;
width: 100%;
height: 160px;        /* Mobile */
overflow: hidden;
background: #f0f0f0;
```

**Breakpoints:**
- Tablet: `height: 200px`
- Desktop: `height: 240px`

### `.product-image`
Tag img do produto

**Propriedades:**
```css
width: 100%;
height: 100%;
object-fit: cover;
transition: transform 0.3s ease;
```

**Hover (Desktop):**
```css
transform: scale(1.05);
```

### `.product-discount`
Badge de desconto (ex: "-20%")

**Propriedades:**
```css
position: absolute;
top: 6px;
right: 6px;
background: #ff6b6b;
color: white;
padding: 2px 6px;
border-radius: 4px;
font-size: 0.65rem;
font-weight: bold;
z-index: 2;
```

### `.product-info`
Container com informações do produto

**Propriedades:**
```css
padding: 12px;
flex: 1;
display: flex;
flex-direction: column;
justify-content: space-between;
```

### `.product-name`
Nome do produto com truncagem

**Propriedades:**
```css
font-size: 0.85rem;  /* Mobile */
font-weight: 600;
color: #333;
margin: 0 0 6px 0;
line-height: 1.3;
min-height: 2.4em;

/* Limita a 2 linhas com ellipsis */
overflow: hidden;
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
```

**Breakpoints:**
- Tablet: `font-size: 0.95rem`
- Desktop: `font-size: 1rem`

### `.product-rating`
Estrelas de avaliação (ex: "⭐⭐⭐⭐⭐")

**Propriedades:**
```css
font-size: 0.75rem;
color: #ffc107;      /* Dourado */
margin: 4px 0;
font-weight: 600;
```

### `.product-price-container`
Container dos preços (atual + antigo)

**Propriedades:**
```css
display: flex;
align-items: baseline;
gap: 6px;
margin: 6px 0;
```

### `.product-price`
Preço atual em destaque

**Propriedades:**
```css
font-size: 1rem;      /* Mobile */
font-weight: 700;
color: #d4af37;       /* Dourado */
```

**Breakpoints:**
- Desktop: `font-size: 1.1rem`

### `.product-price-old`
Preço antigo riscado

**Propriedades:**
```css
font-size: 0.7rem;
color: #999;
text-decoration: line-through;
```

### `.product-stock`
Indicador de disponibilidade

**Propriedades:**
```css
font-size: 0.75rem;
color: #27ae60;       /* Verde */
margin: 4px 0;
font-weight: 500;
```

---

## 🎨 Botões de Ação

### `.product-actions`
Container com botões de ação

**Propriedades:**
```css
display: flex;
gap: 8px;
margin-top: 8px;
```

### `.btn-add-cart`
Botão "Adicionar ao Carrinho"

**Propriedades:**
```css
flex: 1;
padding: 8px 10px;    /* 44px+ de altura com padding */
background: #d4af37;
color: white;
border: none;
border-radius: 6px;
font-size: 0.8rem;
font-weight: 600;
cursor: pointer;
text-transform: uppercase;
transition: all 0.3s ease;
```

**Estado Active:**
```css
background: #b8941f;
transform: scale(0.95);
```

**Estados Hover (Desktop):**
```css
/* Adicione conforme necessário */
```

### `.btn-quick-view`
Botão para abrir preview rápido

**Propriedades:**
```css
padding: 8px 10px;
background: white;
border: 1px solid #d4af37;
border-radius: 6px;
cursor: pointer;
font-size: 1rem;
color: #d4af37;
transition: all 0.3s ease;
```

**Estado Active:**
```css
background: #d4af37;
color: white;
```

### `.btn-favorite`
Botão de favorito (coração)

**Propriedades:**
```css
padding: 8px 10px;
background: white;
border: 1px solid #ddd;
border-radius: 6px;
cursor: pointer;
font-size: 1rem;
color: #999;
transition: all 0.3s ease;
```

**Estado Ativo (Favorito):**
```css
.btn-favorite.active {
    background: #ffe0e0;
    border-color: #ff6b6b;
    color: #ff6b6b;
}
```

---

## 🔍 Filtros Sidebar

### `.filters-sidebar`
Container com filtros laterais

**Mobile (< 768px):**
```css
width: 100%;
background: white;
padding: 16px;
border-radius: 8px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
max-height: 60vh;
overflow-y: auto;
margin-top: auto;
```

**Tablet+ (768px+):**
```css
width: 280px;
height: fit-content;
position: sticky;
top: 20px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
border-radius: 8px;
margin-top: 0;
```

### `.filter-section`
Grupo de filtros (ex: Materiais, Cores, etc)

**Propriedades:**
```css
margin-bottom: 16px;
border-bottom: 1px solid #e3e3e3;
padding-bottom: 12px;
```

**Último elemento:**
```css
.filter-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
}
```

### `.filter-title`
Título do grupo de filtros

**Propriedades:**
```css
font-size: 0.85rem;
font-weight: 700;
color: #333;
margin-bottom: 10px;
text-transform: uppercase;
letter-spacing: 0.5px;
```

### `.filter-item`
Item individual de filtro

**Propriedades:**
```css
display: flex;
align-items: center;
margin-bottom: 8px;
```

### `.filter-item input[type="checkbox"]`
Checkbox dos filtros

**Propriedades:**
```css
width: 16px;
height: 16px;
cursor: pointer;
accent-color: #d4af37;  /* Cor ao selecionar */
margin-right: 8px;
flex-shrink: 0;
```

### `.filter-item label`
Label do filtro

**Propriedades:**
```css
font-size: 0.85rem;
color: #555;
cursor: pointer;
flex: 1;
```

### `.filter-price-inputs`
Container para inputs de preço (min/max)

**Propriedades:**
```css
display: flex;
gap: 8px;
margin-top: 8px;
```

**Inputs:**
```css
flex: 1;
padding: 8px 10px;
border: 1px solid #ddd;
border-radius: 6px;
font-size: 0.85rem;

/* Focus */
outline: none;
border-color: #d4af37;
box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
```

---

## ⏳ Estados de Loading

### `.loading-spinner`
Animação de carregamento

**Propriedades:**
```css
text-align: center;
padding: 40px 20px;
font-size: 0.95rem;
color: #666;
```

**Pseudo-elemento:**
```css
::after {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #d4af37;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

---

## ⚠️ Estados de Erro

### `.error-message`
Mensagem de erro

**Propriedades:**
```css
background: #fff3cd;
color: #856404;
padding: 16px;
border-radius: 6px;
margin: 16px;
border-left: 4px solid #ffc107;
```

---

## 📑 Paginação (Se Aplicável)

### `.pagination`
Container de paginação

**Propriedades:**
```css
display: flex;
justify-content: center;
align-items: center;
margin-top: 40px;
padding-top: 20px;
border-top: 2px solid #e3e3e3;
gap: 10px;
```

### `.pagination span` (Página Ativa)
```css
padding: 10px 16px;
background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
color: #000;
border-color: transparent;
box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
border-radius: 8px;
font-weight: 600;
```

### `.pagination button` (Páginas Inativas)
```css
padding: 10px 16px;
border: 1px solid #ddd;
background: #fff;
color: #333;
cursor: pointer;
border-radius: 8px;
font-weight: 600;

/* Hover */
background: #f8f9fa;
border-color: #d4af37;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
```

---

## 🎨 Cores Padrão

```css
/* Primária */
#d4af37 - Dourado (botões, preços)

/* Backgrounds */
#ffffff - Branco (cards, inputs)
#f8f9fa - Cinza claro (container)

/* Texto */
#333333 - Escuro (conteúdo)
#555555 - Médio (labels)
#999999 - Claro (preço antigo)
#666666 - Breadcrumb

/* Estados */
#ffc107 - Amarelo (rating stars)
#ff6b6b - Vermelho (desconto, favorito)
#27ae60 - Verde (stock disponível)
#e3e3e3 - Cinza claro (borders)
```

---

## 📱 Media Queries

```css
/* Mobile-first (padrão) */
/* Sem media query necessária */

/* Tablet 768px+ */
@media (min-width: 768px) {
    /* Muda para 3 colunas */
    /* Sidebar vira sticky */
    /* Imagens aumentam para 200px */
}

/* Desktop 1024px+ */
@media (min-width: 1024px) {
    /* Muda para 4 colunas */
    /* Imagens aumentam para 240px */
    /* Hover effects ativados */
}

/* Extra pequeno 480px */
@media (max-width: 480px) {
    /* Ajustes finos para telas muito pequenas */
}
```

---

## 🔄 Transitions & Animations

```css
/* Padrão */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Spinner */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Duration: 1s infinite linear */
```

---

## ✅ Checklist de Uso

- [ ] Use `.products-page-container` no wrapper principal
- [ ] Use `.products-grid` para lista de produtos
- [ ] Sempre coloque imagem em `.product-image-container`
- [ ] Use `.btn-add-cart` para botões de carrinho
- [ ] Adicione `.active` a `.btn-favorite` quando favoritado
- [ ] Use `.filter-item` para cada checkbox/radio
- [ ] Aplique `.loading-spinner` durante carregamento
- [ ] Mostre `.error-message` em caso de erro

---

**Versão:** 1.0  
**Última Atualização:** 2024  
**Status:** ✅ Produção
