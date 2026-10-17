-- ============================================================================
-- UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA
-- Proyecto: Sistema de Gestión para Supermercado UMG
-- Base de Datos: Supabase (Supermercado_UMG)
-- Script Completo: DDL (Tablas y Restricciones) + DML (Datos Iniciales)
-- ============================================================================

-- 1. LIMPIEZA PREVIA (Opcional, en orden inverso)
DROP TABLE IF EXISTS detalle_ventas CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS detalle_compras CASCADE;
DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ============================================================================
-- DDL: CREACIÓN DE TABLAS
-- ============================================================================

-- 1. TABLA: usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'Cajero' CHECK (rol IN ('Administrador', 'Supervisor', 'Cajero', 'Bodeguero')),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: categorias
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: productos
CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    id_categoria INT NOT NULL,
    precio_compra NUMERIC(10, 2) NOT NULL CHECK (precio_compra >= 0),
    precio_venta NUMERIC(10, 2) NOT NULL CHECK (precio_venta >= precio_compra),
    existencia INT NOT NULL DEFAULT 0 CHECK (existencia >= 0),
    stock_minimo INT NOT NULL DEFAULT 10 CHECK (stock_minimo >= 0),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_productos_categorias FOREIGN KEY (id_categoria) 
        REFERENCES categorias(id_categoria) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 4. TABLA: clientes
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    identificador VARCHAR(50) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    nit VARCHAR(20) NOT NULL DEFAULT 'C/F',
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion VARCHAR(255),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA: proveedores
CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    identificador VARCHAR(50) NOT NULL UNIQUE,
    nombre_proveedor VARCHAR(150) NOT NULL,
    nit VARCHAR(20) NOT NULL,
    nombre_contacto VARCHAR(100),
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100),
    direccion VARCHAR(255),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: compras
CREATE TABLE compras (
    id_compra SERIAL PRIMARY KEY,
    numero_compra VARCHAR(30) NOT NULL UNIQUE,
    id_proveedor INT NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Completada' CHECK (estado IN ('Completada', 'Anulada', 'Pendiente')),
    observaciones TEXT,
    CONSTRAINT fk_compras_proveedores FOREIGN KEY (id_proveedor) 
        REFERENCES proveedores(id_proveedor) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_compras_usuarios FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 7. TABLA: detalle_compras
CREATE TABLE detalle_compras (
    id_detalle_compra SERIAL PRIMARY KEY,
    id_compra INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_compra NUMERIC(10, 2) NOT NULL CHECK (precio_compra >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    CONSTRAINT fk_detalle_compra_compras FOREIGN KEY (id_compra) 
        REFERENCES compras(id_compra) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_detalle_compra_productos FOREIGN KEY (id_producto) 
        REFERENCES productos(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 8. TABLA: ventas
CREATE TABLE ventas (
    id_venta SERIAL PRIMARY KEY,
    numero_venta VARCHAR(30) NOT NULL UNIQUE,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Completada' CHECK (estado IN ('Completada', 'Anulada')),
    observaciones TEXT,
    CONSTRAINT fk_ventas_clientes FOREIGN KEY (id_cliente) 
        REFERENCES clientes(id_cliente) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_ventas_usuarios FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 9. TABLA: detalle_ventas
CREATE TABLE detalle_ventas (
    id_detalle_venta SERIAL PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    CONSTRAINT fk_detalle_venta_ventas FOREIGN KEY (id_venta) 
        REFERENCES ventas(id_venta) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_detalle_venta_productos FOREIGN KEY (id_producto) 
        REFERENCES productos(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ÍNDICES B-TREE
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_productos_existencia ON productos(existencia);
CREATE INDEX idx_compras_fecha ON compras(fecha);
CREATE INDEX idx_compras_proveedor ON compras(id_proveedor);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_cliente ON ventas(id_cliente);
CREATE INDEX idx_detalle_ventas_producto ON detalle_ventas(id_producto);
CREATE INDEX idx_detalle_compras_producto ON detalle_compras(id_producto);


-- ============================================================================
-- DML: INSERCIÓN DE DATOS INICIALES (SEMILLA)
-- ============================================================================

-- 1. USUARIOS
INSERT INTO usuarios (nombre_completo, username, email, password_hash, rol, estado) VALUES
('Oscar G', 'admin', 'admin@supermercado.gt', 'admin123', 'Administrador', TRUE),
('Ana Lucía Morales', 'amorales', 'cajero1@supermercado.gt', 'cajero123', 'Cajero', TRUE),
('Edwin Estuardo Gómez', 'egomez', 'supervisor@supermercado.gt', 'super123', 'Supervisor', TRUE)
ON CONFLICT (username) DO NOTHING;

-- 2. CATEGORÍAS
INSERT INTO categorias (codigo, nombre, descripcion, estado) VALUES
('CAT-BEB', 'Bebidas', 'Jugos, gaseosas, aguas purificadas y energizantes', TRUE),
('CAT-LAC', 'Lácteos', 'Leches pasteurizadas, quesos, cremas y yogures', TRUE),
('CAT-CAR', 'Carnes', 'Cortes de res, cerdo, aves y embutidos', TRUE),
('CAT-FRU', 'Frutas', 'Frutas frescas de temporada', TRUE),
('CAT-VER', 'Verduras', 'Hortalizas, legumbres y vegetales', TRUE),
('CAT-LIM', 'Limpieza', 'Detergentes, desinfectantes y cloro', TRUE),
('CAT-HIG', 'Higiene Personal', 'Jabones, champús y pastas dentales', TRUE),
('CAT-PAN', 'Panadería', 'Pan dulce, francés e integral', TRUE),
('CAT-CON', 'Congelados', 'Vegetales congelados y helados', TRUE),
('CAT-ABA', 'Abarrotes', 'Granos básicos, aceites, café y pastas', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- 3. PROVEEDORES
INSERT INTO proveedores (identificador, nombre_proveedor, nit, nombre_contacto, telefono, correo, direccion, estado) VALUES
('PRV-001', 'Distribuidora La Cervecería y Bebidas S.A.', '8472910-4', 'Ing. Roberto Paiz', '2384-9000', 'ventas@distribuidorabebidas.gt', 'Calzada Aguilar Batres Zona 11, Guatemala', TRUE),
('PRV-002', 'Lácteos del Altiplano & Trébol', '3910294-8', 'Licda. Silvia Castillo', '7765-1200', 'pedidos@lacteosaltiplano.com', 'Carretera a El Salvador, Fraijanes', TRUE),
('PRV-003', 'Carnes Selectas de Guatemala S.A.', '5501928-1', 'Mario René Pineda', '2477-8899', 'contacto@carnesselectas.gt', 'Av. Petapa Zona 12, Guatemala', TRUE),
('PRV-004', 'Abarrotes y Granos Mayas S.A.', '1294820-9', 'Brenda Marroquín', '2230-4545', 'info@granosmayas.com.gt', 'Zona 1, Ciudad de Guatemala', TRUE),
('PRV-005', 'Industrias Químicas y Limpieza S.A.', '6718290-3', 'Héctor Rodas', '6633-1122', 'servicio@quimicaslimpieza.gt', 'Carretera al Atlántico Zona 17, Guatemala', TRUE)
ON CONFLICT (identificador) DO NOTHING;

-- 4. CLIENTES CON NITS GUATEMALTECOS
INSERT INTO clientes (identificador, nombres, apellidos, nit, telefono, correo, direccion, estado) VALUES
('CLI-001', 'Consumidor', 'Final', 'C/F', '0000-0000', 'cf@supermercado.gt', 'Ciudad de Guatemala', TRUE),
('CLI-002', 'Juan José', 'Pérez López', '4829104-5', '5521-9988', 'juan.perez@gmail.com', 'Colonia El Carmen, Zona 12, Guatemala', TRUE),
('CLI-003', 'María Alejandra', 'García Fuentes', '3910294-1', '4120-7766', 'maria.garcia@outlook.com', 'Santa Catarina Pinula, Guatemala', TRUE),
('CLI-004', 'Carlos Roberto', 'Herrera Santos', '7482910-8', '5934-2211', 'carlos.herrera@hotmail.com', 'Zona 7 de Mixco, Guatemala', TRUE),
('CLI-005', 'Sandra Patricia', 'Rodríguez Solís', '9102948-2', '3011-4455', 'sandra.rodriguez@gmail.com', 'Zona 10, Ciudad de Guatemala', TRUE),
('CLI-006', 'Luis Fernando', 'Morales Castillo', '1245890-3', '4255-6677', 'luis.morales@yahoo.com', 'Zona 11 Las Majadas, Guatemala', TRUE),
('CLI-007', 'Ana Sofía', 'Mendoza Ramos', '6738291-0', '5899-1122', 'sofia.mendoza@gmail.com', 'Carretera a El Salvador Km 14.5', TRUE),
('CLI-008', 'Jorge Mario', 'Alvarado Estrada', '8592014-7', '3144-8899', 'jorge.alvarado@gmail.com', 'San José Pinula, Guatemala', TRUE),
('CLI-009', 'Claudia Elizabeth', 'Vásquez Ruano', '2349182-4', '4711-3344', 'claudia.vasquez@gmail.com', 'Zona 14 La Cañada, Guatemala', TRUE),
('CLI-010', 'Héctor David', 'Chávez Sandoval', '5629103-9', '5300-7788', 'hector.chavez@gmail.com', 'Zona 1 Centro Histórico, Guatemala', TRUE),
('CLI-011', 'Karla Paola', 'Gómez Monterroso', '4182903-6', '4922-5566', 'karla.gomez@gmail.com', 'Villa Nueva, Guatemala', TRUE),
('CLI-012', 'Diego Alejandro', 'Pineda Figueroa', '7819204-1', '3566-9900', 'diego.pineda@gmail.com', 'San Miguel Petapa, Guatemala', TRUE)
ON CONFLICT (identificador) DO NOTHING;

-- 5. PRODUCTOS
INSERT INTO productos (codigo, nombre, descripcion, id_categoria, precio_compra, precio_venta, existencia, stock_minimo, estado) VALUES
('PROD-001', 'Agua Pura Salvavidas 1L', 'Agua purificada 1000ml', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-BEB' LIMIT 1), 3.50, 5.50, 45, 15, TRUE),
('PROD-002', 'Gaseosa Coca Cola 2.5L', 'Refresco familiar desechable', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-BEB' LIMIT 1), 14.00, 18.00, 28, 12, TRUE),
('PROD-003', 'Jugo de Naranja Kerns 1L', 'Jugo néctar natural', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-BEB' LIMIT 1), 8.50, 12.00, 8, 10, TRUE),
('PROD-004', 'Leche Entera Dos Pinos 1L', 'Leche fluida pasteurizada', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-LAC' LIMIT 1), 8.00, 12.00, 50, 20, TRUE),
('PROD-005', 'Queso Crema Trebolac 225g', 'Queso untable pasteurizado', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-LAC' LIMIT 1), 9.50, 14.50, 18, 10, TRUE),
('PROD-006', 'Crema Pura La Vaquita 500ml', 'Crema de vaca fresca', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-LAC' LIMIT 1), 11.00, 16.00, 6, 12, TRUE),
('PROD-007', 'Pan Baguette Francés (Paquete)', 'Bolsa con 5 unidades', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-PAN' LIMIT 1), 3.00, 5.00, 60, 25, TRUE),
('PROD-008', 'Pan Sandwich Integral Bimbo', 'Pan de molde con semillas', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-PAN' LIMIT 1), 14.50, 21.00, 22, 10, TRUE),
('PROD-009', 'Café Tostado León 400g', 'Café 100% arábigo guatemalteco', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-ABA' LIMIT 1), 24.00, 35.00, 35, 15, TRUE),
('PROD-010', 'Aceite Vegetal Capullo 800ml', 'Aceite puro comestible', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-ABA' LIMIT 1), 12.00, 17.50, 30, 15, TRUE),
('PROD-011', 'Arroz Blanco Gran Gallo 1 lb', 'Arroz grano largo', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-ABA' LIMIT 1), 3.20, 5.00, 80, 20, TRUE),
('PROD-012', 'Frijol Negro Ducal 430g (Lata)', 'Frijoles volteados', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-ABA' LIMIT 1), 6.50, 9.75, 4, 15, TRUE),
('PROD-013', 'Detergente Blanca Nieves 1kg', 'Detergente biodegradable', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-LIM' LIMIT 1), 10.00, 15.00, 40, 15, TRUE),
('PROD-014', 'Cloro Magia Blanca 1 Galón', 'Desinfectante concentrado', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-LIM' LIMIT 1), 14.00, 20.00, 16, 10, TRUE),
('PROD-015', 'Libra de Pollo Rey', 'Piezas de pollo frescas', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-CAR' LIMIT 1), 10.50, 15.00, 25, 15, TRUE),
('PROD-016', 'Libra de Carne para Asar', 'Corte fino de res', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-CAR' LIMIT 1), 28.00, 42.00, 5, 10, TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- 6. COMPRAS INICIALES
INSERT INTO compras (numero_compra, id_proveedor, fecha, id_usuario, total, estado, observaciones) VALUES
('CMP-2026-001', (SELECT id_proveedor FROM proveedores LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '2 days', (SELECT id_usuario FROM usuarios WHERE username = 'admin' LIMIT 1), 1075.00, 'Completada', 'Abastecimiento de lácteos'),
('CMP-2026-002', (SELECT id_proveedor FROM proveedores OFFSET 1 LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '1 day', (SELECT id_usuario FROM usuarios WHERE username = 'admin' LIMIT 1), 1940.00, 'Completada', 'Abastecimiento de abarrotes')
ON CONFLICT (numero_compra) DO NOTHING;

-- 7. DETALLE COMPRAS
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_compra, subtotal)
SELECT c.id_compra, p.id_producto, 100, 8.00, 800.00
FROM compras c, productos p 
WHERE c.numero_compra = 'CMP-2026-001' AND p.codigo = 'PROD-004'
LIMIT 1;

-- 8. VENTAS INICIALES
INSERT INTO ventas (numero_venta, fecha, id_cliente, id_usuario, total, estado, observaciones) VALUES
('VNT-1001', CURRENT_TIMESTAMP - INTERVAL '3 hours', (SELECT id_cliente FROM clientes WHERE identificador = 'CLI-002' LIMIT 1), (SELECT id_usuario FROM usuarios WHERE username = 'admin' LIMIT 1), 74.00, 'Completada', 'Venta demostración Juan Pérez'),
('VNT-1002', CURRENT_TIMESTAMP - INTERVAL '1 hour', (SELECT id_cliente FROM clientes WHERE identificador = 'CLI-003' LIMIT 1), (SELECT id_usuario FROM usuarios WHERE username = 'admin' LIMIT 1), 108.50, 'Completada', 'Venta tarjeta')
ON CONFLICT (numero_venta) DO NOTHING;

-- 9. DETALLE VENTAS
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
SELECT v.id_venta, p.id_producto, 2, 12.00, 24.00
FROM ventas v, productos p 
WHERE v.numero_venta = 'VNT-1001' AND p.codigo = 'PROD-004'
LIMIT 1;

INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
SELECT v.id_venta, p.id_producto, 3, 5.00, 15.00
FROM ventas v, productos p 
WHERE v.numero_venta = 'VNT-1001' AND p.codigo = 'PROD-007'
LIMIT 1;

INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
SELECT v.id_venta, p.id_producto, 2, 18.00, 36.00
FROM ventas v, productos p 
WHERE v.numero_venta = 'VNT-1002' AND p.codigo = 'PROD-002'
LIMIT 1;
