from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Proveedor
from app.schemas import ProveedorCreate, ProveedorUpdate, ProveedorResponse

router = APIRouter(prefix="/api/proveedores", tags=["Proveedores"])

@router.get("", response_model=List[ProveedorResponse])
def get_proveedores(q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Proveedor)
    if q:
        query = query.filter(
            or_(
                Proveedor.nombre_proveedor.ilike(f"%{q}%"),
                Proveedor.nit.ilike(f"%{q}%"),
                Proveedor.identificador.ilike(f"%{q}%"),
                Proveedor.nombre_contacto.ilike(f"%{q}%")
            )
        )
    return query.order_by(Proveedor.id_proveedor.asc()).all()

@router.get("/{id}", response_model=ProveedorResponse)
def get_proveedor(id: int, db: Session = Depends(get_db)):
    prov = db.query(Proveedor).filter(Proveedor.id_proveedor == id).first()
    if not prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return prov

@router.post("", response_model=ProveedorResponse, status_code=status.HTTP_201_CREATED)
def create_proveedor(data: ProveedorCreate, db: Session = Depends(get_db)):
    existing = db.query(Proveedor).filter(Proveedor.identificador == data.identificador).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un proveedor con ese identificador")

    nuevo = Proveedor(**data.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/{id}", response_model=ProveedorResponse)
def update_proveedor(id: int, data: ProveedorUpdate, db: Session = Depends(get_db)):
    prov = db.query(Proveedor).filter(Proveedor.id_proveedor == id).first()
    if not prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    update_dict = data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(prov, key, value)

    db.commit()
    db.refresh(prov)
    return prov

@router.delete("/{id}")
def delete_proveedor(id: int, db: Session = Depends(get_db)):
    prov = db.query(Proveedor).filter(Proveedor.id_proveedor == id).first()
    if not prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    prov.estado = False
    db.commit()
    return {"message": f"Proveedor '{prov.nombre_proveedor}' desactivado correctamente", "id": id}
