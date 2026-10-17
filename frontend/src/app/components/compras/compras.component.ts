import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Compra, Proveedor, Producto, DetalleCompra } from '../../models/supermercado.models';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- HEADER MÓDULO -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 1.85rem; margin-bottom: 0.35rem;">Módulo de Compras (Abastecimiento)</h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Registro de órdenes de compra con incremento automático en el stock de inventario.</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button (click)="activeTab = 'nueva'" class="btn" [ngClass]="activeTab === 'nueva' ? 'btn-primary' : 'btn-secondary'" id="btn-tab-nueva-compra">
            <i class="ri-add-line"></i> Registrar Entrada de Mercadería
          </button>
          <button (click)="activeTab = 'historial'" class="btn" [ngClass]="activeTab === 'historial' ? 'btn-primary' : 'btn-secondary'" id="btn-tab-historial-compras">
            <i class="ri-history-line"></i> Historial de Compras
          </button>
        </div>
      </div>

      <!-- PESTAÑA 1: NUEVA COMPRA (FORMULARIO ENCABEZADO Y DETALLE) -->
      <div *ngIf="activeTab === 'nueva'" class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <i class="ri-file-list-3-line"></i>
            <h2>Nueva Orden de Compra</h2>
          </div>
          <span class="badge badge-primary">Efecto: Stock = Stock + Cantidad</span>
        </div>

        <div *ngIf="feedbackMessage" class="alert-banner" [ngClass]="feedbackType === 'success' ? 'alert-success' : 'alert-danger'">
          <i [ngClass]="feedbackType === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'"></i>
          <span>{{ feedbackMessage }}</span>
        </div>

        <!-- ENCABEZADO -->
        <div class="form-row" style="margin-bottom: 1.5rem;">
          <div class="form-group">
            <label class="form-label">Proveedor Seleccionado *</label>
            <select class="form-control" [(ngModel)]="idProveedorSeleccionado" required>
              <option [ngValue]="null" disabled>-- Seleccione un Proveedor --</option>
              <option *ngFor="let p of proveedores" [ngValue]="p.id_proveedor">
                {{ p.identificador }} - {{ p.nombre_proveedor }} (NIT: {{ p.nit }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Número de Comprobante / Factura (Opcional)</label>
            <input type="text" class="form-control" [(ngModel)]="numeroCompra" placeholder="Auto-generado si se deja en blanco">
          </div>

          <div class="form-group">
            <label class="form-label">Observaciones</label>
            <input type="text" class="form-control" [(ngModel)]="observaciones" placeholder="Ej. Abastecimiento semanal de lácteos">
          </div>
        </div>

        <!-- AGREGADOR DE LÍNEA DE DETALLE -->
        <div style="background: var(--bg-card); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
          <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 1rem; color: #818cf8;">
            <i class="ri-add-circle-line"></i> Agregar Producto a la Orden
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 1rem; align-items: flex-end;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Producto *</label>
              <select class="form-control" [(ngModel)]="productoSeleccionadoId" (change)="onProductoSeleccionado()">
                <option [ngValue]="null">-- Seleccionar Producto --</option>
                <option *ngFor="let pr of productos" [ngValue]="pr.id_producto">
                  {{ pr.codigo }} - {{ pr.nombre }} (Stock actual: {{ pr.existencia }})
                </option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Cantidad a Comprar *</label>
              <input type="number" min="1" class="form-control" [(ngModel)]="itemCantidad">
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Precio de Compra (Q) *</label>
              <input type="number" step="0.01" min="0" class="form-control" [(ngModel)]="itemPrecioCompra">
            </div>

            <button type="button" (click)="agregarLineaDetalle()" class="btn btn-primary" id="btn-add-item-compra">
              <i class="ri-add-line"></i> Agregar Línea
            </button>
          </div>
        </div>

        <!-- TABLA DE DETALLES AGREGADOS -->
        <div class="table-responsive" style="margin-bottom: 1.5rem;">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align: center;">Cantidad</th>
                <th style="text-align: right;">Precio Compra</th>
                <th style="text-align: right;">Subtotal</th>
                <th style="text-align: center;">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let det of lineasDetalle; let i = index">
                <td>
                  <strong>{{ det.producto_nombre }}</strong>
                </td>
                <td style="text-align: center;">{{ det.cantidad }}</td>
                <td style="text-align: right;">Q{{ det.precio_compra | number:'1.2-2' }}</td>
                <td style="text-align: right; color: var(--accent-emerald); font-weight: 700;">
                  Q{{ (det.cantidad * det.precio_compra) | number:'1.2-2' }}
                </td>
                <td style="text-align: center;">
                  <button (click)="eliminarLineaDetalle(i)" class="btn btn-danger btn-sm" title="Quitar">
                    <i class="ri-delete-bin-line"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="lineasDetalle.length === 0">
                <td colspan="5" style="text-align: center; color: var(--text-dim); padding: 2rem;">
                  No hay productos agregados en el detalle aún.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TOTAL Y BOTÓN DE ACCIÓN -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Total de Ítems: <strong>{{ lineasDetalle.length }}</strong></div>
          </div>
          <div style="display: flex; align-items: center; gap: 2rem;">
            <div style="text-align: right;">
              <span style="font-size: 0.9rem; color: var(--text-muted); display: block;">Total de Compra:</span>
              <span style="font-size: 1.85rem; font-weight: 800; color: #fff; font-family: var(--font-heading);">
                Q{{ calcularTotal() | number:'1.2-2' }}
              </span>
            </div>
            <button (click)="guardarCompra()" class="btn btn-success" id="btn-submit-compra" [disabled]="isSubmitting || lineasDetalle.length === 0 || !idProveedorSeleccionado" style="padding: 0.85rem 1.75rem; font-size: 1rem;">
              <i class="ri-check-double-line"></i> Finalizar y Aumentar Inventario
            </button>
          </div>
        </div>
      </div>

      <!-- PESTAÑA 2: HISTORIAL DE COMPRAS -->
      <div *ngIf="activeTab === 'historial'" class="panel-card">
        <div class="table-responsive">
          <table class="custom-table" id="tabla-historial-compras">
            <thead>
              <tr>
                <th>No. Compra</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Responsable</th>
                <th>Total Facturado</th>
                <th>Estado</th>
                <th>Líneas</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of comprasHistoricas">
                <td><strong style="color: #818cf8;">{{ c.numero_compra }}</strong></td>
                <td>{{ c.fecha }}</td>
                <td><span style="font-weight: 600;">{{ c.proveedor_nombre }}</span></td>
                <td>{{ c.usuario_nombre }}</td>
                <td><strong style="color: var(--accent-emerald);">Q{{ c.total | number:'1.2-2' }}</strong></td>
                <td><span class="badge badge-success">{{ c.estado }}</span></td>
                <td><span class="badge badge-neutral">{{ c.detalles ? c.detalles.length : 1 }} productos</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class ComprasComponent implements OnInit {
  activeTab: 'nueva' | 'historial' = 'nueva';

  proveedores: Proveedor[] = [];
  productos: Producto[] = [];
  comprasHistoricas: Compra[] = [];

  idProveedorSeleccionado: number | null = null;
  numeroCompra = '';
  observaciones = '';

  productoSeleccionadoId: number | null = null;
  itemCantidad = 10;
  itemPrecioCompra = 0.00;

  lineasDetalle: any[] = [];
  feedbackMessage = '';
  feedbackType: 'success' | 'error' = 'success';
  isSubmitting = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarHistorial();
  }

  cargarCatalogos() {
    this.api.getProveedores().subscribe({
      next: (provs) => {
        this.proveedores = provs || [];
      },
      error: () => {
        this.proveedores = [];
      }
    });

    this.api.getProductos().subscribe({
      next: (prods) => {
        this.productos = prods || [];
      },
      error: () => {
        this.productos = [];
      }
    });
  }

  cargarHistorial() {
    this.api.getCompras().subscribe({
      next: (data) => {
        this.comprasHistoricas = data || [];
      },
      error: () => {
        this.comprasHistoricas = [];
      }
    });
  }

  onProductoSeleccionado() {
    const prod = this.productos.find(p => p.id_producto === this.productoSeleccionadoId);
    if (prod) {
      this.itemPrecioCompra = prod.precio_compra;
    }
  }

  agregarLineaDetalle() {
    if (!this.productoSeleccionadoId) {
      this.feedbackMessage = 'Por favor seleccione un producto.';
      this.feedbackType = 'error';
      return;
    }
    if (this.itemCantidad <= 0) {
      this.feedbackMessage = 'La cantidad debe ser mayor a 0.';
      this.feedbackType = 'error';
      return;
    }

    const prod = this.productos.find(p => p.id_producto === this.productoSeleccionadoId);
    if (!prod) return;

    // Verificar si ya existe en la lista
    const idx = this.lineasDetalle.findIndex(d => d.id_producto === prod.id_producto);
    if (idx >= 0) {
      this.lineasDetalle[idx].cantidad += this.itemCantidad;
      this.lineasDetalle[idx].precio_compra = this.itemPrecioCompra;
    } else {
      this.lineasDetalle.push({
        id_producto: prod.id_producto,
        producto_nombre: prod.nombre,
        cantidad: this.itemCantidad,
        precio_compra: this.itemPrecioCompra
      });
    }

    this.feedbackMessage = '';
    this.productoSeleccionadoId = null;
    this.itemCantidad = 10;
  }

  eliminarLineaDetalle(idx: number) {
    this.lineasDetalle.splice(idx, 1);
  }

  calcularTotal(): number {
    return this.lineasDetalle.reduce((acc, cur) => acc + (cur.cantidad * cur.precio_compra), 0);
  }

  guardarCompra() {
    if (!this.idProveedorSeleccionado) {
      this.feedbackMessage = 'Seleccione el proveedor responsable del abastecimiento.';
      this.feedbackType = 'error';
      return;
    }

    if (this.lineasDetalle.length === 0) {
      this.feedbackMessage = 'Debe agregar al menos una línea de producto con el botón "+ Agregar Línea".';
      this.feedbackType = 'error';
      return;
    }

    this.isSubmitting = true;
    this.feedbackMessage = '';

    const numCompraGenerado = this.numeroCompra.trim() || `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const obsGenerada = this.observaciones.trim() || 'Abastecimiento de mercadería';
    const totalCompra = this.calcularTotal();

    const provObj = this.proveedores.find(p => p.id_proveedor === this.idProveedorSeleccionado);
    const provNombre = provObj ? provObj.nombre_proveedor : 'Proveedor General';

    const payload: Compra = {
      id_proveedor: this.idProveedorSeleccionado,
      numero_compra: numCompraGenerado,
      observaciones: obsGenerada,
      total: totalCompra,
      detalles: this.lineasDetalle.map(d => ({
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        precio_compra: d.precio_compra
      }))
    };

    const compraFinal: Compra = {
      id_compra: this.comprasHistoricas.length + 1,
      numero_compra: numCompraGenerado,
      id_proveedor: this.idProveedorSeleccionado,
      proveedor_nombre: provNombre,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
      id_usuario: 1,
      usuario_nombre: 'Oscar G',
      total: totalCompra,
      estado: 'Completada',
      observaciones: obsGenerada,
      detalles: payload.detalles
    };

    this.api.createCompra(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.feedbackType = 'success';
        this.feedbackMessage = `¡Compra ${res.numero_compra || numCompraGenerado} registrada y guardada exitosamente en PostgreSQL! El inventario ha sido actualizado.`;
        this.comprasHistoricas.unshift(res || compraFinal);
        this.resetFormulario();
        this.cargarCatalogos();
        this.cargarHistorial();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.feedbackType = 'error';
        const errorDetail = err.error?.detail || err.message || 'Error de conexión con el backend o la base de datos PostgreSQL.';
        this.feedbackMessage = `No se pudo guardar la compra: ${errorDetail}`;
      }
    });
  }

  private resetFormulario() {
    this.lineasDetalle = [];
    this.numeroCompra = '';
    this.observaciones = '';
    this.idProveedorSeleccionado = null;
    this.productoSeleccionadoId = null;
    this.itemCantidad = 10;
    this.itemPrecioCompra = 0;
  }
}
