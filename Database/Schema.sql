CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- CREATING ALL ENUMS --

create type product_category as enum ('pickles','podis');

create type spice_level as enum ('1', '2' , '3' , '4', '5');

CREATE TYPE product_badge AS ENUM (
    'Bestseller', 'Popular', 'New', 'Hot', 'Mild', 'Limited'
);

CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'preparing', 'packed',
    'dispatched', 'out_for_delivery', 'delivered',
    'cancelled', 'refunded'
);

CREATE TYPE delivery_type AS ENUM ('standard', 'express');

CREATE TYPE payment_method AS ENUM ('upi', 'card', 'netbanking', 'cod');

CREATE TYPE payment_status AS ENUM (
    'pending', 'success', 'failed', 'refunded'
);

CREATE TYPE contact_subject AS ENUM (
    'Order Enquiry',
    'Bulk Order / Wholesale',
    'Feedback',
    'International Shipping',
    'Other'
);

-- CRFEATING CATEGORIES AS TABLES --

CREATE TABLE categories (
    id          SERIAL           PRIMARY KEY,
    slug        product_category NOT NULL UNIQUE,
    label       VARCHAR(60)      NOT NULL,
    description TEXT,
    icon        VARCHAR(60),
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

INSERT INTO categories (slug, label, description, icon) VALUES
    ('pickles', 'Homemade Pickles',  'Traditional Andhra pickles — sun-dried, hand-seasoned, zero preservatives', 'fa-solid fa-jar'),
    ('podis',   'Podis & Spices',    'Freshly ground spice powders — roasted daily, bursting with authentic flavor', 'fa-solid fa-mortar-pestle');


	-- CREATE PRODUCTS TABLE --
	CREATE TABLE products (
    id          SERIAL          PRIMARY KEY,
    category_id INT             NOT NULL REFERENCES categories(id),
    name        VARCHAR(120)    NOT NULL,
    subtitle    VARCHAR(120),
    description TEXT            NOT NULL,
    price       NUMERIC(10,2)   NOT NULL CHECK (price > 0),
    weight      VARCHAR(20)     NOT NULL,
    badge       product_badge,
    spice       spice_level     NOT NULL,
    img_url     TEXT,
    stock_qty   INT             NOT NULL DEFAULT 100 CHECK (stock_qty >= 0),
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active   ON products(is_active);

INSERT INTO products
    (category_id, name, subtitle, description, price, weight, badge, spice, img_url)
VALUES
    (1, 'Avakaya Pickle',  'Mango Pickle',        'Traditional spicy mango pickle made with authentic Andhra recipe. Bold, tangy and finger-licking good.',               399, '500g', 'Bestseller', '5', 'images/avakaya.jpg'),
    (1, 'Gongura Pickle',  'Sorrel Leaves',        'Tangy and spicy Gongura pickle rich in flavor. Andhra''s pride with earthy sour notes.',                              349, '500g', 'Popular',    '4', 'images/gongura.jpg'),
    (1, 'Lemon Pickle',    'Nimma Pachadi',        'Homemade lemon pickle with perfectly balanced spice and sour taste. Goes with everything.',                           299, '500g', 'Mild',       '3', 'images/lemon.jpg'),
    (1, 'Garlic Pickle',   'Velluli Pachadi',      'Strong-flavored garlic pickle prepared with traditional Andhra spices. A condiment lover''s delight.',               329, '500g', 'Hot',        '5', 'images/garlic.jpg'),
    (1, 'Tomato Pickle',   'Tomato Pachadi',       'Andhra-style tomato pickle with a rich, tangy taste and aromatic tempering. Perfect for rice.',                      279, '500g', 'New',        '3', 'images/tomato.jpg'),
    (2, 'Kandi Podi',      'Toor Dal Powder',      'Classic Andhra toor dal podi with roasted spices. Mix with rice and ghee for a soul-satisfying meal.',               199, '200g', 'Bestseller', '3', 'images/kandi-podi.jpg'),
    (2, 'Karivepaku Podi', 'Curry Leaf Powder',    'Aromatic curry leaf podi packed with flavor and nutrition. A staple in every Andhra household.',                     179, '200g', 'Popular',    '2', 'images/karivepaku.jpg'),
    (2, 'Palli Podi',      'Peanut Spice Powder',  'Crunchy roasted peanut podi with a hint of chilli and garlic. Delicious with idli, dosa or rice.',                  149, '200g', 'Mild',       '2', 'images/palli-podi.jpg'),
    (2, 'Nuvvulu Podi',    'Sesame Seed Powder',   'Nutty sesame podi with roasted spices. Rich in calcium and perfectly balanced with chilli heat.',                    169, '200g', 'New',        '2', 'images/nuvvulu.jpg'),
    (2, 'Kobbari Podi',    'Coconut Spice Powder', 'Freshly prepared coconut podi with dried chillies and lentils. A wonderful accompaniment for any South Indian meal.',189, '200g', 'Hot',        '3', 'images/kobbari.jpg');

	-- CREATE CUSTOMERS TABLE --
	CREATE TABLE customers (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name  VARCHAR(80) NOT NULL,
    last_name   VARCHAR(80),
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(20)  NOT NULL,
    is_nri      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

-- CREATE ADDRESSES TABLE --
CREATE TABLE addresses (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id   UUID         NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city          VARCHAR(100) NOT NULL,
    state         VARCHAR(100) NOT NULL,
    pincode       CHAR(6)      NOT NULL CHECK (pincode ~ '^\d{6}$'),
    is_default    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_customer ON addresses(customer_id);

-- CREATE COUPONS TABLE --
CREATE TABLE coupons (
    id              SERIAL          PRIMARY KEY,
    code            VARCHAR(30)     NOT NULL UNIQUE,
    discount_amount NUMERIC(10,2)   NOT NULL CHECK (discount_amount > 0),
    min_order_value NUMERIC(10,2)   NOT NULL DEFAULT 0,
    max_uses        INT,
    used_count      INT             NOT NULL DEFAULT 0,
    valid_from      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    valid_until     TIMESTAMPTZ,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

INSERT INTO coupons (code, discount_amount, min_order_value) VALUES
    ('WELCOME10', 10.00, 0),
    ('TASTY50',   50.00, 0),
    ('THANUSHA',  30.00, 0);

-- CREATE ORDERS TABLE --
CREATE TABLE orders (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        VARCHAR(20)     NOT NULL UNIQUE,
    customer_id         UUID            REFERENCES customers(id) ON DELETE SET NULL,
    customer_first_name VARCHAR(80)     NOT NULL,
    customer_last_name  VARCHAR(80),
    customer_email      VARCHAR(255)    NOT NULL,
    customer_phone      VARCHAR(20)     NOT NULL,
    address_line1       VARCHAR(255)    NOT NULL,
    address_line2       VARCHAR(255),
    city                VARCHAR(100)    NOT NULL,
    state               VARCHAR(100)    NOT NULL,
    pincode             CHAR(6)         NOT NULL,
    delivery_type       delivery_type   NOT NULL DEFAULT 'standard',
    delivery_charge     NUMERIC(10,2)   NOT NULL DEFAULT 60.00,
    delivery_note       TEXT,
    coupon_id           INT             REFERENCES coupons(id) ON DELETE SET NULL,
    coupon_code         VARCHAR(30),
    discount_amount     NUMERIC(10,2)   NOT NULL DEFAULT 0,
    subtotal            NUMERIC(10,2)   NOT NULL,
    total_amount        NUMERIC(10,2)   NOT NULL,
    payment_method      payment_method  NOT NULL,
    status              order_status    NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- CREATE ORDER ITEMS TABLE --
CREATE TABLE order_items (
    id              SERIAL          PRIMARY KEY,
    order_id        UUID            NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INT             NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name    VARCHAR(120)    NOT NULL,
    product_weight  VARCHAR(20)     NOT NULL,
    unit_price      NUMERIC(10,2)   NOT NULL,
    quantity        INT             NOT NULL CHECK (quantity > 0),
    line_total      NUMERIC(10,2)   NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- CREATE PAYMENTS TABLE --
CREATE TABLE payments (
    id                   SERIAL          PRIMARY KEY,
    order_id             UUID            NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    razorpay_order_id    VARCHAR(100),
    razorpay_payment_id  VARCHAR(100),
    razorpay_signature   VARCHAR(255),
    payment_method       payment_method  NOT NULL,
    amount               NUMERIC(10,2)   NOT NULL,
    currency             CHAR(3)         NOT NULL DEFAULT 'INR',
    status               payment_status  NOT NULL DEFAULT 'pending',
    failure_reason       TEXT,
    refund_id            VARCHAR(100),
    created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order            ON payments(order_id);
CREATE INDEX idx_payments_razorpay_payment ON payments(razorpay_payment_id);
CREATE INDEX idx_orders_customer     ON orders(customer_id);
CREATE INDEX idx_orders_status       ON orders(status);
CREATE INDEX idx_orders_created      ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- create contact_messages table --
CREATE TABLE contact_messages (
    id          SERIAL          PRIMARY KEY,
    first_name  VARCHAR(80)     NOT NULL,
    last_name   VARCHAR(80),
    email       VARCHAR(255)    NOT NULL,
    subject     contact_subject,
    message     TEXT            NOT NULL,
    is_read     BOOLEAN         NOT NULL DEFAULT FALSE,
    replied_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_is_read ON contact_messages(is_read);
CREATE INDEX idx_contact_email   ON contact_messages(email);

-- CREATE ADMIN_USERS TABLE --
CREATE TABLE admin_users (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(120)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    is_super_admin  BOOLEAN         NOT NULL DEFAULT FALSE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- CREATE AUTO - UPDATE TRIGGER --
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

