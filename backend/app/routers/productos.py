from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Producto, Categoria
from app.schemas import ProductoCreate, ProductoUpdate, ProductoResponse

router = APIRouter(prefix="/api/productos", tags=["Productos"])

def _format_producto(p: Producto) -> dict:
    return {
        "id_producto": p.id_producto,
        "codigo": p.codigo,
        "nombre": p.nombre,
        "descripcion": p.descripcion,
        "id_categoria": p.id_categoria,
        "categoria_nombre": p.categoria.nombre if p.categoria else "Sin Categoría",
        "precio_compra": float(p.precio_compra),
        "precio_venta": float(p.precio_venta),
        "existencia": p.existencia,
        "stock_minimo": p.stock_minimo,
        "bajo_stock": p.existencia <= p.stock_minimo,
        "estado": p.estado,
        "fecha_registro": p.fecha_registro
    }

@router.get("", response_model=List[ProductoResponse])
def get_productos(
    q: Optional[str] = None,
    categoria_id: Optional[int] = None,
    solo_activos: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(Producto)
    if solo_activos:
        query = query.filter(Producto.estado == True)
    if categoria_id:
        query = query.filter(Producto.id_categoria == categoria_id)
    if q:
        query = query.filter(
            or_(
                Producto.nombre.ilike(f"%{q}%"),
                Producto.codigo.ilike(f"%{q}%"),
                Producto.descripcion.ilike(f"%{q}%")
            )
        )
    productos = query.order_by(Producto.nombre.asc()).all()
    return [_format_producto(p) for p in productos]

@router.get("/bajo-stock", response_model=List[ProductoResponse])
def get_productos_bajo_stock(db: Session = Depends(get_db)):
    productos = db.query(Producto).filter(
        Producto.existencia <= Producto.stock_minimo,
        Producto.estado == True
    ).order_by(Producto.existencia.asc()).all()
    return [_format_producto(p) for p in productos]

@router.get("/{id}", response_model=ProductoResponse)
def get_producto(id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id_producto == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _format_producto(producto)

@router.post("", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def create_producto(data: ProductoCreate, db: Session = Depends(get_db)):
    # Validar que exista la categoría
    cat = db.query(Categoria).filter(Categoria.id_categoria == data.id_categoria).first()
    if not cat:
        raise HTTPException(status_code=400, detail="La categoría especificada no existe")

    # Validar regla de negocio de precios
    if data.precio_venta < data.precio_compra:
        raise HTTPException(status_code=400, detail="El precio de venta no puede ser menor al precio de compra")

    # Validar unicidad de código
    existing = db.query(Producto).filter(Producto.codigo == data.codigo).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un producto con el código ingresado")

    nuevo = Producto(**data.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return _format_producto(nuevo)

@router.put("/{id}", response_model=ProductoResponse)
def update_producto(id: int, data: ProductoUpdate, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id_producto == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    update_dict = data.dict(exclude_unset=True)

    # Validar categoría si viene en el payload
    if "id_categoria" in update_dict:
        cat = db.query(Categoria).filter(Categoria.id_categoria == update_dict["id_categoria"]).first()
        if not cat:
            raise HTTPException(status_code=400, detail="La categoría especificada no existe")

    # Validar precios
    p_compra = update_dict.get("precio_compra", producto.precio_compra)
    p_venta = update_dict.get("precio_venta", producto.precio_venta)
    if p_venta < p_compra:
        raise HTTPException(status_code=400, detail="El precio de venta no puede ser menor al precio de compra")

    for key, value in update_dict.items():
        setattr(producto, key, value)

    db.commit()
    db.refresh(producto)
    return _format_producto(producto)

@router.delete("/{id}")
def delete_producto(id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id_producto == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Soft delete
    producto.estado = False
    db.commit()
    return {"message": f"Producto '{producto.nombre}' desactivado correctamente", "id": id}
