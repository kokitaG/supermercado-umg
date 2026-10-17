import datetime
from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre_completo = Column(String(150), nullable=False)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(30), nullable=False, default="Cajero")
    estado = Column(Boolean, nullable=False, default=True)
    fecha_registro = Column(DateTime, default=datetime.datetime.utcnow)

    # Relaciones
    compras = relationship("Compra", back_populates="usuario")
    ventas = relationship("Venta", back_populates="usuario")


class Categoria(Base):
    __tablename__ = "categorias"

    id_categoria = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, nullable=False, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    estado = Column(Boolean, nullable=False, default=True)
    fecha_registro = Column(DateTime, default=datetime.datetime.utcnow)

    # Relaciones
    productos = relationship("Producto", back_populates="categoria")


class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    id_categoria = Column(Integer, ForeignKey("categorias.id_categoria"), nullable=False)
    precio_compra = Column(Numeric(10, 2), nullable=False)
    precio_venta = Column(Numeric(10, 2), nullable=False)
    existencia = Column(Integer, nullable=False, default=0)
    stock_minimo = Column(Integer, nullable=False, default=10)
    estado = Column(Boolean, nullable=False, default=True)
    fecha_registro = Column(DateTime, default=datetime.datetime.utcnow)

    # Relaciones
    categoria = relationship("Categoria", back_populates="productos")
    detalles_compras = relationship("DetalleCompra", back_populates="producto")
    detalles_ventas = relationship("DetalleVenta", back_populates="producto")


class Cliente(Base):
    __tablename__ = "clientes"

    id_cliente = Column(Integer, primary_key=True, index=True)
    identificador = Column(String(50), unique=True, nullable=False, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    nit = Column(String(20), nullable=False, default="C/F")
    telefono = Column(String(20), nullable=True)
    correo = Column(String(100), nullable=True)
    direccion = Column(String(255), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)
    fecha_registro = Column(DateTime, default=datetime.datetime.utcnow)

    # Relaciones
    ventas = relationship("Venta", back_populates="cliente")


class Proveedor(Base):
    __tablename__ = "proveedores"

    id_proveedor = Column(Integer, primary_key=True, index=True)
    identificador = Column(String(50), unique=True, nullable=False, index=True)
    nombre_proveedor = Column(String(150), nullable=False)
    nit = Column(String(20), nullable=False)
    nombre_contacto = Column(String(100), nullable=True)
    telefono = Column(String(20), nullable=False)
    correo = Column(String(100), nullable=True)
    direccion = Column(String(255), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)
    fecha_registro = Column(DateTime, default=datetime.datetime.utcnow)

    # Relaciones
    compras = relationship("Compra", back_populates="proveedor")


class Compra(Base):
    __tablename__ = "compras"

    id_compra = Column(Integer, primary_key=True, index=True)
    numero_compra = Column(String(30), unique=True, nullable=False, index=True)
    id_proveedor = Column(Integer, ForeignKey("proveedores.id_proveedor"), nullable=False)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    total = Column(Numeric(12, 2), nullable=False, default=0.00)
    estado = Column(String(20), nullable=False, default="Completada")
    observaciones = Column(Text, nullable=True)

    # Relaciones
    proveedor = relationship("Proveedor", back_populates="compras")
    usuario = relationship("Usuario", back_populates="compras")
    detalles = relationship("DetalleCompra", back_populates="compra", cascade="all, delete-orphan")


class DetalleCompra(Base):
    __tablename__ = "detalle_compras"

    id_detalle_compra = Column(Integer, primary_key=True, index=True)
    id_compra = Column(Integer, ForeignKey("compras.id_compra"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_compra = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

    # Relaciones
    compra = relationship("Compra", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles_compras")


class Venta(Base):
    __tablename__ = "ventas"

    id_venta = Column(Integer, primary_key=True, index=True)
    numero_venta = Column(String(30), unique=True, nullable=False, index=True)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    total = Column(Numeric(12, 2), nullable=False, default=0.00)
    estado = Column(String(20), nullable=False, default="Completada")
    observaciones = Column(Text, nullable=True)

    # Relaciones
    cliente = relationship("Cliente", back_populates="ventas")
    usuario = relationship("Usuario", back_populates="ventas")
    detalles = relationship("DetalleVenta", back_populates="venta", cascade="all, delete-orphan")


class DetalleVenta(Base):
    __tablename__ = "detalle_ventas"

    id_detalle_venta = Column(Integer, primary_key=True, index=True)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

    # Relaciones
    venta = relationship("Venta", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles_ventas")
