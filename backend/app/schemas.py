from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# ============================================================================
# USUARIOS & AUTENTICACIÓN
# ============================================================================
class LoginRequest(BaseModel):
    username: str
    password: str

class UsuarioResponse(BaseModel):
    id_usuario: int
    nombre_completo: str
    username: str
    email: str
    rol: str
    estado: bool
    fecha_registro: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UsuarioResponse


# ============================================================================
# CATEGORÍAS
# ============================================================================
class CategoriaBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    estado: bool = True

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[bool] = None

class CategoriaResponse(CategoriaBase):
    id_categoria: int
    fecha_registro: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# PRODUCTOS
# ============================================================================
class ProductoBase(BaseModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    id_categoria: int
    precio_compra: float
    precio_venta: float
    existencia: int = 0
    stock_minimo: int = 10
    estado: bool = True

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    id_categoria: Optional[int] = None
    precio_compra: Optional[float] = None
    precio_venta: Optional[float] = None
    existencia: Optional[int] = None
    stock_minimo: Optional[int] = None
    estado: Optional[bool] = None

class ProductoResponse(ProductoBase):
    id_producto: int
    categoria_nombre: Optional[str] = None
    bajo_stock: Optional[bool] = False
    fecha_registro: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# CLIENTES
# ============================================================================
class ClienteBase(BaseModel):
    identificador: str
    nombres: str
    apellidos: str
    nit: str = "C/F"
    telefono: Optional[str] = None
    correo: Optional[str] = None
    direccion: Optional[str] = None
    estado: bool = True

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    identificador: Optional[str] = None
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    nit: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None
    direccion: Optional[str] = None
    estado: Optional[bool] = None

class ClienteResponse(ClienteBase):
    id_cliente: int
    nombre_completo: Optional[str] = None
    fecha_registro: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# PROVEEDORES
# ============================================================================
class ProveedorBase(BaseModel):
    identificador: str
    nombre_proveedor: str
    nit: str
    nombre_contacto: Optional[str] = None
    telefono: str
    correo: Optional[str] = None
    direccion: Optional[str] = None
    estado: bool = True

class ProveedorCreate(ProveedorBase):
    pass

class ProveedorUpdate(BaseModel):
    identificador: Optional[str] = None
    nombre_proveedor: Optional[str] = None
    nit: Optional[str] = None
    nombre_contacto: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None
    direccion: Optional[str] = None
    estado: Optional[bool] = None

class ProveedorResponse(ProveedorBase):
    id_proveedor: int
    fecha_registro: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# COMPRAS Y DETALLE
# ============================================================================
class DetalleCompraCreate(BaseModel):
    id_producto: int
    cantidad: int
    precio_compra: float

class DetalleCompraResponse(BaseModel):
    id_detalle_compra: int
    id_compra: int
    id_producto: int
    producto_nombre: Optional[str] = None
    cantidad: int
    precio_compra: float
    subtotal: float

    class Config:
        from_attributes = True

class CompraCreate(BaseModel):
    id_proveedor: int
    id_usuario: Optional[int] = 1
    numero_compra: Optional[str] = None
    observaciones: Optional[str] = None
    detalles: List[DetalleCompraCreate]

class CompraResponse(BaseModel):
    id_compra: int
    numero_compra: str
    id_proveedor: int
    proveedor_nombre: Optional[str] = None
    fecha: datetime
    id_usuario: int
    usuario_nombre: Optional[str] = None
    total: float
    estado: str
    observaciones: Optional[str] = None
    detalles: List[DetalleCompraResponse] = []

    class Config:
        from_attributes = True


# ============================================================================
# VENTAS Y DETALLE
# ============================================================================
class DetalleVentaCreate(BaseModel):
    id_producto: int
    cantidad: int
    precio_unitario: float

class DetalleVentaResponse(BaseModel):
    id_detalle_venta: int
    id_venta: int
    id_producto: int
    producto_nombre: Optional[str] = None
    cantidad: int
    precio_unitario: float
    subtotal: float

    class Config:
        from_attributes = True

class VentaCreate(BaseModel):
    id_cliente: int
    id_usuario: Optional[int] = 1
    numero_venta: Optional[str] = None
    observaciones: Optional[str] = None
    detalles: List[DetalleVentaCreate]

class VentaResponse(BaseModel):
    id_venta: int
    numero_venta: str
    fecha: datetime
    id_cliente: int
    cliente_nombre: Optional[str] = None
    cliente_nit: Optional[str] = None
    id_usuario: int
    usuario_nombre: Optional[str] = None
    total: float
    estado: str
    observaciones: Optional[str] = None
    detalles: List[DetalleVentaResponse] = []

    class Config:
        from_attributes = True


# ============================================================================
# DASHBOARD & REPORTES
# ============================================================================
class DashboardStats(BaseModel):
    total_productos: int
    total_clientes: int
    total_ventas_realizadas: int
    ventas_del_dia_total: float
    productos_bajo_inventario: int
    total_compras_realizadas: int
    ventas_recientes: List[VentaResponse] = []
    productos_mas_vendidos: List[dict] = []
    ventas_por_categoria: List[dict] = []
