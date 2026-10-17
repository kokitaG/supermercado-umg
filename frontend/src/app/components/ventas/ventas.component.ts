import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Venta, Cliente, Producto, DetalleVenta } from '../../models/supermercado.models';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- HEADER MÓDULO -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 1.85rem; margin-bottom: 0.35rem;">Punto de Venta (Facturación)</h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Emisión de facturas con validación estricta de existencias y descuento automático de inventario.</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button (click)="activeTab = 'pos'" class="btn" [ngClass]="activeTab === 'pos' ? 'btn-primary' : 'btn-secondary'" id="btn-tab-pos">
            <i class="ri-shopping-cart-line"></i> Terminal de Cobro
          </button>
          <button (click)="activeTab = 'historial'" class="btn" [ngClass]="activeTab === 'historial' ? 'btn-primary' : 'btn-secondary'" id="btn-tab-historial-ventas">
            <i class="ri-history-line"></i> Ventas Emitidas
          </button>
        </div>
      </div>

      <!-- PESTAÑA 1: TERMINAL DE COBRO (POS) -->
      <div *ngIf="activeTab === 'pos'" style="display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 1.5rem; align-items: flex-start;">
        
        <!-- COLUMNA IZQUIERDA: SELECCIÓN DE PRODUCTOS Y CLIENTE -->
        <div>
          <!-- SELECCIÓN DE CLIENTE -->
          <div class="panel-card" style="padding: 1.25rem; margin-bottom: 1.25rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <span style="font-weight: 600; font-size: 0.95rem; color: #818cf8;">
                <i class="ri-user-star-line"></i> Cliente para Facturación
              </span>
              <button (click)="seleccionarConsumidorFinal()" class="btn btn-secondary btn-sm">
                Consumidor Final (C/F)
              </button>
            </div>

            <div class="form-row">
              <div class="form-group" style="margin-bottom: 0;">
                <select class="form-control" [(ngModel)]="idClienteSeleccionado" (change)="onClienteChange()">
                  <option *ngFor="let c of clientes" [ngValue]="c.id_cliente">
                    {{ c.nombres }} {{ c.apellidos }} - NIT: {{ c.nit }}
                  </option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <input type="text" class="form-control" [value]="clienteNitDisplay" readonly placeholder="NIT del cliente">
              </div>
            </div>
          </div>

          <!-- CATÁLOGO INTERACTIVO DE PRODUCTOS -->
          <div class="panel-card" style="padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
              <span style="font-weight: 600; font-size: 0.95rem; color: #fff;">
                <i class="ri-grid-fill"></i> Seleccionar Productos Disponibles
              </span>
              <div class="search-input-wrapper" style="min-width: 220px;">
                <i class="ri-search-line"></i>
                <input type="text" class="form-control" [(ngModel)]="busquedaProd" (input)="filtrarCatalogo()" placeholder="Buscar producto...">
              </div>
            </div>

            <!-- GRID DE PRODUCTOS EN TARJETAS CON BADGES DE STOCK -->
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.85rem; max-height: 480px; overflow-y: auto; padding-right: 0.35rem;">
              <div *ngFor="let p of productosFiltrados" 
                   (click)="agregarProductoACarrito(p)"
                   style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; justify-content: space-between;"
                   [style.opacity]="p.existencia === 0 ? '0.45' : '1'"
                   [style.pointer-events]="p.existencia === 0 ? 'none' : 'auto'"
                   class="prod-card">
                <div>
                  <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">{{ p.codigo }}</div>
                  <div style="font-weight: 600; font-size: 0.88rem; margin: 0.25rem 0; line-height: 1.2;">{{ p.nombre }}</div>
                </div>

                <div style="margin-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: var(--accent-emerald); font-weight: 700; font-size: 1rem;">Q{{ p.precio_venta | number:'1.2-2' }}</span>
                  <span class="badge" [ngClass]="p.existencia <= p.stock_minimo ? 'badge-danger' : 'badge-neutral'" style="font-size: 0.7rem;">
                    {{ p.existencia }} disp.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA DERECHA: CARRITO / TICKET DE VENTA -->
        <div class="panel-card" style="padding: 1.5rem; position: sticky; top: 90px;">
          <div class="panel-header" style="margin-bottom: 1rem;">
            <div class="panel-title">
              <i class="ri-receipt-line"></i>
              <h2>Detalle de Venta</h2>
            </div>
            <button (click)="vaciarCarrito()" class="btn btn-secondary btn-sm" [disabled]="carrito.length === 0">
              Vaciar
            </button>
          </div>

          <!-- MENSAJES DE ALERTA O ERROR DE STOCK -->
          <div *ngIf="errorMessage" class="alert-banner alert-danger" style="margin-bottom: 1rem; font-size: 0.85rem;">
            <i class="ri-error-warning-fill"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- LÍNEAS DEL CARRITO -->
          <div style="max-height: 320px; overflow-y: auto; margin-bottom: 1rem;">
            <div *ngFor="let item of carrito; let i = index" 
                 style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); gap: 0.5rem;">
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.producto_nombre }}</div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">Q{{ item.precio_unitario | number:'1.2-2' }} c/u</div>
              </div>

              <!-- CONTROLES DE CANTIDAD -->
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <button (click)="decrementarCantidad(i)" class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem;">-</button>
                <span style="font-weight: 700; min-width: 24px; text-align: center;">{{ item.cantidad }}</span>
                <button (click)="incrementarCantidad(i)" class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem;">+</button>
              </div>

              <div style="text-align: right; min-width: 65px;">
                <strong style="color: var(--accent-emerald);">Q{{ (item.cantidad * item.precio_unitario) | number:'1.2-2' }}</strong>
              </div>

              <button (click)="quitarItem(i)" style="background: none; border: none; color: var(--accent-rose); cursor: pointer; padding: 0.2rem;">
                <i class="ri-close-circle-line" style="font-size: 1.15rem;"></i>
              </button>
            </div>

            <div *ngIf="carrito.length === 0" style="text-align: center; padding: 3rem 1rem; color: var(--text-dim);">
              <i class="ri-shopping-basket-2-line" style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;"></i>
              No hay productos seleccionados. Haga clic en los productos para agregarlos a la venta.
            </div>
          </div>

          <!-- RESUMEN Y COBRO -->
          <div style="border-top: 2px dashed var(--border-color); padding-top: 1rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem;">
              <span>Subtotal:</span>
              <span>Q{{ calcularTotal() | number:'1.2-2' }}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">
              <span>IVA Incluido (12%):</span>
              <span>Q{{ (calcularTotal() * 0.12) | number:'1.2-2' }}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.5rem;">
              <span style="font-size: 1.1rem; font-weight: 700;">TOTAL A PAGAR:</span>
              <span style="font-size: 1.9rem; font-weight: 800; color: #fff; font-family: var(--font-heading);">
                Q{{ calcularTotal() | number:'1.2-2' }}
              </span>
            </div>

            <button (click)="finalizarVenta()" class="btn btn-success" id="btn-cobrar-venta" [disabled]="carrito.length === 0 || isProcessing" style="width: 100%; padding: 0.95rem; font-size: 1.05rem;">
              <span *ngIf="!isProcessing"><i class="ri-secure-payment-line"></i> Confirmar y Cobrar Venta</span>
              <span *ngIf="isProcessing">Validando inventario...</span>
            </button>
          </div>
        </div>

      </div>

      <!-- PESTAÑA 2: HISTORIAL DE VENTAS EMITIDAS -->
      <div *ngIf="activeTab === 'historial'" class="panel-card">
        <div class="table-responsive">
          <table class="custom-table" id="tabla-historial-ventas">
            <thead>
              <tr>
                <th>No. Factura</th>
                <th>Fecha y Hora</th>
                <th>Cliente Receptor</th>
                <th>NIT</th>
                <th>Cajero</th>
                <th>Total Facturado</th>
                <th>Estado</th>
                <th style="text-align: right;">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let v of ventasHistoricas">
                <td><strong style="color: #818cf8;">{{ v.numero_venta }}</strong></td>
                <td>{{ v.fecha }}</td>
                <td><span style="font-weight: 600;">{{ v.cliente_nombre }}</span></td>
                <td><span class="badge badge-primary">{{ v.cliente_nit || 'C/F' }}</span></td>
                <td>{{ v.usuario_nombre || 'Cajero 1' }}</td>
                <td><strong style="color: var(--accent-emerald);">Q{{ v.total | number:'1.2-2' }}</strong></td>
                <td><span class="badge badge-success">{{ v.estado }}</span></td>
                <td style="text-align: right;">
                  <button (click)="verRecibo(v)" class="btn btn-secondary btn-sm" title="Ver Recibo">
                    <i class="ri-printer-line"></i> Imprimir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL TICKET / FACTURA FINALIZADA -->
      <div *ngIf="ventaRecienteModal" class="modal-overlay">
        <div class="modal-dialog" style="max-width: 420px; background: #fff; color: #1e293b; border-radius: 8px;">
          <div style="padding: 1.5rem; text-align: center; border-bottom: 1px dashed #cbd5e1;">
            <div style="font-size: 1.4rem; font-weight: 800; font-family: var(--font-heading); color: #0f172a;">SUPERMERCADO UMG</div>
            <div style="font-size: 0.8rem; color: #64748b;">FACULTAD DE INGENIERÍA EN SISTEMAS</div>
            <div style="font-size: 0.8rem; color: #64748b;">NIT: 98765432-1 | FACTURA ELECTRÓNICA</div>
            <div style="margin-top: 0.5rem; font-weight: 700; color: #4f46e5;">FACTURA {{ ventaRecienteModal.numero_venta }}</div>
          </div>

          <div style="padding: 1.25rem; font-size: 0.85rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
              <span style="color: #64748b;">Cliente:</span>
              <strong style="color: #0f172a;">{{ ventaRecienteModal.cliente_nombre }}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
              <span style="color: #64748b;">NIT:</span>
              <strong style="color: #0f172a;">{{ ventaRecienteModal.cliente_nit }}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
              <span style="color: #64748b;">Fecha:</span>
              <span>{{ ventaRecienteModal.fecha }}</span>
            </div>

            <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 0.75rem 0; margin-bottom: 1rem;">
              <div *ngFor="let det of ventaRecienteModal.detalles" style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <span>{{ det.cantidad }}x {{ det.producto_nombre }}</span>
                <strong>Q{{ det.subtotal | number:'1.2-2' }}</strong>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 800; color: #0f172a;">
              <span>TOTAL:</span>
              <span style="color: #059669;">Q{{ ventaRecienteModal.total | number:'1.2-2' }}</span>
            </div>
          </div>

          <div style="padding: 1rem 1.25rem; background: #f8fafc; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; border-radius: 0 0 8px 8px;">
            <button (click)="cerrarModalRecibo()" class="btn btn-secondary btn-sm" style="color: #334155; border-color: #cbd5e1;">Cerrar</button>
            <button onclick="window.print()" class="btn btn-primary btn-sm"><i class="ri-printer-line"></i> Imprimir Ticket</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class VentasComponent implements OnInit {
  activeTab: 'pos' | 'historial' = 'pos';

  clientes: Cliente[] = [];
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  ventasHistoricas: Venta[] = [];

  idClienteSeleccionado: number | null = 1;
  clienteNitDisplay = 'C/F';
  busquedaProd = '';

  carrito: any[] = [];
  errorMessage = '';
  isProcessing = false;
  ventaRecienteModal: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.getClientes().subscribe({
      next: (cls) => {
        this.clientes = cls || [];
        if (this.clientes.length > 0) {
          this.idClienteSeleccionado = this.clientes[0].id_cliente || 1;
          this.clienteNitDisplay = this.clientes[0].nit;
        }
      },
      error: () => {
        this.clientes = [];
        this.idClienteSeleccionado = null;
        this.clienteNitDisplay = '';
      }
    });

    this.api.getProductos().subscribe({
      next: (prods) => {
        this.productos = prods || [];
        this.filtrarCatalogo();
      },
      error: () => {
        this.productos = [];
        this.filtrarCatalogo();
      }
    });

    this.cargarHistorial();
  }

  cargarHistorial() {
    this.api.getVentas().subscribe({
      next: (data) => this.ventasHistoricas = data || [],
      error: () => this.ventasHistoricas = []
    });
  }

  seleccionarConsumidorFinal() {
    const cf = this.clientes.find(c => c.nit.toUpperCase() === 'C/F' || c.identificador === 'CLI-001');
    if (cf && cf.id_cliente) {
      this.idClienteSeleccionado = cf.id_cliente;
      this.clienteNitDisplay = cf.nit;
    }
  }

  onClienteChange() {
    const c = this.clientes.find(cli => cli.id_cliente === this.idClienteSeleccionado);
    if (c) {
      this.clienteNitDisplay = c.nit;
    }
  }

  filtrarCatalogo() {
    if (!this.busquedaProd.trim()) {
      this.productosFiltrados = [...this.productos];
    } else {
      const q = this.busquedaProd.toLowerCase();
      this.productosFiltrados = this.productos.filter(p => 
        p.nombre.toLowerCase().includes(q) || 
        p.codigo.toLowerCase().includes(q)
      );
    }
  }

  agregarProductoACarrito(prod: Producto) {
    this.errorMessage = '';
    const idx = this.carrito.findIndex(i => i.id_producto === prod.id_producto);

    if (idx >= 0) {
      const item = this.carrito[idx];
      // Regla de negocio: validar stock
      if (item.cantidad + 1 > prod.existencia) {
        this.errorMessage = `No se puede agregar más unidades de "${prod.nombre}". Existencia máxima disponible: ${prod.existencia}`;
        return;
      }
      item.cantidad += 1;
    } else {
      if (prod.existencia < 1) {
        this.errorMessage = `El producto "${prod.nombre}" no tiene existencias disponibles en bodega.`;
        return;
      }
      this.carrito.push({
        id_producto: prod.id_producto,
        producto_nombre: prod.nombre,
        precio_unitario: prod.precio_venta,
        cantidad: 1,
        stock_maximo: prod.existencia
      });
    }
  }

  incrementarCantidad(idx: number) {
    this.errorMessage = '';
    const item = this.carrito[idx];
    if (item.cantidad + 1 > item.stock_maximo) {
      this.errorMessage = `Stock insuficiente. Solo quedan ${item.stock_maximo} unidades de "${item.producto_nombre}".`;
      return;
    }
    item.cantidad += 1;
  }

  decrementarCantidad(idx: number) {
    this.errorMessage = '';
    const item = this.carrito[idx];
    if (item.cantidad > 1) {
      item.cantidad -= 1;
    } else {
      this.quitarItem(idx);
    }
  }

  quitarItem(idx: number) {
    this.carrito.splice(idx, 1);
  }

  vaciarCarrito() {
    this.carrito = [];
    this.errorMessage = '';
  }

  calcularTotal(): number {
    return this.carrito.reduce((acc, cur) => acc + (cur.cantidad * cur.precio_unitario), 0);
  }

  finalizarVenta() {
    if (this.carrito.length === 0) return;
    if (!this.idClienteSeleccionado) {
      this.errorMessage = 'Debe seleccionar un cliente válido para procesar la venta.';
      return;
    }
    this.isProcessing = true;
    this.errorMessage = '';

    const payload: Venta = {
      id_cliente: this.idClienteSeleccionado,
      total: this.calcularTotal(),
      detalles: this.carrito.map(item => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }))
    };

    this.api.createVenta(payload).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.ventaRecienteModal = res;
        this.carrito = [];
        this.cargarDatos(); // Refresca catálogo y nuevo stock descontado
      },
      error: (err) => {
        this.isProcessing = false;
        this.errorMessage = err.error?.detail || 'Error al procesar la venta en el servidor';
      }
    });
  }

  verRecibo(v: Venta) {
    this.ventaRecienteModal = v;
  }

  cerrarModalRecibo() {
    this.ventaRecienteModal = null;
  }
}
