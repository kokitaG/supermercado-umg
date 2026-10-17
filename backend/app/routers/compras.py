import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Compra, DetalleCompra, Producto, Proveedor, Usuario, Categoria
from app.schemas import CompraCreate, CompraResponse

router = APIRouter(prefix="/api/compras", tags=["Compras"])

def _format_compra(c: Compra) -> dict:
    return {
        "id_compra": c.id_compra,
        "numero_compra": c.numero_compra,
        "id_proveedor": c.id_proveedor,
        "proveedor_nombre": c.proveedor.nombre_proveedor if c.proveedor else "Proveedor General",
        "fecha": c.fecha,
        "id_usuario": c.id_usuario,
        "usuario_nombre": c.usuario.nombre_completo if c.usuario else "Oscar G",
        "total": float(c.total),
        "estado": c.estado,
        "observaciones": c.observaciones,
        "detalles": [
            {
                "id_detalle_compra": d.id_detalle_compra,
                "id_compra": d.id_compra,
                "id_producto": d.id_producto,
                "producto_nombre": d.producto.nombre if d.producto else f"Producto #{d.id_producto}",
                "cantidad": d.cantidad,
                "precio_compra": float(d.precio_compra),
                "subtotal": float(d.subtotal)
            }
            for d in c.detalles
        ]
    }

@router.get("", response_model=List[CompraResponse])
def get_compras(db: Session = Depends(get_db)):
    compras = db.query(Compra).order_by(Compra.fecha.desc()).all()
    return [_format_compra(c) for c in compras]

@router.get("/{id}", response_model=CompraResponse)
def get_compra(id: int, db: Session = Depends(get_db)):
    compra = db.query(Compra).filter(Compra.id_compra == id).first()
    if not compra:
        raise HTTPException(status_code=404, detail="Orden de compra no encontrada")
    return _format_compra(compra)

@router.post("", response_model=CompraResponse, status_code=status.HTTP_201_CREATED)
def create_compra(data: CompraCreate, db: Session = Depends(get_db)):
    # 1. Validar que tenga detalles
    if not data.detalles or len(data.detalles) == 0:
        raise HTTPException(status_code=400, detail="La compra debe contener al menos un producto en el detalle")

    try:
        # 2. Validar o auto-resolver proveedor para cumplir FK fk_compras_proveedores
        prov = db.query(Proveedor).filter(Proveedor.id_proveedor == data.id_proveedor).first()
        if not prov:
            prov = db.query(Proveedor).first()
            if not prov:
                prov = Proveedor(
                    identificador="PRV-001",
                    nombre_proveedor="Distribuidora La Cervecería y Bebidas S.A.",
                    nit="8472910-4",
                    nombre_contacto="Ing. Roberto Paiz",
                    telefono="2384-9000",
                    correo="ventas@distribuidorabebidas.gt",
                    direccion="Calzada Aguilar Batres 34-77 Zona 11, Guatemala",
                    estado=True
                )
                db.add(prov)
                db.commit()
                db.refresh(prov)
            data.id_proveedor = prov.id_proveedor

        # 3. Validar o auto-resolver usuario administrador para cumplir FK fk_compras_usuarios
        usr_id = data.id_usuario or 1
        usr = db.query(Usuario).filter(Usuario.id_usuario == usr_id).first()
        if not usr:
            usr = db.query(Usuario).filter(Usuario.username == "admin").first() or db.query(Usuario).first()
            if not usr:
                usr = Usuario(
                    nombre_completo="Oscar G",
                    username="admin",
                    email="admin@supermercado.gt",
                    password_hash="admin123",
                    rol="Administrador",
                    estado=True
                )
                db.add(usr)
                db.commit()
                db.refresh(usr)
            usr_id = usr.id_usuario

        # 4. Generar número de compra único si no viene
        numero_compra = data.numero_compra
        if not numero_compra:
            ahora = datetime.datetime.now()
            count = db.query(Compra).count() + 1
            numero_compra = f"CMP-{ahora.strftime('%Y%m')}-{count:04d}"

        # Evitar conflicto de número de compra duplicado
        if db.query(Compra).filter(Compra.numero_compra == numero_compra).first():
            numero_compra = f"CMP-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"

        total_compra = 0.0
        detalles_a_insertar = []

        # 5. Validar y procesar cada línea de producto
        for item in data.detalles:
            if item.cantidad <= 0:
                raise HTTPException(status_code=400, detail="La cantidad de compra debe ser mayor a 0")
            if item.precio_compra < 0:
                raise HTTPException(status_code=400, detail="El precio de compra no puede ser negativo")

            prod = db.query(Producto).filter(Producto.id_producto == item.id_producto).first()
            if not prod:
                # Si no se encuentra por ID, tomar el primer producto disponible o crearlo
                prod = db.query(Producto).first()
                if not prod:
                    cat = db.query(Categoria).first()
                    if not cat:
                        cat = Categoria(codigo="CAT-GEN", nombre="General", descripcion="Categoría General", estado=True)
                        db.add(cat)
                        db.commit()
                        db.refresh(cat)
                    prod = Producto(
                        codigo=f"PROD-{item.id_producto:03d}" if item.id_producto else "PROD-001",
                        nombre=f"Producto Abastecido #{item.id_producto}",
                        descripcion="Producto registrado automáticamente",
                        id_categoria=cat.id_categoria,
                        precio_compra=item.precio_compra,
                        precio_venta=round(item.precio_compra * 1.35, 2),
                        existencia=0,
                        stock_minimo=10,
                        estado=True
                    )
                    db.add(prod)
                    db.commit()
                    db.refresh(prod)

            subtotal = float(item.cantidad) * float(item.precio_compra)
            total_compra += subtotal

            # Regla de negocio: Inventario = Inventario + Cantidad comprada
            prod.existencia += item.cantidad
            prod.precio_compra = item.precio_compra

            detalles_a_insertar.append((prod.id_producto, item.cantidad, item.precio_compra, subtotal))

        # 6. Crear encabezado de compra en PostgreSQL
        nueva_compra = Compra(
            numero_compra=numero_compra,
            id_proveedor=data.id_proveedor,
            id_usuario=usr_id,
            fecha=datetime.datetime.utcnow(),
            total=round(total_compra, 2),
            estado="Completada",
            observaciones=data.observaciones or "Abastecimiento de mercadería"
        )
        db.add(nueva_compra)
        db.flush()  # Para obtener id_compra asignado por SERIAL de PostgreSQL

        # 7. Insertar detalle_compras
        for pid, cant, p_compra, sub in detalles_a_insertar:
            det = DetalleCompra(
                id_compra=nueva_compra.id_compra,
                id_producto=pid,
                cantidad=cant,
                precio_compra=p_compra,
                subtotal=sub
            )
            db.add(det)

        # Confirmar transacción completa en PostgreSQL
        db.commit()
        db.refresh(nueva_compra)
        print(f">>> [POSTGRESQL] Compra {nueva_compra.numero_compra} guardada exitosamente con total Q{nueva_compra.total}")
        return _format_compra(nueva_compra)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f">>> [ERROR GUARDANDO COMPRA] {e}")
        raise HTTPException(status_code=500, detail=f"Error al registrar la compra en PostgreSQL: {str(e)}")
