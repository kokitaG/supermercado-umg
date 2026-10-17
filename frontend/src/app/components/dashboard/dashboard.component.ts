import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DashboardStats } from '../../models/supermercado.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <!-- HEADER DASHBOARD -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 1.85rem; margin-bottom: 0.35rem;">Panel de Control General</h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Resumen en tiempo real de operaciones, inventario y facturación comercial.</p>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button (click)="cargarDashboard()" class="btn btn-secondary" [disabled]="isLoading" title="Actualizar datos">
            <i class="ri-refresh-line"></i> {{ isLoading ? 'Cargando...' : 'Actualizar' }}
          </button>
          <a routerLink="/ventas" class="btn btn-success" id="btn-quick-sale">
            <i class="ri-add-circle-line"></i> Nueva Venta
          </a>
          <a routerLink="/compras" class="btn btn-primary" id="btn-quick-purchase">
            <i class="ri-truck-line"></i> Registrar Compra
          </a>
        </div>
      </div>

      <!-- ALERTA DE ERROR SI EL SERVIDOR FALLA -->
      <div *ngIf="errorMessage" class="alert-banner alert-danger" style="margin-bottom: 1.5rem;">
        <i class="ri-error-warning-fill"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- BANNER DE BASE DE DATOS ACTIVA -->
      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-md); padding: 0.85rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center; color: #10b981; font-size: 1.2rem;">
            <i class="ri-database-2-fill"></i>
          </div>
          <div>
            <div style="font-size: 0.88rem; font-weight: 600; color: #fff;">Base de Datos Conectada: <span style="color: #10b981;">PostgreSQL / Supabase Cloud</span></div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">Instancia activa: <code style="color: #a7f3d0; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">Supermercado_UMG (Supabase) / PostgreSQL</code></div>
          </div>
        </div>
        <span class="badge badge-success"><i class="ri-check-line"></i> Guardando en Tiempo Real</span>
      </div>

      <!-- ALERTA DE STOCK BAJO SI APLICA -->
      <div *ngIf="stats?.bajo_stock_count && stats.bajo_stock_count > 0" class="alert-banner alert-warning" id="alert-low-stock">
        <i class="ri-alert-fill" style="font-size: 1.25rem;"></i>
        <div style="flex: 1;">
          <strong>Atención Reabastecimiento:</strong> Se detectaron <strong>{{ stats.bajo_stock_count }} productos</strong> por debajo del stock mínimo de seguridad.
        </div>
        <a routerLink="/inventario" class="btn btn-secondary btn-sm">Ver Inventario</a>
      </div>

      <!-- TARJETAS DE ESTADÍSTICAS OBLIGATORIAS (5 KPIs) -->
      <div class="grid-stats">
        <div class="stat-card">
          <div class="stat-icon indigo">
            <i class="ri-store-2-line"></i>
          </div>
          <div class="stat-info">
            <h3>Productos Registrados</h3>
            <div class="stat-value">{{ stats ? stats.total_productos : 0 }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon cyan">
            <i class="ri-user-star-line"></i>
          </div>
          <div class="stat-info">
            <h3>Clientes Registrados</h3>
            <div class="stat-value">{{ stats ? stats.total_clientes : 0 }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon emerald">
            <i class="ri-shopping-basket-line"></i>
          </div>
          <div class="stat-info">
            <h3>Ventas Realizadas</h3>
            <div class="stat-value">{{ stats ? stats.total_ventas : 0 }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon emerald">
            <i class="ri-money-dollar-circle-line"></i>
          </div>
          <div class="stat-info">
            <h3>Ventas del Día</h3>
            <div class="stat-value">Q{{ (stats ? stats.ventas_hoy : 0) | number:'1.2-2' }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rose">
            <i class="ri-alarm-warning-line"></i>
          </div>
          <div class="stat-info">
            <h3>Bajo Inventario</h3>
            <div class="stat-value" style="color: #fb7185;">{{ stats ? stats.bajo_stock_count : 0 }}</div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN GRÁFICA Y DE ACTIVIDAD -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        
        <!-- VENTAS POR CATEGORÍA -->
        <div class="panel-card" style="margin-bottom: 0;">
          <div class="panel-header">
            <div class="panel-title">
              <i class="ri-pie-chart-line"></i>
              <h2>Ventas por Categoría (Q)</h2>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div *ngFor="let item of stats?.ventas_por_categoria" style="display: flex; flex-direction: column; gap: 0.35rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                <span style="font-weight: 500;">{{ item.categoria }}</span>
                <span style="color: var(--accent-emerald); font-weight: 600;">Q{{ item.total | number:'1.2-2' }}</span>
              </div>
              <div style="height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
                <div [style.width.%]="getBarWidth(item.total)" style="height: 100%; background: linear-gradient(90deg, #4f46e5, #06b6d4); border-radius: 4px;"></div>
              </div>
            </div>
            <div *ngIf="!stats?.ventas_por_categoria || stats?.ventas_por_categoria?.length === 0" style="color: var(--text-dim); font-size: 0.85rem; text-align: center; padding: 1.5rem 0;">
              No hay ventas registradas por categoría en la base de datos
            </div>
          </div>
        </div>

        <!-- PRODUCTOS MÁS VENDIDOS -->
        <div class="panel-card" style="margin-bottom: 0;">
          <div class="panel-header">
            <div class="panel-title">
              <i class="ri-medal-line"></i>
              <h2>Productos Más Vendidos</h2>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div *ngFor="let prod of stats?.top_productos; let i = index" style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; background: var(--bg-card); border-radius: var(--radius-sm);">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="width: 26px; height: 26px; border-radius: 50%; background: var(--primary-light); color: #818cf8; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;">#{{ i + 1 }}</span>
                <span style="font-weight: 500; font-size: 0.9rem;">{{ prod.nombre }}</span>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 700; color: #fff;">{{ prod.unidades }} uds</div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">Q{{ prod.total | number:'1.2-2' }}</div>
              </div>
            </div>
            <div *ngIf="!stats?.top_productos || stats?.top_productos?.length === 0" style="color: var(--text-dim); font-size: 0.85rem; text-align: center; padding: 1.5rem 0;">
              No hay productos vendidos en la base de datos
            </div>
          </div>
        </div>

      </div>

      <!-- ÚLTIMAS VENTAS REGISTRADAS -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <i class="ri-history-line"></i>
            <h2>Últimas Ventas Emitidas</h2>
          </div>
          <a routerLink="/ventas" class="btn btn-secondary btn-sm">Ver Todas las Ventas</a>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>No. Factura</th>
                <th>Fecha y Hora</th>
                <th>Cliente</th>
                <th>Total Facturado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let v of stats?.ventas_recientes">
                <td><strong style="color: #818cf8;">{{ v.numero_venta }}</strong></td>
                <td>{{ v.fecha }}</td>
                <td>{{ v.cliente }}</td>
                <td><strong style="color: var(--accent-emerald);">Q{{ v.total | number:'1.2-2' }}</strong></td>
                <td><span class="badge badge-success">{{ v.estado }}</span></td>
              </tr>
              <tr *ngIf="!stats?.ventas_recientes || stats?.ventas_recientes?.length === 0">
                <td colspan="5" style="text-align: center; color: var(--text-dim); padding: 2rem;">
                  No hay ventas registradas en la base de datos aún
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  errorMessage = '';
  isLoading = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getDashboardStats().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.stats = data;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'No se pudieron consultar las estadísticas de PostgreSQL: ' + (err.error?.detail || err.message || 'Error en el servidor');
      }
    });
  }

  getBarWidth(total: number): number {
    return Math.min(100, Math.max(15, (total / 150) * 100));
  }
}
