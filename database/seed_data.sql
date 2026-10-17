-- ============================================================================
-- UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA
-- Cursos: Bases de Datos I & Desarrollo Web
-- Script: seed_data.sql (DML - Inserciones iniciales completas en PostgreSQL)
-- Base de Datos: laboratorio
-- ============================================================================

-- 1. USUARIOS
INSERT INTO usuarios (nombre_completo, username, email, password_hash, rol, estado) VALUES
('Oscar G', 'admin', 'admin@supermercado.gt', 'admin123', 'Administrador', TRUE),
('Ana Lucía Morales', 'amorales', 'cajero1@supermercado.gt', 'cajero123', 'Cajero', TRUE),
('Edwin Estuardo Gómez', 'egomez', 'supervisor@supermercado.gt', 'super123', 'Supervisor', TRUE)
ON CONFLICT (username) DO UPDATE 
SET nombre_completo = EXCLUDED.nombre_completo,
    password_hash = EXCLUDED.password_hash;

-- 2. CATEGORÍAS (10 Categorías oficiales)
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

-- 4. CLIENTES
INSERT INTO clientes (identificador, nombres, apellidos, nit, telefono, correo, direccion, estado) VALUES
('CLI-001', 'Consumidor', 'Final', 'C/F', '0000-0000', 'cf@supermercado.gt', 'Ciudad de Guatemala', TRUE),
('CLI-002', 'Juan José', 'Pérez López', '4829104-5', '5521-9988', 'juan.perez@gmail.com', 'Colonia El Carmen, Zona 12, Guatemala', TRUE),
('CLI-003', 'María Alejandra', 'García Fuentes', '3910294-1', '4120-7766', 'maria.garcia@outlook.com', 'Santa Catarina Pinula', TRUE),
('CLI-004', 'Carlos Roberto', 'Herrera Santos', '7482910-8', '5934-2211', 'carlos.herrera@hotmail.com', 'Zona 7 de Mixco', TRUE),
('CLI-005', 'Sandra Patricia', 'Rodríguez Solís', '9102948-2', '3011-4455', 'sandra.rodriguez@gmail.com', 'Zona 10, Ciudad de Guatemala', TRUE),
('CLI-006', 'Luis Fernando', 'Morales Castillo', '1245890-3', '4255-6677', 'luis.morales@yahoo.com', 'Zona 11 Las Majadas, Guatemala', TRUE),
('CLI-007', 'Ana Sofía', 'Mendoza Ramos', '6738291-0', '5899-1122', 'sofia.mendoza@gmail.com', 'Carretera a El Salvador Km 14.5', TRUE),
('CLI-008', 'Jorge Mario', 'Alvarado Estrada', '8592014-7', '3144-8899', 'jorge.alvarado@gmail.com', 'San José Pinula, Guatemala', TRUE),
('CLI-009', 'Claudia Elizabeth', 'Vásquez Ruano', '2349182-4', '4711-3344', 'claudia.vasquez@gmail.com', 'Zona 14 La Cañada, Guatemala', TRUE),
('CLI-010', 'Héctor David', 'Chávez Sandoval', '5629103-9', '5300-7788', 'hector.chavez@gmail.com', 'Zona 1 Centro Histórico, Guatemala', TRUE),
('CLI-011', 'Karla Paola', 'Gómez Monterroso', '4182903-6', '4922-5566', 'karla.gomez@gmail.com', 'Villa Nueva, Guatemala', TRUE),
('CLI-012', 'Diego Alejandro', 'Pineda Figueroa', '7819204-1', '3566-9900', 'diego.pineda@gmail.com', 'San Miguel Petapa, Guatemala', TRUE)
ON CONFLICT (identificador) DO NOTHING;

-- 5. PRODUCTOS (Vinculados dinámicamente por código de categoría)
INSERT INTO productos (codigo, nombre, descripcion, id_categoria, precio_compra, precio_venta, existencia, stock_minimo, estado) VALUES
('PROD-001', 'Agua Pura Salvavidas 1L', 'Agua purificada 1000ml', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-BEB' LIMIT 1), 3.50, 5.50, 45, 15, TRUE),
('PROD-002', 'Gaseosa Coca Cola 2.5L', 'Refresco familiar desechable', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-BEB' LIMIT 1), 14.00, 18.00, 28, 12, TRUE),
('PROD-003', 'Jugo de Naranja Kerns 1L', 'Jugo néctar natural', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-BEB' LIMIT 1), 8.50, 12.00, 8, 10, TRUE),
('PROD-004', 'Leche Entera Dos Pinos 1L', 'Leche fluida pasteurizada', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-LAC' LIMIT 1), 8.00, 12.00, 50, 20, TRUE),
('PROD-005', 'Queso Crema Trebolac 225g', 'Queso untable pasteurizado', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-LAC' LIMIT 1), 9.50, 14.50, 18, 10, TRUE),
('PROD-006', 'Crema Pura La Vaquita 500ml', 'Crema de vaca fresca', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-LAC' LIMIT 1), 11.00, 16.00, 6, 12, TRUE),
('PROD-007', 'Pan Baguette Francés (Paquete)', 'Bolsa con 5 unidades', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-PAN' LIMIT 1), 3.00, 5.00, 60, 25, TRUE),
('PROD-008', 'Pan Sandwich Integral Bimbo', 'Pan de molde con semillas', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-PAN' LIMIT 1), 14.50, 21.00, 22, 10, TRUE),
('PROD-009', 'Café Tostado León 400g', 'Café 100% arábigo guatemalteco', (SELECT id_categoria FROM categorias WHERE codigo LIKE 'CAT-ABA%' LIMIT 1), 24.00, 35.00, 35, 15, TRUE),
('PROD-010', 'Aceite Vegetal Capullo 800ml', 'Aceite puro comestible', (SELECT id_categoria FROM categorias WHERE codigo LIKE 'CAT-ABA%' LIMIT 1), 12.00, 17.50, 30, 15, TRUE),
('PROD-011', 'Arroz Blanco Gran Gallo 1 lb', 'Arroz grano largo', (SELECT id_categoria FROM categorias WHERE codigo LIKE 'CAT-ABA%' LIMIT 1), 3.20, 5.00, 80, 20, TRUE),
('PROD-012', 'Frijol Negro Ducal 430g (Lata)', 'Frijoles volteados', (SELECT id_categoria FROM categorias WHERE codigo LIKE 'CAT-ABA%' LIMIT 1), 6.50, 9.75, 4, 15, TRUE),
('PROD-013', 'Detergente Blanca Nieves 1kg', 'Detergente biodegradable', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-LIM' LIMIT 1), 10.00, 15.00, 40, 15, TRUE),
('PROD-014', 'Cloro Magia Blanca 1 Galón', 'Desinfectante concentrado', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-LIM' LIMIT 1), 14.00, 20.00, 16, 10, TRUE),
('PROD-015', 'Libra de Pollo Rey', 'Piezas de pollo frescas', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-CAR' LIMIT 1), 10.50, 15.00, 25, 15, TRUE),
('PROD-016', 'Libra de Carne para Asar', 'Corte fino de res', (SELECT id_categoria FROM categorias WHERE codigo = 'CAT-CAR' LIMIT 1), 28.00, 42.00, 5, 10, TRUE)
ON CONFLICT (codigo) DO UPDATE 
SET existencia = EXCLUDED.existencia,
    stock_minimo = EXCLUDED.stock_minimo,
    precio_compra = EXCLUDED.precio_compra,
    precio_venta = EXCLUDED.precio_venta;

-- 6. COMPRAS INICIALES
INSERT INTO compras (numero_compra, id_proveedor, fecha, id_usuario, total, estado, observaciones) VALUES
('CMP-2026-001', (SELECT id_proveedor FROM proveedores LIMIT 1), '2026-09-10 09:30:00', (SELECT id_usuario FROM usuarios WHERE username = 'admin' LIMIT 1), 1075.00, 'Completada', 'Abastecimiento de lácteos'),
('CMP-2026-002', (SELECT id_proveedor FROM proveedores OFFSET 1 LIMIT 1), '2026-09-15 11:15:00', (SELECT id_usuario FROM usuarios WHERE username = 'admin' LIMIT 1), 1940.00, 'Completada', 'Abastecimiento de abarrotes')
ON CONFLICT (numero_compra) DO NOTHING;

-- 7. DETALLE COMPRAS
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_compra, subtotal)
SELECT c.id_compra, p.id_producto, 100, 8.00, 800.00
FROM compras c, productos p 
WHERE c.numero_compra = 'CMP-2026-001' AND p.codigo = 'PROD-004'
LIMIT 1;

-- 8. VENTAS INICIALES
INSERT INTO ventas (numero_venta, fecha, id_cliente, id_usuario, total, estado, observaciones) VALUES
('VNT-1050', '2026-09-25 10:15:00', (SELECT id_cliente FROM clientes WHERE identificador = 'CLI-002' LIMIT 1), (SELECT id_usuario FROM usuarios WHERE username = 'amorales' LIMIT 1), 74.00, 'Completada', 'Venta demostración Juan Pérez'),
('VNT-1051', '2026-09-26 15:40:00', (SELECT id_cliente FROM clientes WHERE identificador = 'CLI-003' LIMIT 1), (SELECT id_usuario FROM usuarios WHERE username = 'amorales' LIMIT 1), 108.50, 'Completada', 'Venta tarjeta')
ON CONFLICT (numero_venta) DO NOTHING;

-- 9. DETALLE VENTAS
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
SELECT v.id_venta, p.id_producto, 2, 12.00, 24.00
FROM ventas v, productos p 
WHERE v.numero_venta = 'VNT-1050' AND p.codigo = 'PROD-004'
LIMIT 1;

INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
SELECT v.id_venta, p.id_producto, 3, 5.00, 15.00
FROM ventas v, productos p 
WHERE v.numero_venta = 'VNT-1050' AND p.codigo = 'PROD-007'
LIMIT 1;
