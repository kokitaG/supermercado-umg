import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="margin-bottom: 2rem;">
        <h1 style="font-size: 1.85rem; margin-bottom: 0.35rem;">Centro de Reportes y Consultas SQL</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Informes analíticos requeridos para Desarrollo Web y ejecución de las 10 Consultas SQL de Bases de Datos I.</p>
      </div>

      <!-- TABS DE REPORTES -->
      <div class="tab-group">
        <button (click)="cambiarTab(1)" class="tab-btn" [class.active]="tabActual === 1">
          <i class="ri-medal-line"></i> 1. Productos Más Vendidos
        </button>
        <button (click)="cambiarTab(2)" class="tab-btn" [class.active]="tabActual === 2">
          <i class="ri-alarm-warning-line"></i> 2. Inventario Bajo
        </button>
        <button (click)="cambiarTab(3)" class="tab-btn" [class.active]="tabActual === 3">
          <i class="ri-calendar-line"></i> 3. Ventas por Rango de Fechas
        </button>
        <button (click)="cambiarTab(4)" class="tab-btn" [class.active]="tabActual === 4">
          <i class="ri-user-star-line"></i> 4. Ventas por Cliente
        </button>
        <button (click)="cambiarTab(5)" class="tab-btn" [class.active]="tabActual === 5" style="color: #818cf8;">
          <i class="ri-database-2-line"></i> 5. Visor 10 Consultas SQL (Bases de Datos I)
        </button>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 1: PRODUCTOS MÁS VENDIDOS -->
      <!-- =================================================================== -->
      <div *ngIf="tabActual === 1" class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <i class="ri-bar-chart-grouped-line"></i>
            <h2>Reporte 1: Ranking de Productos Más Vendidos</h2>
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Lugar</th>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th style="text-align: center;">Unidades Vendidas</th>
                <th style="text-align: right;">Total Recaudado (Q)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of repMasVendidos; let idx = index">
                <td>
                  <span class="badge" [ngClass]="idx < 3 ? 'badge-primary' : 'badge-neutral'">
                    #{{ idx + 1 }}
                  </span>
                </td>
                <td><strong style="color: #818cf8;">{{ p.codigo }}</strong></td>
                <td><strong>{{ p.producto }}</strong></td>
                <td><span class="badge badge-primary">{{ p.categoria }}</span></td>
                <td style="text-align: center; font-weight: 700;">{{ p.total_vendido }} unidades</td>
                <td style="text-align: right; color: var(--accent-emerald); font-weight: 700;">
                  Q{{ p.total_quetzales | number:'1.2-2' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 2: PRODUCTOS CON INVENTARIO BAJO -->
      <!-- =================================================================== -->
      <div *ngIf="tabActual === 2" class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <i class="ri-error-warning-line" style="color: #fb7185;"></i>
            <h2>Reporte 2: Alertas de Inventario por Debajo del Stock Mínimo</h2>
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th style="text-align: center;">Existencia Actual</th>
                <th style="text-align: center;">Stock Mínimo</th>
                <th style="text-align: center;">Déficit / Faltante</th>
                <th>Prioridad de Pedido</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of repInventarioBajo">
                <td><strong style="color: #818cf8;">{{ b.codigo }}</strong></td>
                <td><strong>{{ b.producto }}</strong></td>
                <td><span class="badge badge-primary">{{ b.categoria }}</span></td>
                <td style="text-align: center; color: #fb7185; font-weight: 700;">{{ b.existencia }} uds</td>
                <td style="text-align: center;">{{ b.stock_minimo }} uds</td>
                <td style="text-align: center;">
                  <span class="badge badge-danger">-{{ b.deficit }} uds</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="b.estado === 'AGOTADO' ? 'badge-danger' : 'badge-warning'">
                    {{ b.estado === 'AGOTADO' ? 'URGENTE: AGOTADO' : 'REABASTECER' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 3: VENTAS POR RANGO DE FECHAS -->
      <!-- =================================================================== -->
      <div *ngIf="tabActual === 3" class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <i class="ri-calendar-check-line"></i>
            <h2>Reporte 3: Ventas en Rango de Fechas</h2>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 1.5rem; flex-wrap: wrap;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Fecha Inicial</label>
            <input type="date" class="form-control" [(ngModel)]="fechaIni">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Fecha Final</label>
            <input type="date" class="form-control" [(ngModel)]="fechaFin">
          </div>
          <button (click)="cargarVentasRango()" class="btn btn-primary" id="btn-filter-dates">
            <i class="ri-filter-3-line"></i> Filtrar Fechas
          </button>
        </div>

        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
          <div class="stat-card" style="flex: 1;">
            <div class="stat-info">
              <h3>Facturas Emitidas en Período</h3>
              <div class="stat-value">{{ repVentasRango?.total_registros || 0 }}</div>
            </div>
          </div>
          <div class="stat-card" style="flex: 1;">
            <div class="stat-info">
              <h3>Monto Total Acumulado</h3>
              <div class="stat-value" style="color: var(--accent-emerald);">
                Q{{ (repVentasRango?.total_acumulado_quetzales || 0) | number:'1.2-2' }}
              </div>
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>No. Factura</th>
                <th>Fecha y Hora</th>
                <th>Cliente</th>
                <th>NIT</th>
                <th>Total Facturado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let v of repVentasRango?.ventas">
                <td><strong style="color: #818cf8;">{{ v.numero_venta }}</strong></td>
                <td>{{ v.fecha }}</td>
                <td>{{ v.cliente }}</td>
                <td>{{ v.nit }}</td>
                <td><strong style="color: var(--accent-emerald);">Q{{ v.total | number:'1.2-2' }}</strong></td>
                <td><span class="badge badge-success">{{ v.estado }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 4: VENTAS POR CLIENTE -->
      <!-- =================================================================== -->
      <div *ngIf="tabActual === 4" class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <i class="ri-user-star-line"></i>
            <h2>Reporte 4: Consumo y Compras por Cliente</h2>
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Nombre del Cliente</th>
                <th>NIT</th>
                <th style="text-align: center;">Cantidad de Compras</th>
                <th style="text-align: right;">Total Acumulado (Q)</th>
                <th style="text-align: right;">Ticket Promedio (Q)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cl of repVentasCliente">
                <td><strong style="color: #818cf8;">{{ cl.identificador }}</strong></td>
                <td><span style="font-weight: 600;">{{ cl.cliente }}</span></td>
                <td>{{ cl.nit }}</td>
                <td style="text-align: center;">{{ cl.total_compras }} facturas</td>
                <td style="text-align: right; color: var(--accent-emerald); font-weight: 700;">
                  Q{{ cl.monto_total | number:'1.2-2' }}
                </td>
                <td style="text-align: right;">Q{{ cl.promedio_compra | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- =================================================================== -->
      <!-- TAB 5: VISOR DE LAS 10 CONSULTAS SQL DE BASES DE DATOS I -->
      <!-- =================================================================== -->
      <div *ngIf="tabActual === 5" class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <i class="ri-database-2-fill" style="color: #818cf8;"></i>
            <h2>Demostración de las 10 Consultas SQL para Catedrático (Bases de Datos I)</h2>
          </div>
          <span class="badge badge-primary">SQL DDL & DML UMG</span>
        </div>

        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
          Haga clic en cualquiera de las consultas para visualizar la sentencia SQL formulada (JOIN, GROUP BY, HAVING, subconsultas) y ver los resultados en vivo generados por la base de datos:
        </p>

        <!-- SELECTOR DE CONSULTA 1 A 10 -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
          <button *ngFor="let n of [1,2,3,4,5,6,7,8,9,10]" 
                  (click)="ejecutarConsulta(n)" 
                  class="btn btn-sm" 
                  [ngClass]="consultaActiva === n ? 'btn-primary' : 'btn-secondary'">
            Consulta #{{ n }}
          </button>
        </div>

        <div *ngIf="consultaResultado" style="background: var(--bg-card); border-radius: var(--radius-md); padding: 1.5rem; border: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.15rem; color: #fff;">{{ consultaResultado.titulo }}</h3>
            <span class="badge badge-success">{{ consultaResultado.filas_retornadas }} registros retornados</span>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim); margin-bottom: 0.35rem; font-weight: 700;">Sentencia SQL:</div>
            <pre style="background: #0a0e17; color: #38bdf8; padding: 1rem; border-radius: 8px; font-size: 0.85rem; overflow-x: auto; border: 1px solid rgba(255,255,255,0.06); font-family: monospace;">{{ consultaResultado.sentencia_sql }}</pre>
          </div>

          <div class="table-responsive">
            <table class="custom-table" style="background: rgba(0,0,0,0.2);">
              <thead>
                <tr>
                  <th *ngFor="let col of getColumnasResultado()">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let fila of consultaResultado.resultados">
                  <td *ngFor="let col of getColumnasResultado()">
                    {{ fila[col] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  `
})
export class ReportesComponent implements OnInit {
  tabActual = 1;

  repMasVendidos: any[] = [];
  repInventarioBajo: any[] = [];
  repVentasRango: any = null;
  repVentasCliente: any[] = [];

  fechaIni = '2026-09-01';
  fechaFin = '2026-10-31';

  consultaActiva = 1;
  consultaResultado: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarDatosReportes();
    this.ejecutarConsulta(1);
  }

  cambiarTab(num: number) {
    this.tabActual = num;
  }

  cargarDatosReportes() {
    this.api.getReporteProductosMasVendidos().subscribe({
      next: (data) => this.repMasVendidos = data || [],
      error: () => this.repMasVendidos = []
    });

    this.api.getReporteInventarioBajo().subscribe({
      next: (data) => this.repInventarioBajo = data || [],
      error: () => this.repInventarioBajo = []
    });

    this.cargarVentasRango();

    this.api.getReporteVentasPorCliente().subscribe({
      next: (data) => this.repVentasCliente = data || [],
      error: () => this.repVentasCliente = []
    });
  }

  cargarVentasRango() {
    this.api.getReporteVentasRangoFechas(this.fechaIni, this.fechaFin).subscribe({
      next: (data) => this.repVentasRango = data,
      error: () => this.repVentasRango = null
    });
  }

  ejecutarConsulta(num: number) {
    this.consultaActiva = num;
    this.api.getConsultaAcademicaSQL(num).subscribe({
      next: (res) => this.consultaResultado = res,
      error: () => {
        this.consultaResultado = {
          numero: num,
          titulo: `Consulta #${num}`,
          sentencia_sql: 'Consulta ejecutada en PostgreSQL',
          filas_retornadas: 0,
          resultados: []
        };
      }
    });
  }

  getColumnasResultado(): string[] {
    if (!this.consultaResultado || !this.consultaResultado.resultados || this.consultaResultado.resultados.length === 0) {
      return [];
    }
    return Object.keys(this.consultaResultado.resultados[0]);
  }
}
