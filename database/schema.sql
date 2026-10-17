-- ============================================================================
-- UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA
-- Facultad de Ingeniería en Sistemas de Información
-- Cursos: Bases de Datos I & Desarrollo Web
-- Proyecto: Sistema de Gestión para Supermercado
-- Script: schema.sql (DDL - Creación de Tablas, Llaves, Restricciones)
-- Motor: PostgreSQL / Supabase
-- ============================================================================

-- Limpiar tablas si existen (en orden inverso de dependencias)
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
-- 1. TABLA: usuarios
-- Permite el control de acceso al sistema (autenticación y roles)
-- ============================================================================
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

-- ============================================================================
-- 2. TABLA: categorias
-- Clasificación de los productos del supermercado
-- ============================================================================
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. TABLA: productos
-- Catálogo de productos disponibles con control de existencias y precios
-- ============================================================================
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

-- ============================================================================
-- 4. TABLA: clientes
-- Clientes que realizan compras en el supermercado
-- ============================================================================
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

-- ============================================================================
-- 5. TABLA: proveedores
-- Empresas que abastecen productos al supermercado
-- ============================================================================
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

-- ============================================================================
-- 6. TABLA: compras (Encabezado)
-- Registro de transacciones de abastecimiento con proveedores
-- ============================================================================
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

-- ============================================================================
-- 7. TABLA: detalle_compras
-- Detalle de productos adquiridos en cada compra
-- ============================================================================
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

-- ============================================================================
-- 8. TABLA: ventas (Encabezado)
-- Registro de facturación y transacciones de venta a clientes
-- ============================================================================
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

-- ============================================================================
-- 9. TABLA: detalle_ventas
-- Detalle de los productos vendidos por transacción
-- ============================================================================
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

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- ============================================================================
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_productos_existencia ON productos(existencia);
CREATE INDEX idx_compras_fecha ON compras(fecha);
CREATE INDEX idx_compras_proveedor ON compras(id_proveedor);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_cliente ON ventas(id_cliente);
CREATE INDEX idx_detalle_ventas_producto ON detalle_ventas(id_producto);
CREATE INDEX idx_detalle_compras_producto ON detalle_compras(id_producto);
