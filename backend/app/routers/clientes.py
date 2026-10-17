from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Cliente
from app.schemas import ClienteCreate, ClienteUpdate, ClienteResponse

router = APIRouter(prefix="/api/clientes", tags=["Clientes"])

def _format_cliente(c: Cliente) -> dict:
    return {
        "id_cliente": c.id_cliente,
        "identificador": c.identificador,
        "nombres": c.nombres,
        "apellidos": c.apellidos,
        "nombre_completo": f"{c.nombres} {c.apellidos}",
        "nit": c.nit,
        "telefono": c.telefono,
        "correo": c.correo,
        "direccion": c.direccion,
        "estado": c.estado,
        "fecha_registro": c.fecha_registro
    }

@router.get("", response_model=List[ClienteResponse])
def get_clientes(q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Cliente)
    if q:
        query = query.filter(
            or_(
                Cliente.nombres.ilike(f"%{q}%"),
                Cliente.apellidos.ilike(f"%{q}%"),
                Cliente.nit.ilike(f"%{q}%"),
                Cliente.identificador.ilike(f"%{q}%")
            )
        )
    clientes = query.order_by(Cliente.id_cliente.asc()).all()
    return [_format_cliente(c) for c in clientes]

@router.get("/{id}", response_model=ClienteResponse)
def get_cliente(id: int, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id_cliente == id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return _format_cliente(cliente)

@router.post("", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def create_cliente(data: ClienteCreate, db: Session = Depends(get_db)):
    existing = db.query(Cliente).filter(Cliente.identificador == data.identificador).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un cliente con ese identificador")

    nuevo = Cliente(**data.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return _format_cliente(nuevo)

@router.put("/{id}", response_model=ClienteResponse)
def update_cliente(id: int, data: ClienteUpdate, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id_cliente == id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    update_dict = data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(cliente, key, value)

    db.commit()
    db.refresh(cliente)
    return _format_cliente(cliente)

@router.delete("/{id}")
def delete_cliente(id: int, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id_cliente == id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    cliente.estado = False
    db.commit()
    return {"message": f"Cliente {cliente.nombres} {cliente.apellidos} desactivado correctamente", "id": id}
