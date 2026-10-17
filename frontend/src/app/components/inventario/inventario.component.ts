import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Categoria } from '../../models/supermercado.models';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 1.85rem; margin-bottom: 0.35rem;">Control y Auditoría de Inventario</h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Monitoreo de existencias en bodega, estado de abastecimiento y valorización conectada a PostgreSQL (laboratorio).</p>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button (click)="sincronizarBD()" class="btn btn-primary" [disabled]="isSyncing" title="Sincronizar y poblar tablas en PostgreSQL">
            <i class="ri-database-2-line"></i> {{ isSyncing ? 'Sincronizando...' : 'Poblar BD PostgreSQL' }}
          </button>
          <button (click)="loadInventario()" class="btn btn-secondary">
            <i class="ri-refresh-line"></i> Actualizar Stock
          </button>
        </div>
      </div>

      <!-- ALERTAS -->
      <div *ngIf="syncMessage" class="alert-banner alert-success" style="margin-bottom: 1.5rem;">
        <i class="ri-checkbox-circle-fill"></i> {{ syncMessage }}
      </div>
      <div *ngIf="errorMessage" class="alert-banner alert-danger" style="margin-bottom: 1.5rem;">
        <i class="ri-error-warning-fill"></i> {{ errorMessage }}
      </div>

      <!-- TARJETAS DE VALORIZACIÓN DE INVENTARIO -->
      <div class="grid-stats">
        <div class="stat-card">
          <div class="stat-icon indigo">
            <i class="ri-archive-stack-line"></i>
          </div>
          <div class="stat-info">
            <h3>Unidades Totales en Bodega</h3>
            <div class="stat-value">{{ calcularTotalUnidades() }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon emerald">
            <i class="ri-wallet-3-line"></i>
          </div>
          <div class="stat-info">
            <h3>Valorización al Costo (Q)</h3>
            <div class="stat-value">Q{{ calcularValorCosto() | number:'1.2-2' }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon cyan">
            <i class="ri-money-dollar-box-line"></i>
          </div>
          <div class="stat-info">
            <h3>Valor Potencial Venta (Q)</h3>
            <div class="stat-value">Q{{ calcularValorVenta() | number:'1.2-2' }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rose">
            <i class="ri-alarm-warning-line"></i>
          </div>
          <div class="stat-info">
            <h3>Alertas de Reabastecimiento</h3>
            <div class="stat-value" style="color: #fb7185;">{{ contarBajoStock() }}</div>
          </div>
        </div>
      </div>

      <!-- FILTROS Y BÚSQUEDA -->
      <div class="panel-card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 1rem; flex: 1; min-width: 280px;">
            <div class="search-input-wrapper" style="flex: 1;">
              <i class="ri-search-line"></i>
              <input type="text" class="form-control" [(ngModel)]="searchQuery" (input)="onFilterChange()" placeholder="Filtrar por código o nombre...">
            </div>

            <select class="form-control" style="max-width: 200px;" [(ngModel)]="selectedCategoriaId" (change)="onFilterChange()">
              <option [ngValue]="null">Todas las Categorías</option>
              <option *ngFor="let cat of categorias" [ngValue]="cat.id_categoria">{{ cat.nombre }}</option>
            </select>

            <select class="form-control" style="max-width: 180px;" [(ngModel)]="selectedEstadoStock" (change)="onFilterChange()">
              <option value="">Todos los Estados</option>
              <option value="BAJO">Bajo Stock</option>
              <option value="OPTIMO">Óptimo</option>
              <option value="AGOTADO">Agotado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- TABLA DE CONTROL DE INVENTARIO -->
      <div class="panel-card">
        <div class="table-responsive">
          <table class="custom-table" id="tabla-inventario">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th style="text-align: right;">Costo Compra</th>
                <th style="text-align: right;">Precio Venta</th>
                <th style="text-align: center;">Existencia</th>
                <th style="text-align: center;">Stock Mínimo</th>
                <th>Estado del Inventario</th>
                <th style="text-align: right;">Valor en Bodega</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items">
                <td><strong style="color: #818cf8;">{{ item.codigo }}</strong></td>
                <td><span style="font-weight: 600;">{{ item.producto }}</span></td>
                <td><span class="badge badge-primary">{{ item.categoria }}</span></td>
                <td style="text-align: right;">Q{{ item.precio_compra | number:'1.2-2' }}</td>
                <td style="text-align: right; color: var(--accent-emerald);">Q{{ item.precio_venta | number:'1.2-2' }}</td>
                <td style="text-align: center;">
                  <strong [style.color]="item.existencia <= item.stock_minimo ? '#fb7185' : '#fff'">
                    {{ item.existencia }} uds
                  </strong>
                </td>
                <td style="text-align: center; color: var(--text-dim);">{{ item.stock_minimo }} uds</td>
                <td>
                  <span class="badge" 
                        [ngClass]="{
                          'badge-danger': item.estado_inventario === 'BAJO STOCK' || item.estado_inventario === 'AGOTADO',
                          'badge-success': item.estado_inventario === 'ÓPTIMO'
                        }">
                    {{ item.estado_inventario }}
                  </span>
                </td>
                <td style="text-align: right; font-weight: 700;">Q{{ item.valor_inventario_costo | number:'1.2-2' }}</td>
              </tr>
              <tr *ngIf="items.length === 0 && !isLoading">
                <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-dim);">
                  <i class="ri-database-2-line" style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem; color: #818cf8;"></i>
                  <div style="font-size: 1.1rem; color: #fff; font-weight: 600; margin-bottom: 0.25rem;">No hay productos registrados en la base de datos PostgreSQL</div>
                  <p style="margin-bottom: 1.25rem; font-size: 0.88rem; color: var(--text-muted);">
                    Las tablas están vacías en PostgreSQL (laboratorio). Haz clic abajo para insertar el catálogo maestro en la BD.
                  </p>
                  <button (click)="sincronizarBD()" class="btn btn-primary" [disabled]="isSyncing">
                    <i class="ri-download-cloud-line"></i> Poblar Base de Datos PostgreSQL
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class InventarioComponent implements OnInit {
  items: any[] = [];
  categorias: Categoria[] = [];

  searchQuery = '';
  selectedCategoriaId: number | null = null;
  selectedEstadoStock = '';

  isLoading = false;
  isSyncing = false;
  syncMessage = '';
  errorMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getCategorias().subscribe((cats) => this.categorias = cats || []);
    this.loadInventario();
  }

  loadInventario() {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getInventario(this.searchQuery, this.selectedCategoriaId || undefined, this.selectedEstadoStock || undefined).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.items = data || [];
      },
      error: (err) => {
        this.isLoading = false;
        this.items = [];
        if (err.status === 0) {
          this.errorMessage = 'El servidor Backend FastAPI no responde (http://localhost:8000). Por favor inicia la terminal del backend con: python run.py';
        } else if (err.error?.detail) {
          this.errorMessage = err.error.detail;
        } else {
          this.errorMessage = 'Error al consultar la base de datos PostgreSQL (laboratorio).';
        }
      }
    });
  }

  sincronizarBD() {
    this.isSyncing = true;
    this.syncMessage = '';
    this.errorMessage = '';
    this.api.syncDatabase().subscribe({
      next: (res) => {
        this.isSyncing = false;
        if (res.status === 'ok') {
          this.syncMessage = `¡Base de datos PostgreSQL sincronizada exitosamente! (${res.productos} productos guardados en tablas).`;
          this.loadInventario();
          this.api.getCategorias().subscribe((cats) => this.categorias = cats || []);
        } else {
          this.errorMessage = res.mensaje || 'Error al sincronizar con PostgreSQL.';
        }
      },
      error: () => {
        this.isSyncing = false;
        this.errorMessage = 'No se pudo comunicar con el servidor backend.';
      }
    });
  }

  onFilterChange() {
    this.loadInventario();
  }

  calcularTotalUnidades(): number {
    return this.items.reduce((acc, cur) => acc + (cur.existencia || 0), 0);
  }

  calcularValorCosto(): number {
    return this.items.reduce((acc, cur) => acc + (cur.valor_inventario_costo || 0), 0);
  }

  calcularValorVenta(): number {
    return this.items.reduce((acc, cur) => acc + (cur.valor_inventario_venta || 0), 0);
  }

  contarBajoStock(): number {
    return this.items.filter(i => i.estado_inventario === 'BAJO STOCK' || i.estado_inventario === 'AGOTADO').length;
  }
}
