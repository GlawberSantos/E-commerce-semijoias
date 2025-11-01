-- Script para PostgreSQL - Gabrielly Semijoias
-- ==================== TABELA DE CLIENTES ====================
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    cpf_cnpj VARCHAR(18),
    password_hash VARCHAR(255),  -- ← CAMPO ADICIONADO PARA AUTENTICAÇÃO
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== TABELA DE PRODUTOS ====================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    price_discount DECIMAL(10,2),
    image VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    material VARCHAR(50),
    color VARCHAR(50),
    style VARCHAR(50),
    occasion VARCHAR(50),
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== TABELA DE ENDEREÇOS ====================
CREATE TABLE IF NOT EXISTS addresses (
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
CREATE TABLE IF NOT EXISTS orders (
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
    payment_details JSONB, -- ← CAMPO ADICIONADO PARA DETALHES DO PAGAMENTO
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

-- ==================== TABELA DE ITENS DO PEDIDO ====================
CREATE TABLE IF NOT EXISTS order_items (
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
CREATE TABLE IF NOT EXISTS stock_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    order_id INTEGER REFERENCES orders(id),
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== TABELA DE CUPONS ====================
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(10) NOT NULL, -- fixed ou percent
    value NUMERIC(10,2) NOT NULL,
    min_value NUMERIC(10,2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ÍNDICES PARA PERFORMANCE ====================
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);

-- ==================== TRIGGER PARA ATUALIZAR updated_at ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== VIEWS ÚTEIS ====================

-- View de produtos com baixo estoque
CREATE OR REPLACE VIEW low_stock_products AS
SELECT id, name, category, stock, price
FROM products
WHERE stock <= 5 AND active = TRUE
ORDER BY stock ASC;

-- View de resumo de vendas
CREATE OR REPLACE VIEW sales_summary AS
SELECT 
    p.name AS product_name,
    p.category,
    SUM(oi.quantity) AS total_sold,
    SUM(oi.subtotal) AS total_revenue,
    COUNT(DISTINCT oi.order_id) AS order_count
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.paid_at IS NOT NULL
GROUP BY p.id, p.name, p.category
ORDER BY total_revenue DESC;

-- ==================== DADOS INICIAIS (só insere se não existirem) ====================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
        INSERT INTO products (name, price, price_discount, image, category, stock, material, color, style, occasion, description) VALUES
        -- Anéis
        ('Anel Elegance', 150.00, 135.00, 'anel-elegance.webp', 'aneis', 5, 'Ouro 18k', 'dourado', 'Elegante', 'Festa', 'Anel elegante com design sofisticado.'),
        ('Anel de Prata', 120.00, 108.00, 'anel-prata.webp', 'aneis', 3, 'Prata 925', 'prateado', 'Clássico', 'Casual', 'Anel clássico de prata, ideal para o dia a dia.'),
        ('Anel Zircônia', 110.00, NULL, 'anel-zirconia.webp', 'aneis', 10, 'Zircônia', 'prateado', 'Moderno', 'Trabalho', 'Anel moderno com detalhe em zircônia.'),

        -- Brincos
        ('Brinco Folheado', 95.00, 85.50, 'pedrinhas.webp', 'brincos', 10, 'Aço Inoxidável', 'dourado', 'Moderno', 'Casual', 'Brinco folheado com pequenas pedras.'),
        ('Brinco Argola Coração', 80.00, NULL, 'coracao.webp', 'brincos', 8, 'Prata 925', 'prateado', 'Moderno', 'Casual', 'Brinco de argola com pingente de coração.'),
        ('Brinco Borboleta', 95.00, NULL, 'duploborboleta.webp', 'brincos', 6, 'Prata 925', 'rosé', 'Delicado', 'Casual', 'Brinco delicado em formato de borboleta.'),
        ('Brinco Argola 2', 80.00, NULL, 'borboletas.webp', 'brincos', 4, 'Ouro 18k', 'dourado', 'Moderno', 'Festa', 'Brinco de argola com detalhes de borboletas.'),
        ('Brinco Escudo', 95.00, NULL, 'escudopedrabolinha.webp', 'brincos', 7, 'Prata 925', 'prateado', 'Clássico', 'Festa', 'Brinco em formato de escudo com pedras.'),
        ('Brinco Coração Zircônia', 80.00, NULL, 'coration.webp', 'brincos', 5, 'Zircônia', 'rosé', 'Elegante', 'Presente', 'Brinco de coração cravejado com zircônias.'),
        ('Brinco Peneira', 95.00, NULL, 'peneira.webp', 'brincos', 9, 'Aço Inoxidável', 'dourado', 'Moderno', 'Casual', 'Brinco com design moderno estilo peneira.'),
        ('Brinco Flor', 80.00, NULL, 'florpedrabolinha.webp', 'brincos', 3, 'Prata 925', 'prateado', 'Delicado', 'Presente', 'Brinco em formato de flor com pedra central.'),
        ('Brinco Pizza', 95.00, NULL, 'pizza.webp', 'brincos', 12, 'Zircônia', 'multicor', 'Festa', 'Festa', 'Brinco estilo pizza com zircônias multicoloridas.'),
        ('Brinco Grade', 80.00, NULL, 'grade.webp', 'brincos', 6, 'Aço Inoxidável', 'prateado', 'Moderno', 'Trabalho', 'Brinco com design de grade, para um look de trabalho.'),

        -- Colares
        ('Colar Abençoado', 200.00, NULL, 'abencoado.webp', 'colares', 4, 'Ouro 18k', 'dourado', 'Clássico', 'Presente', 'Colar com pingente escrito "Abençoado".'),
        ('Colar Gratidão', 150.00, NULL, 'gratidao.webp', 'colares', 7, 'Prata 925', 'prateado', 'Moderno', 'Casual', 'Colar com pingente escrito "Gratidão".'),
        ('Colar Letra N', 150.00, NULL, 'letran.webp', 'colares', 5, 'Ouro 18k', 'dourado', 'Minimalista', 'Casual', 'Colar com um pingente da letra N.'),
        ('Colar Espírito Santo', 150.00, NULL, 'espiritosanto.webp', 'colares', 8, 'Prata 925', 'prateado', 'Clássico', 'Presente', 'Colar com pingente do Espírito Santo.'),
        ('Colar Menino', 150.00, NULL, 'menino.webp', 'colares', 3, 'Ouro 18k', 'dourado', 'Delicado', 'Presente', 'Colar com pingente de menino.'),
        ('Colar Filhos', 150.00, NULL, 'meninomenina.webp', 'colares', 6, 'Prata 925', 'prateado', 'Delicado', 'Presente', 'Colar com pingentes de menino e menina.'),

        -- Pulseiras
        ('Pulseira Pedrinha', 110.00, NULL, 'pedrinha.webp', 'pulseiras', 10, 'Prata 925', 'multicor', 'Delicado', 'Casual', 'Pulseira delicada com pedras multicoloridas.'),
        ('Pulseira Dourada', 90.00, NULL, 'pulseira-dourada.webp', 'pulseiras', 5, 'Aço Inoxidável', 'dourado', 'Minimalista', 'Trabalho', 'Pulseira dourada com design minimalista.'),

        -- Conjuntos
        ('Conjunto Borboleta', 110.00, NULL, 'borboleta.webp', 'conjuntos', 4, 'Prata 925', 'rosé', 'Delicado', 'Casual', 'Conjunto de colar e brincos de borboleta.'),
        ('Conjunto Flores', 150.00, NULL, 'conjunto.webp', 'conjuntos', 6, 'Ouro 18k', 'dourado', 'Clássico', 'Festa', 'Conjunto de colar e brincos de flores.'),
        ('Conjunto Pérolas', 200.00, NULL, 'gotaperola.webp', 'conjuntos', 3, 'Prata 925', 'prateado', 'Elegante', 'Casamento', 'Conjunto de colar e brincos de pérola.'),
        ('Conjunto Pandas', 150.00, NULL, 'panda.webp', 'conjuntos', 5, 'Aço Inoxidável', 'prateado', 'Moderno', 'Casual', 'Conjunto divertido de colar e brincos de panda.'),
        ('Conjunto Coração', 120.00, NULL, 'coracao.webp', 'conjuntos', 8, 'Prata 925', 'rosé', 'Delicado', 'Presente', 'Conjunto de colar e brincos de coração.'),
        ('Conjunto Pedrinhas', 110.00, NULL, 'coracaopedrinhas.webp', 'conjuntos', 7, 'Zircônia', 'multicor', 'Moderno', 'Festa', 'Conjunto de colar e brincos com pedrinhas coloridas.'),
        ('Conjunto Minnie', 150.00, NULL, 'minnie.webp', 'conjuntos', 4, 'Aço Inoxidável', 'rosé', 'Delicado', 'Casual', 'Conjunto temático da Minnie.'),
        ('Conjunto Santa', 95.00, NULL, 'santa.webp', 'conjuntos', 9, 'Prata 925', 'prateado', 'Clássico', 'Presente', 'Conjunto religioso com imagem de santa.'),
        ('Conjunto Borboletas Vazadas', 80.00, NULL, 'borboletas.webp', 'conjuntos', 6, 'Ouro 18k', 'dourado', 'Moderno', 'Festa', 'Conjunto de borboletas com design vazado.'),
        ('Conjunto Escudo', 95.00, NULL, 'escudopedrabolinha.webp', 'conjuntos', 5, 'Prata 925', 'prateado', 'Clássico', 'Festa', 'Conjunto de colar e brincos em formato de escudo.');
    END IF;
END $$;