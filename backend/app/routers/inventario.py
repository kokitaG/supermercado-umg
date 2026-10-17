from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Producto, Categoria

router = APIRouter(prefix="/api/inventario", tags=["Inventario"])

@router.get("")
def get_inventario(
    q: Optional[str] = None,
    categoria_id: Optional[int] = None,
    estado_stock: Optional[str] = None,  # 'TODOS', 'BAJO', 'OPTIMO', 'AGOTADO'
    db: Session = Depends(get_db)
):
    query = db.query(Producto).outerjoin(Categoria)

    if q:
        query = query.filter(
            or_(
                Producto.nombre.ilike(f"%{q}%"),
                Producto.codigo.ilike(f"%{q}%")
            )
        )

    if categoria_id:
        query = query.filter(Producto.id_categoria == categoria_id)

    productos = query.order_by(Producto.id_producto.asc()).all()

    items = []
    for p in productos:
        if p.existencia == 0:
            estado_inv = "AGOTADO"
        elif p.existencia <= p.stock_minimo:
            estado_inv = "BAJO STOCK"
        else:
            estado_inv = "ÓPTIMO"

        if estado_stock:
            if estado_stock.upper() == "BAJO" and estado_inv != "BAJO STOCK":
                continue
            elif estado_stock.upper() == "AGOTADO" and estado_inv != "AGOTADO":
                continue
            elif estado_stock.upper() == "OPTIMO" and estado_inv != "ÓPTIMO":
                continue

        items.append({
            "id_producto": p.id_producto,
            "codigo": p.codigo,
            "producto": p.nombre,
            "categoria": p.categoria.nombre if p.categoria else "Sin categoría",
            "precio_compra": float(p.precio_compra),
            "precio_venta": float(p.precio_venta),
            "existencia": p.existencia,
            "stock_minimo": p.stock_minimo,
            "estado_inventario": estado_inv,
            "valor_inventario_costo": round(float(p.precio_compra) * p.existencia, 2),
            "valor_inventario_venta": round(float(p.precio_venta) * p.existencia, 2)
        })

    return items
