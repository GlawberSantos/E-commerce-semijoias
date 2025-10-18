-- ==================== TABELA DE PRODUTOS ====================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    price_discount DECIMAL(10,2),
    image VARCHAR(255),
    folder VARCHAR(50),
    category VARCHAR(50) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== TABELA DE CLIENTES ====================
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    cpf_cnpj VARCHAR(18),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== TABELA DE ENDEREÇOS ====================
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    cep VARCHAR(9) NOT NULL,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(10) NOT NULL,
    complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== TABELA DE PEDIDOS ====================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    shipping_method VARCHAR(50),
    shipping_address_id INTEGER REFERENCES addresses(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

-- ==================== TABELA DE ITENS DO PEDIDO ====================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== TABELA DE HISTÓRICO DE ESTOQUE ====================
CREATE TABLE stock_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    order_id INTEGER REFERENCES orders(id),
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ÍNDICES PARA PERFORMANCE ====================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_date ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_addresses_customer ON addresses(customer_id);

-- ==================== TRIGGER PARA ATUALIZAR updated_at ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== DADOS INICIAIS DOS PRODUTOS ====================
INSERT INTO products (name, price, price_discount, image, folder, category, stock) VALUES
-- Anéis
('Anel Elegance', 150.00, 135.00, 'anel-elegance.webp', 'aneis', 'aneis', 5),
('Anel de Prata', 120.00, 108.00, 'anel-prata.webp', 'aneis', 'aneis', 3),

-- Brincos
('Brinco Folheado', 95.00, 85.50, 'pedrinhas.webp', 'brincos', 'brincos', 10),
('Brinco Argola', 80.00, NULL, 'coracao.webp', 'brincos', 'brincos', 8),
('Brinco Borboleta', 95.00, NULL, 'duploborboleta.webp', 'brincos', 'brincos', 6),
('Brinco Argola 2', 80.00, NULL, 'borboletas.webp', 'brincos', 'brincos', 4),
('Brinco Escudo', 95.00, NULL, 'escudopedrabolinha.webp', 'brincos', 'brincos', 7),
('Brinco Coração', 80.00, NULL, 'coration.webp', 'brincos', 'brincos', 5),
('Brinco Peneira', 95.00, NULL, 'peneira.webp', 'brincos', 'brincos', 9),
('Brinco Flor', 80.00, NULL, 'florpedrabolinha.webp', 'brincos', 'brincos', 3),
('Brinco Pizza', 95.00, NULL, 'pizza.webp', 'brincos', 'brincos', 12),
('Brinco Grade', 80.00, NULL, 'grade.webp', 'brincos', 'brincos', 6),

-- Colares
('Colar de Pérolas', 200.00, NULL, 'abencoado.webp', 'colares', 'colares', 4),
('Colar de Coração', 150.00, NULL, 'gratidao.webp', 'colares', 'colares', 7),
('Colar Letrán', 150.00, NULL, 'letran.webp', 'colares', 'colares', 5),
('Colar Espírito Santo', 150.00, NULL, 'espiritosanto.webp', 'colares', 'colares', 8),
('Colar Menino', 150.00, NULL, 'menino.webp', 'colares', 'colares', 3),
('Colar de Filhos', 150.00, NULL, 'meninomenina.webp', 'colares', 'colares', 6),

-- Pulseiras
('Pulseira Pedrinha', 110.00, NULL, 'pedrinha.webp', 'pulseiras', 'pulseiras', 10),
('Pulseira Dourada', 90.00, NULL, 'pulseira-dourada.webp', 'pulseiras', 'pulseiras', 5),

-- Conjuntos
('Conjunto Borboleta', 110.00, NULL, 'borboleta.webp', 'conjuntos', 'conjuntos', 4),
('Conjunto Flores', 150.00, NULL, 'conjunto.webp', 'conjuntos', 'conjuntos', 6),
('Conjunto Pérolas', 200.00, NULL, 'gotaperola.webp', 'conjuntos', 'conjuntos', 3),
('Conjunto Pandas', 150.00, NULL, 'panda.webp', 'conjuntos', 'conjuntos', 5),
('Conjunto Coração', 120.00, NULL, 'coracao.webp', 'conjuntos', 'conjuntos', 8),
('Conjunto Borboleta 2', 110.00, NULL, 'coracaopedrinhas.webp', 'conjuntos', 'conjuntos', 7),
('Conjunto Folheado', 150.00, NULL, 'minnie.webp', 'conjuntos', 'conjuntos', 4),
('Conjunto Santa', 95.00, NULL, 'santa.webp', 'conjuntos', 'conjuntos', 9),
('Conjunto Borboletas', 80.00, NULL, 'borboletas.webp', 'conjuntos', 'conjuntos', 6),
('Conjunto Escudo', 95.00, NULL, 'escudopedrabolinha.webp', 'conjuntos', 'conjuntos', 5);

-- ==================== VIEWS ÚTEIS ====================

-- View de produtos com baixo estoque
CREATE VIEW low_stock_products AS
SELECT id, name, category, stock, price
FROM products
WHERE stock <= 5 AND active = TRUE
ORDER BY stock ASC;

-- View de resumo de vendas
CREATE VIEW sales_summary AS
SELECT 
    p.name AS product_name,
    p.category,
    SUM(oi.quantity) AS total_sold,
    SUM(oi.subtotal) AS total_revenue,
    COUNT(DISTINCT oi.order_id) AS order_count
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'paid'
GROUP BY p.id, p.name, p.category
ORDER BY total_revenue DESC;