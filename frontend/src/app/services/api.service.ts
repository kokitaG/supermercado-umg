import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { 
  Categoria, 
  Producto, 
  Cliente, 
  Proveedor, 
  Compra, 
  Venta, 
  DashboardStats 
} from '../models/supermercado.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getHealth(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/health`).pipe(
      catchError((err) => of({
        status: 'offline',
        conexion_bd: 'desconectado',
        motor_base_datos: 'Backend no responde (FastAPI :8000 detenido)',
        error_detail: err.message || 'Servidor backend apagado'
      }))
    );
  }

  syncDatabase(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sync-seed`);
  }

  // ==========================================
  // DASHBOARD
  // ==========================================
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`);
  }

  // ==========================================
  // CATEGORÍAS
  // ==========================================
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`);
  }

  createCategoria(cat: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.baseUrl}/categorias`, cat);
  }

  updateCategoria(id: number, cat: Partial<Categoria>): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/categorias/${id}`, cat);
  }

  deleteCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/categorias/${id}`);
  }

  // ==========================================
  // PRODUCTOS
  // ==========================================
  getProductos(q?: string, categoriaId?: number): Observable<Producto[]> {
    let url = `${this.baseUrl}/productos?solo_activos=true`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (categoriaId) url += `&categoria_id=${categoriaId}`;
    return this.http.get<Producto[]>(url);
  }

  getProductosBajoStock(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/productos/bajo-stock`);
  }

  createProducto(prod: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/productos`, prod);
  }

  updateProducto(id: number, prod: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/productos/${id}`, prod);
  }

  deleteProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/productos/${id}`);
  }

  // ==========================================
  // CLIENTES
  // ==========================================
  getClientes(q?: string): Observable<Cliente[]> {
    const url = q ? `${this.baseUrl}/clientes?q=${encodeURIComponent(q)}` : `${this.baseUrl}/clientes`;
    return this.http.get<Cliente[]>(url);
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/clientes`, cliente);
  }

  updateCliente(id: number, cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/clientes/${id}`, cliente);
  }

  deleteCliente(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/clientes/${id}`);
  }

  // ==========================================
  // PROVEEDORES
  // ==========================================
  getProveedores(q?: string): Observable<Proveedor[]> {
    const url = q ? `${this.baseUrl}/proveedores?q=${encodeURIComponent(q)}` : `${this.baseUrl}/proveedores`;
    return this.http.get<Proveedor[]>(url);
  }

  createProveedor(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.baseUrl}/proveedores`, proveedor);
  }

  updateProveedor(id: number, proveedor: Partial<Proveedor>): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.baseUrl}/proveedores/${id}`, proveedor);
  }

  deleteProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/proveedores/${id}`);
  }

  // ==========================================
  // COMPRAS (Entrada y aumento de inventario)
  // ==========================================
  getCompras(): Observable<Compra[]> {
    return this.http.get<Compra[]>(`${this.baseUrl}/compras`);
  }

  createCompra(compra: Compra): Observable<Compra> {
    return this.http.post<Compra>(`${this.baseUrl}/compras`, compra);
  }

  // ==========================================
  // VENTAS (Salida y descuento de inventario)
  // ==========================================
  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.baseUrl}/ventas`);
  }

  createVenta(venta: Venta): Observable<Venta> {
    return this.http.post<Venta>(`${this.baseUrl}/ventas`, venta);
  }

  // ==========================================
  // INVENTARIO
  // ==========================================
  getInventario(q?: string, categoriaId?: number, estadoStock?: string): Observable<any[]> {
    let url = `${this.baseUrl}/inventario?`;
    if (q) url += `q=${encodeURIComponent(q)}&`;
    if (categoriaId) url += `categoria_id=${categoriaId}&`;
    if (estadoStock) url += `estado_stock=${estadoStock}&`;
    return this.http.get<any[]>(url);
  }

  // ==========================================
  // REPORTES
  // ==========================================
  getReporteProductosMasVendidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reportes/productos-mas-vendidos`);
  }

  getReporteInventarioBajo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reportes/inventario-bajo`);
  }

  getReporteVentasRangoFechas(inicio?: string, fin?: string): Observable<any> {
    let url = `${this.baseUrl}/reportes/ventas-rango-fechas?`;
    if (inicio) url += `fecha_inicio=${inicio}&`;
    if (fin) url += `fecha_fin=${fin}&`;
    return this.http.get<any>(url);
  }

  getReporteVentasPorCliente(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reportes/ventas-por-cliente`);
  }

  getConsultaAcademicaSQL(num: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reportes/consultas-sql/${num}`);
  }
}
