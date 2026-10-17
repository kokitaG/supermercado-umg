import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Venta, DetalleVenta, Producto, Cliente, Usuario
from app.schemas import VentaCreate, VentaResponse

router = APIRouter(prefix="/api/ventas", tags=["Ventas (POS)"])

def _format_venta(v: Venta) -> dict:
    return {
        "id_venta": v.id_venta,
        "numero_venta": v.numero_venta,
        "fecha": v.fecha,
        "id_cliente": v.id_cliente,
        "cliente_nombre": f"{v.cliente.nombres} {v.cliente.apellidos}" if v.cliente else "Consumidor Final",
        "cliente_nit": v.cliente.nit if v.cliente else "C/F",
        "id_usuario": v.id_usuario,
        "usuario_nombre": v.usuario.nombre_completo if v.usuario else "Oscar G",
        "total": float(v.total),
        "estado": v.estado,
        "observaciones": v.observaciones,
        "detalles": [
            {
                "id_detalle_venta": d.id_detalle_venta,
                "id_venta": d.id_venta,
                "id_producto": d.id_producto,
                "producto_nombre": d.producto.nombre if d.producto else "Producto",
                "cantidad": d.cantidad,
                "precio_unitario": float(d.precio_unitario),
                "subtotal": float(d.subtotal)
            }
            for d in v.detalles
        ]
    }

@router.get("", response_model=List[VentaResponse])
def get_ventas(db: Session = Depends(get_db)):
    ventas = db.query(Venta).order_by(Venta.fecha.desc()).all()
    return [_format_venta(v) for v in ventas]

@router.get("/{id}", response_model=VentaResponse)
def get_venta(id: int, db: Session = Depends(get_db)):
    venta = db.query(Venta).filter(Venta.id_venta == id).first()
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return _format_venta(venta)

@router.post("", response_model=VentaResponse, status_code=status.HTTP_201_CREATED)
def create_venta(data: VentaCreate, db: Session = Depends(get_db)):
    # 1. Validar que tenga detalles
    if not data.detalles or len(data.detalles) == 0:
        raise HTTPException(status_code=400, detail="La venta debe contener al menos un producto")

    try:
        # 2. Validar o auto-resolver cliente para cumplir FK fk_ventas_clientes
        cliente = db.query(Cliente).filter(Cliente.id_cliente == data.id_cliente).first()
        if not cliente:
            cliente = db.query(Cliente).first()
            if not cliente:
                cliente = Cliente(
                    identificador="CLI-001",
                    nombres="Consumidor",
                    apellidos="Final",
                    nit="C/F",
                    telefono="0000-0000",
                    correo="cf@supermercado.gt",
                    direccion="Ciudad de Guatemala",
                    estado=True
                )
                db.add(cliente)
                db.commit()
                db.refresh(cliente)
            data.id_cliente = cliente.id_cliente

        # 3. Validar o auto-resolver usuario cajero/admin para cumplir FK fk_ventas_usuarios
        usr_id = data.id_usuario or 1
        usr = db.query(Usuario).filter(Usuario.id_usuario == usr_id).first()
        if not usr:
            usr = db.query(Usuario).first()
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

        # 4. Generar número de venta si no viene
        numero_venta = data.numero_venta
        if not numero_venta:
            count = db.query(Venta).count() + 1001
            numero_venta = f"VNT-{count}"

        if db.query(Venta).filter(Venta.numero_venta == numero_venta).first():
            numero_venta = f"VNT-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"

        total_venta = 0.0
        detalles_a_insertar = []

        # 5. Validar disponibilidad de inventario para TODOS los productos ANTES de modificar nada
        for item in data.detalles:
            if item.cantidad <= 0:
                raise HTTPException(status_code=400, detail="La cantidad vendida debe ser mayor a 0")

            prod = db.query(Producto).filter(Producto.id_producto == item.id_producto).first()
            if not prod:
                prod = db.query(Producto).first()
                if not prod:
                    raise HTTPException(status_code=400, detail=f"No hay productos disponibles para facturar")

            if not prod.estado:
                raise HTTPException(status_code=400, detail=f"El producto '{prod.nombre}' está desactivado")

            # REGLA DE NEGOCIO OBLIGATORIA: No permitir venta sin inventario suficiente
            if prod.existencia < item.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para '{prod.nombre}'. Existencia actual: {prod.existencia}, solicitada: {item.cantidad}"
                )

            subtotal = float(item.cantidad) * float(item.precio_unitario)
            total_venta += subtotal

            # Descontar inventario: Inventario = Inventario - Cantidad vendida
            prod.existencia -= item.cantidad

            detalles_a_insertar.append((prod.id_producto, item.cantidad, item.precio_unitario, subtotal))

        # 6. Crear encabezado de venta
        nueva_venta = Venta(
            numero_venta=numero_venta,
            fecha=datetime.datetime.utcnow(),
            id_cliente=data.id_cliente,
            id_usuario=usr_id,
            total=round(total_venta, 2),
            estado="Completada",
            observaciones=data.observaciones or "Venta en caja registradora"
        )
        db.add(nueva_venta)
        db.flush()

        # 7. Insertar detalle_ventas
        for pid, cant, p_unit, sub in detalles_a_insertar:
            det = DetalleVenta(
                id_venta=nueva_venta.id_venta,
                id_producto=pid,
                cantidad=cant,
                precio_unitario=p_unit,
                subtotal=sub
            )
            db.add(det)

        db.commit()
        db.refresh(nueva_venta)
        print(f">>> [POSTGRESQL] Venta {nueva_venta.numero_venta} guardada exitosamente con total Q{nueva_venta.total}")
        return _format_venta(nueva_venta)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f">>> [ERROR GUARDANDO VENTA] {e}")
        raise HTTPException(status_code=500, detail=f"Error al procesar la venta en PostgreSQL: {str(e)}")
