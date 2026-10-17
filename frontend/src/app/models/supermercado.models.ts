export interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  username: string;
  email: string;
  rol: string;
  estado: boolean;
  fecha_registro?: string;
}

export interface Categoria {
  id_categoria?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  fecha_registro?: string;
}

export interface Producto {
  id_producto?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  id_categoria: number;
  categoria_nombre?: string;
  precio_compra: number;
  precio_venta: number;
  existencia: number;
  stock_minimo: number;
  bajo_stock?: boolean;
  estado: boolean;
  fecha_registro?: string;
}

export interface Cliente {
  id_cliente?: number;
  identificador: string;
  nombres: string;
  apellidos: string;
  nombre_completo?: string;
  nit: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  estado: boolean;
  fecha_registro?: string;
}

export interface Proveedor {
  id_proveedor?: number;
  identificador: string;
  nombre_proveedor: string;
  nit: string;
  nombre_contacto?: string;
  telefono: string;
  correo?: string;
  direccion?: string;
  estado: boolean;
  fecha_registro?: string;
}

export interface DetalleCompra {
  id_detalle_compra?: number;
  id_producto: number;
  producto_nombre?: string;
  cantidad: number;
  precio_compra: number;
  subtotal?: number;
}

export interface Compra {
  id_compra?: number;
  numero_compra?: string;
  id_proveedor: number;
  proveedor_nombre?: string;
  fecha?: string;
  id_usuario?: number;
  usuario_nombre?: string;
  total: number;
  estado?: string;
  observaciones?: string;
  detalles: DetalleCompra[];
}

export interface DetalleVenta {
  id_detalle_venta?: number;
  id_producto: number;
  producto_nombre?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
}

export interface Venta {
  id_venta?: number;
  numero_venta?: string;
  fecha?: string;
  id_cliente: number;
  cliente_nombre?: string;
  cliente_nit?: string;
  id_usuario?: number;
  usuario_nombre?: string;
  total: number;
  estado?: string;
  observaciones?: string;
  detalles: DetalleVenta[];
}

export interface DashboardStats {
  total_productos: number;
  total_clientes: number;
  total_ventas: number;
  total_compras: number;
  ventas_hoy: number;
  ingresos_totales: number;
  bajo_stock_count: number;
  top_productos: { nombre: string; unidades: number; total: number }[];
  ventas_por_categoria: { categoria: string; total: number }[];
  ventas_recientes: any[];
}
