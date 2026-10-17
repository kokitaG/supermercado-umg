import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from app.database import get_db
from app.models import Producto, Categoria, Venta, DetalleVenta, Cliente, Proveedor, Compra

router = APIRouter(prefix="/api/reportes", tags=["Reportes"])

# ============================================================================
# REPORTE 1: Productos más vendidos
# ============================================================================
@router.get("/productos-mas-vendidos")
def reporte_productos_mas_vendidos(db: Session = Depends(get_db)):
    results = (
        db.query(
            Producto.codigo,
            Producto.nombre.label("producto"),
            Categoria.nombre.label("categoria"),
            func.sum(DetalleVenta.cantidad).label("total_vendido"),
            func.sum(DetalleVenta.subtotal).label("total_quetzales")
        )
        .join(Categoria, Producto.id_categoria == Categoria.id_categoria)
        .join(DetalleVenta, Producto.id_producto == DetalleVenta.id_producto)
        .join(Venta, DetalleVenta.id_venta == Venta.id_venta)
        .filter(Venta.estado == "Completada")
        .group_by(Producto.id_producto, Producto.codigo, Producto.nombre, Categoria.nombre)
        .order_by(func.sum(DetalleVenta.cantidad).desc())
        .all()
    )
    return [
        {
            "codigo": r.codigo,
            "producto": r.producto,
            "categoria": r.categoria,
            "total_vendido": int(r.total_vendido),
            "total_quetzales": float(r.total_quetzales)
        }
        for r in results
    ]


# ============================================================================
# REPORTE 2: Productos con inventario bajo
# ============================================================================
@router.get("/inventario-bajo")
def reporte_inventario_bajo(db: Session = Depends(get_db)):
    results = (
        db.query(
            Producto.codigo,
            Producto.nombre.label("producto"),
            Categoria.nombre.label("categoria"),
            Producto.existencia,
            Producto.stock_minimo,
            (Producto.stock_minimo - Producto.existencia).label("deficit")
        )
        .join(Categoria, Producto.id_categoria == Categoria.id_categoria)
        .filter(Producto.existencia <= Producto.stock_minimo, Producto.estado == True)
        .order_by((Producto.stock_minimo - Producto.existencia).desc())
        .all()
    )
    return [
        {
            "codigo": r.codigo,
            "producto": r.producto,
            "categoria": r.categoria,
            "existencia": r.existencia,
            "stock_minimo": r.stock_minimo,
            "deficit": r.deficit,
            "estado": "AGOTADO" if r.existencia == 0 else "CRÍTICO"
        }
        for r in results
    ]


# ============================================================================
# REPORTE 3: Ventas por rango de fechas
# ============================================================================
@router.get("/ventas-rango-fechas")
def reporte_ventas_rango_fechas(
    fecha_inicio: Optional[str] = Query(None, description="Formato YYYY-MM-DD"),
    fecha_fin: Optional[str] = Query(None, description="Formato YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    query = db.query(Venta).join(Cliente)

    if fecha_inicio:
        try:
            d_ini = datetime.datetime.strptime(fecha_inicio, "%Y-%m-%d")
            query = query.filter(Venta.fecha >= d_ini)
        except ValueError:
            pass

    if fecha_fin:
        try:
            d_fin = datetime.datetime.strptime(f"{fecha_fin} 23:59:59", "%Y-%m-%d %H:%M:%S")
            query = query.filter(Venta.fecha <= d_fin)
        except ValueError:
            pass

    ventas = query.order_by(Venta.fecha.desc()).all()

    total_acumulado = sum(float(v.total) for v in ventas)

    return {
        "total_registros": len(ventas),
        "total_acumulado_quetzales": round(total_acumulado, 2),
        "ventas": [
            {
                "id_venta": v.id_venta,
                "numero_venta": v.numero_venta,
                "fecha": v.fecha.strftime("%Y-%m-%d %H:%M"),
                "cliente": f"{v.cliente.nombres} {v.cliente.apellidos}",
                "nit": v.cliente.nit,
                "total": float(v.total),
                "estado": v.estado
            }
            for v in ventas
        ]
    }


# ============================================================================
# REPORTE 4: Ventas por cliente
# ============================================================================
@router.get("/ventas-por-cliente")
def reporte_ventas_por_cliente(db: Session = Depends(get_db)):
    results = (
        db.query(
            Cliente.identificador,
            Cliente.nombres,
            Cliente.apellidos,
            Cliente.nit,
            func.count(Venta.id_venta).label("total_compras"),
            func.coalesce(func.sum(Venta.total), 0.0).label("monto_total"),
            func.coalesce(func.avg(Venta.total), 0.0).label("promedio_compra")
        )
        .outerjoin(Venta, (Cliente.id_cliente == Venta.id_cliente) & (Venta.estado == "Completada"))
        .group_by(Cliente.id_cliente, Cliente.identificador, Cliente.nombres, Cliente.apellidos, Cliente.nit)
        .order_by(func.coalesce(func.sum(Venta.total), 0.0).desc())
        .all()
    )

    return [
        {
            "identificador": r.identificador,
            "cliente": f"{r.nombres} {r.apellidos}",
            "nit": r.nit,
            "total_compras": int(r.total_compras),
            "monto_total": float(r.monto_total),
            "promedio_compra": round(float(r.promedio_compra), 2)
        }
        for r in results
    ]


# ============================================================================
# ENDPOINT ACADÉMICO UMG: Visor interactivo de las 10 Consultas SQL
# ============================================================================
CONSULTAS_CATALOGO = {
    1: {
        "titulo": "1. Mostrar todos los productos con su categoría",
        "sql": """SELECT p.codigo, p.nombre AS producto, c.nombre AS categoria, 
                  p.precio_compra, p.precio_venta, p.existencia, p.stock_minimo 
                  FROM productos p INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
                  ORDER BY c.nombre ASC, p.nombre ASC"""
    },
    2: {
        "titulo": "2. Mostrar los productos cuyo inventario se encuentre por debajo del stock mínimo",
        "sql": """SELECT p.codigo, p.nombre AS producto, c.nombre AS categoria, 
                  p.existencia, p.stock_minimo, (p.stock_minimo - p.existencia) AS faltante
                  FROM productos p INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
                  WHERE p.existencia < p.stock_minimo ORDER BY (p.stock_minimo - p.existencia) DESC"""
    },
    3: {
        "titulo": "3. Mostrar las ventas realizadas en un rango de fechas",
        "sql": """SELECT v.numero_venta, v.fecha, (cl.nombres || ' ' || cl.apellidos) AS cliente, 
                  cl.nit, v.total, v.estado 
                  FROM ventas v INNER JOIN clientes cl ON v.id_cliente = cl.id_cliente 
                  ORDER BY v.fecha DESC"""
    },
    4: {
        "titulo": "4. Mostrar los productos más vendidos",
        "sql": """SELECT p.codigo, p.nombre AS producto, c.nombre AS categoria, 
                  SUM(dv.cantidad) AS unidades_vendidas, SUM(dv.subtotal) AS total_quetzales 
                  FROM detalle_ventas dv INNER JOIN productos p ON dv.id_producto = p.id_producto 
                  INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
                  GROUP BY p.codigo, p.nombre, c.nombre ORDER BY unidades_vendidas DESC"""
    },
    5: {
        "titulo": "5. Mostrar los clientes que más compras han realizado",
        "sql": """SELECT cl.identificador, (cl.nombres || ' ' || cl.apellidos) AS cliente, cl.nit, 
                  COUNT(v.id_venta) AS cantidad_compras, SUM(v.total) AS total_gastado 
                  FROM clientes cl INNER JOIN ventas v ON cl.id_cliente = v.id_cliente 
                  WHERE v.estado = 'Completada' 
                  GROUP BY cl.id_cliente, cl.identificador, cl.nombres, cl.apellidos, cl.nit 
                  ORDER BY cantidad_compras DESC, total_gastado DESC"""
    },
    6: {
        "titulo": "6. Mostrar las ventas agrupadas por cliente",
        "sql": """SELECT cl.identificador, (cl.nombres || ' ' || cl.apellidos) AS cliente, 
                  COUNT(v.id_venta) AS facturas, COALESCE(SUM(v.total), 0) AS total_facturado 
                  FROM clientes cl LEFT JOIN ventas v ON cl.id_cliente = v.id_cliente AND v.estado = 'Completada' 
                  GROUP BY cl.id_cliente, cl.identificador, cl.nombres, cl.apellidos 
                  ORDER BY total_facturado DESC"""
    },
    7: {
        "titulo": "7. Mostrar el total de compras realizadas a cada proveedor",
        "sql": """SELECT pr.identificador, pr.nombre_proveedor, pr.nit, 
                  COUNT(c.id_compra) AS total_ordenes, COALESCE(SUM(c.total), 0) AS monto_comprado 
                  FROM proveedores pr LEFT JOIN compras c ON pr.id_proveedor = c.id_proveedor AND c.estado = 'Completada' 
                  GROUP BY pr.id_proveedor, pr.identificador, pr.nombre_proveedor, pr.nit 
                  ORDER BY monto_comprado DESC"""
    },
    8: {
        "titulo": "8. Mostrar el total vendido por categoría",
        "sql": """SELECT cat.codigo, cat.nombre AS categoria, 
                  SUM(dv.cantidad) AS total_unidades, SUM(dv.subtotal) AS total_ingresos 
                  FROM categorias cat INNER JOIN productos p ON cat.id_categoria = p.id_categoria 
                  INNER JOIN detalle_ventas dv ON p.id_producto = dv.id_producto 
                  INNER JOIN ventas v ON dv.id_venta = v.id_venta 
                  WHERE v.estado = 'Completada' 
                  GROUP BY cat.id_categoria, cat.codigo, cat.nombre ORDER BY total_ingresos DESC"""
    },
    9: {
        "titulo": "9. Mostrar el promedio de venta por cliente",
        "sql": """SELECT cl.identificador, (cl.nombres || ' ' || cl.apellidos) AS cliente, 
                  COUNT(v.id_venta) AS ventas, ROUND(AVG(v.total), 2) AS promedio_venta 
                  FROM clientes cl INNER JOIN ventas v ON cl.id_cliente = v.id_cliente 
                  WHERE v.estado = 'Completada' 
                  GROUP BY cl.id_cliente, cl.identificador, cl.nombres, cl.apellidos 
                  ORDER BY promedio_venta DESC"""
    },
    10: {
        "titulo": "10. Mostrar los cinco productos que generan mayores ingresos",
        "sql": """SELECT p.codigo, p.nombre AS producto, c.nombre AS categoria, 
                  SUM(dv.subtotal) AS ingreso_total 
                  FROM detalle_ventas dv INNER JOIN productos p ON dv.id_producto = p.id_producto 
                  INNER JOIN categorias c ON p.id_categoria = c.id_categoria 
                  INNER JOIN ventas v ON dv.id_venta = v.id_venta 
                  WHERE v.estado = 'Completada' 
                  GROUP BY p.id_producto, p.codigo, p.nombre, c.nombre 
                  ORDER BY ingreso_total DESC LIMIT 5"""
    }
}

@router.get("/consultas-sql/{num}")
def ejecutar_consulta_academica(num: int, db: Session = Depends(get_db)):
    if num not in CONSULTAS_CATALOGO:
        return {"error": "Número de consulta no válido (debe ser del 1 al 10)"}

    info = CONSULTAS_CATALOGO[num]
    try:
        raw_result = db.execute(text(info["sql"])).mappings().all()
        data = [dict(row) for row in raw_result]
        return {
            "numero": num,
            "titulo": info["titulo"],
            "sentencia_sql": info["sql"],
            "filas_retornadas": len(data),
            "resultados": data
        }
    except Exception as e:
        return {
            "numero": num,
            "titulo": info["titulo"],
            "sentencia_sql": info["sql"],
            "error": str(e)
        }
