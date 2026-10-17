from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Categoria
from app.schemas import CategoriaCreate, CategoriaUpdate, CategoriaResponse

router = APIRouter(prefix="/api/categorias", tags=["Categorías"])

@router.get("", response_model=List[CategoriaResponse])
def get_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).order_by(Categoria.nombre.asc()).all()

@router.get("/{id}", response_model=CategoriaResponse)
def get_categoria(id: int, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id_categoria == id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria

@router.post("", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
def create_categoria(data: CategoriaCreate, db: Session = Depends(get_db)):
    # Validar duplicados de código o nombre
    existing = db.query(Categoria).filter((Categoria.codigo == data.codigo) | (Categoria.nombre == data.nombre)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese código o nombre")

    nueva = Categoria(**data.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@router.put("/{id}", response_model=CategoriaResponse)
def update_categoria(id: int, data: CategoriaUpdate, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id_categoria == id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    update_dict = data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(categoria, key, value)

    db.commit()
    db.refresh(categoria)
    return categoria

@router.delete("/{id}")
def delete_categoria(id: int, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id_categoria == id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    # Soft delete: desactivar
    categoria.estado = False
    db.commit()
    return {"message": f"Categoría {categoria.nombre} desactivada correctamente", "id": id}
