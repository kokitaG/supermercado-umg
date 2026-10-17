-- ============================================================================
-- UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA
-- Cursos: Bases de Datos I & Desarrollo Web
-- Script: consultas_requeridas.sql
-- Las 10 Consultas SQL obligatorias evaluadas en Bases de Datos I
-- Emplea: WHERE, ORDER BY, GROUP BY, HAVING, INNER JOIN, LEFT JOIN,
--         COUNT(), SUM(), AVG(), MIN(), MAX()
-- ============================================================================

-- ============================================================================
-- CONSULTA 1: Mostrar todos los productos con su categoría
-- Cláusulas: INNER JOIN, ORDER BY
-- ============================================================================
SELECT 
    p.codigo AS codigo_producto,
    p.nombre AS nombre_producto,
    c.nombre AS nombre_categoria,
    p.precio_compra,
    p.precio_venta,
    p.existencia,
    p.stock_minimo,
    CASE 
        WHEN p.estado = TRUE THEN 'Activo' 
        ELSE 'Inactivo' 
    END AS estado
FROM productos p
INNER JOIN categorias c ON p.id_categoria = c.id_categoria
ORDER BY c.nombre ASC, p.nombre ASC;


-- ============================================================================
-- CONSULTA 2: Mostrar los productos cuyo inventario se encuentre por debajo del stock mínimo
-- Cláusulas: INNER JOIN, WHERE, ORDER BY
-- ============================================================================
SELECT 
    p.codigo,
    p.nombre AS producto,
    c.nombre AS categoria,
    p.existencia,
    p.stock_minimo,
    (p.stock_minimo - p.existencia) AS faltante_para_minimo,
    'ALERTA REABASTECER' AS estado_alerta
FROM productos p
INNER JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE p.existencia < p.stock_minimo
  AND p.estado = TRUE
ORDER BY (p.stock_minimo - p.existencia) DESC;


-- ============================================================================
-- CONSULTA 3: Mostrar las ventas realizadas en un rango de fechas
-- Cláusulas: INNER JOIN, WHERE (BETWEEN), ORDER BY
-- Parámetros de ejemplo: '2026-09-01' a '2026-10-31'
-- ============================================================================
SELECT 
    v.numero_venta,
    v.fecha,
    CONCAT(cl.nombres, ' ', cl.apellidos) AS cliente,
    cl.nit,
    u.nombre_completo AS cajero_responsable,
    v.total,
    v.estado
FROM ventas v
INNER JOIN clientes cl ON v.id_cliente = cl.id_cliente
INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
WHERE v.fecha BETWEEN '2026-09-01 00:00:00' AND '2026-10-31 23:59:59'
ORDER BY v.fecha DESC;


-- ============================================================================
-- CONSULTA 4: Mostrar los productos más vendidos
-- Cláusulas: INNER JOIN, GROUP BY, SUM(), ORDER BY DESC
-- ============================================================================
SELECT 
    p.codigo,
    p.nombre AS producto,
    c.nombre AS categoria,
    COUNT(DISTINCT dv.id_venta) AS transacciones_presente,
    SUM(dv.cantidad) AS total_unidades_vendidas,
    SUM(dv.subtotal) AS total_recaudado_quetzales
FROM detalle_ventas dv
INNER JOIN productos p ON dv.id_producto = p.id_producto
INNER JOIN categorias c ON p.id_categoria = c.id_categoria
GROUP BY p.codigo, p.nombre, c.nombre
ORDER BY total_unidades_vendidas DESC;


-- ============================================================================
-- CONSULTA 5: Mostrar los clientes que más compras han realizado
-- Cláusulas: INNER JOIN, GROUP BY, COUNT(), SUM(), ORDER BY DESC
-- ============================================================================
SELECT 
    cl.identificador,
    CONCAT(cl.nombres, ' ', cl.apellidos) AS nombre_cliente,
    cl.nit,
    COUNT(v.id_venta) AS cantidad_ventas_realizadas,
    SUM(v.total) AS monto_total_gastado,
    ROUND(AVG(v.total), 2) AS ticket_promedio
FROM clientes cl
INNER JOIN ventas v ON cl.id_cliente = v.id_cliente
WHERE v.estado = 'Completada'
GROUP BY cl.id_cliente, cl.identificador, cl.nombres, cl.apellidos, cl.nit
ORDER BY cantidad_ventas_realizadas DESC, monto_total_gastado DESC;


-- ============================================================================
-- CONSULTA 6: Mostrar las ventas agrupadas por cliente
-- Cláusulas: LEFT JOIN (para incluir todos los clientes, incluso sin compras),
--            GROUP BY, COUNT(), SUM(), COALESCE()
-- ============================================================================
SELECT 
    cl.identificador,
    CONCAT(cl.nombres, ' ', cl.apellidos) AS cliente,
    cl.nit,
    cl.telefono,
    COUNT(v.id_venta) AS total_facturas,
    COALESCE(SUM(v.total), 0.00) AS total_facturado,
    COALESCE(MIN(v.total), 0.00) AS compra_minima,
    COALESCE(MAX(v.total), 0.00) AS compra_maxima
FROM clientes cl
LEFT JOIN ventas v ON cl.id_cliente = v.id_cliente AND v.estado = 'Completada'
GROUP BY cl.id_cliente, cl.identificador, cl.nombres, cl.apellidos, cl.nit, cl.telefono
ORDER BY total_facturado DESC;


-- ============================================================================
-- CONSULTA 7: Mostrar el total de compras realizadas a cada proveedor
-- Cláusulas: LEFT JOIN, GROUP BY, COUNT(), SUM(), ORDER BY DESC
-- ============================================================================
SELECT 
    pr.identificador,
    pr.nombre_proveedor,
    pr.nit,
    pr.telefono,
    COUNT(c.id_compra) AS total_ordenes_compra,
    COALESCE(SUM(c.total), 0.00) AS monto_total_comprado,
    COALESCE(AVG(c.total), 0.00) AS promedio_por_orden
FROM proveedores pr
LEFT JOIN compras c ON pr.id_proveedor = c.id_proveedor AND c.estado = 'Completada'
GROUP BY pr.id_proveedor, pr.identificador, pr.nombre_proveedor, pr.nit, pr.telefono
ORDER BY monto_total_comprado DESC;


-- ============================================================================
-- CONSULTA 8: Mostrar el total vendido por categoría
-- Cláusulas: INNER JOIN, GROUP BY, SUM(), ORDER BY DESC
-- ============================================================================
SELECT 
    cat.codigo AS codigo_categoria,
    cat.nombre AS categoria,
    COUNT(DISTINCT v.id_venta) AS cantidad_facturas_con_categoria,
    SUM(dv.cantidad) AS total_unidades_vendidas,
    SUM(dv.subtotal) AS total_ingresos_quetzales
FROM categorias cat
INNER JOIN productos p ON cat.id_categoria = p.id_categoria
INNER JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
INNER JOIN ventas v ON dv.id_venta = v.id_venta
WHERE v.estado = 'Completada'
GROUP BY cat.id_categoria, cat.codigo, cat.nombre
ORDER BY total_ingresos_quetzales DESC;


-- ============================================================================
-- CONSULTA 9: Mostrar el promedio de venta por cliente (con filtro HAVING)
-- Cláusulas: INNER JOIN, GROUP BY, HAVING, AVG(), COUNT(), SUM()
-- ============================================================================
SELECT 
    cl.identificador,
    CONCAT(cl.nombres, ' ', cl.apellidos) AS cliente,
    cl.nit,
    COUNT(v.id_venta) AS numero_ventas,
    SUM(v.total) AS total_acumulado,
    ROUND(AVG(v.total), 2) AS promedio_por_venta
FROM clientes cl
INNER JOIN ventas v ON cl.id_cliente = v.id_cliente
WHERE v.estado = 'Completada'
GROUP BY cl.id_cliente, cl.identificador, cl.nombres, cl.apellidos, cl.nit
HAVING COUNT(v.id_venta) >= 1
ORDER BY promedio_por_venta DESC;


-- ============================================================================
-- CONSULTA 10: Mostrar los cinco productos que generan mayores ingresos
-- Cláusulas: INNER JOIN, GROUP BY, SUM(), ORDER BY DESC, LIMIT 5
-- ============================================================================
SELECT 
    p.codigo,
    p.nombre AS producto,
    c.nombre AS categoria,
    p.precio_venta,
    SUM(dv.cantidad) AS unidades_vendidas,
    SUM(dv.subtotal) AS ingreso_total_generado
FROM detalle_ventas dv
INNER JOIN productos p ON dv.id_producto = p.id_producto
INNER JOIN categorias c ON p.id_categoria = c.id_categoria
INNER JOIN ventas v ON dv.id_venta = v.id_venta
WHERE v.estado = 'Completada'
GROUP BY p.id_producto, p.codigo, p.nombre, c.nombre, p.precio_venta
ORDER BY ingreso_total_generado DESC
LIMIT 5;
