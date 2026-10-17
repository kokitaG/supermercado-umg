import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container" *ngIf="isLoggedIn(); else loginView">
      <!-- SIDEBAR MENÚ PRINCIPAL -->
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-icon">
            <i class="ri-shopping-cart-2-fill"></i>
          </div>
          <div class="brand-text">
            <h1>SuperMercado</h1>
            <span>UMG</span>
          </div>
        </div>

        <nav class="nav-menu">
          <div class="nav-section-title">Operaciones Principales</div>
          
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" id="nav-dashboard">
            <i class="ri-dashboard-3-line"></i>
            <span>Dashboard</span>
          </a>

          <a routerLink="/ventas" routerLinkActive="active" class="nav-item" id="nav-ventas">
            <i class="ri-shopping-basket-line"></i>
            <span>Ventas (Facturación)</span>
          </a>

          <a routerLink="/compras" routerLinkActive="active" class="nav-item" id="nav-compras">
            <i class="ri-truck-line"></i>
            <span>Compras</span>
          </a>

          <a routerLink="/inventario" routerLinkActive="active" class="nav-item" id="nav-inventario">
            <i class="ri-archive-line"></i>
            <span>Inventario</span>
          </a>

          <div class="nav-section-title" style="margin-top: 1rem;">Catálogos Maestros</div>

          <a routerLink="/productos" routerLinkActive="active" class="nav-item" id="nav-productos">
            <i class="ri-store-2-line"></i>
            <span>Productos</span>
          </a>

          <a routerLink="/categorias" routerLinkActive="active" class="nav-item" id="nav-categorias">
            <i class="ri-price-tag-3-line"></i>
            <span>Categorías</span>
          </a>

          <a routerLink="/clientes" routerLinkActive="active" class="nav-item" id="nav-clientes">
            <i class="ri-user-star-line"></i>
            <span>Clientes</span>
          </a>

          <a routerLink="/proveedores" routerLinkActive="active" class="nav-item" id="nav-proveedores">
            <i class="ri-team-line"></i>
            <span>Proveedores</span>
          </a>

          <div class="nav-section-title" style="margin-top: 1rem;">Analítica</div>

          <a routerLink="/reportes" routerLinkActive="active" class="nav-item" id="nav-reportes">
            <i class="ri-pie-chart-2-line"></i>
            <span>Reportes & SQL</span>
          </a>
        </nav>

        <!-- PERFIL Y CERRAR SESIÓN -->
        <div class="user-profile-badge">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #4f46e5; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff;">
              {{ getUserInitials() }}
            </div>
            <div>
              <div style="font-size: 0.85rem; font-weight: 600; color: #fff;">{{ getUserName() }}</div>
              <div style="font-size: 0.72rem; color: #10b981;">{{ getUserRole() }}</div>
            </div>
          </div>
          <button (click)="logout()" title="Cerrar sesión" class="btn btn-secondary btn-sm" id="btn-logout" style="padding: 0.4rem 0.6rem;">
            <i class="ri-logout-box-r-line"></i>
          </button>
        </div>
      </aside>

      <!-- CONTENIDO PRINCIPAL -->
      <main class="main-content">
        <header class="top-bar">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="badge badge-primary">Sistema Académico UMG</span>
            <span style="color: var(--text-dim); font-size: 0.85rem;">Bases de Datos I + Desarrollo Web</span>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span class="badge" 
                  [style.background]="dbStatus.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'"
                  [style.color]="dbStatus.connected ? '#10b981' : '#f87171'"
                  [style.border]="dbStatus.connected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'"
                  style="font-size: 0.8rem; padding: 0.35rem 0.75rem;"
                  [title]="dbStatus.tooltip">
              <i class="ri-database-2-line"></i> {{ dbStatus.text }}
            </span>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Moneda Oficial: <strong>GTQ (Q)</strong></span>
            <div style="width: 8px; height: 8px; border-radius: 50%;"
                 [style.background]="dbStatus.connected ? '#10b981' : '#ef4444'"
                 [style.boxShadow]="dbStatus.connected ? '0 0 8px #10b981' : '0 0 8px #ef4444'"
                 [title]="dbStatus.tooltip"></div>
          </div>
        </header>

        <section class="content-body">
          <!-- ========================================================
               MODIFICACIÓN 1 Y 2: BANNER, ENCABEZADO Y ELEMENTOS VISUALES
               ======================================================== -->
          <div class="banner-lab-git">
            <!-- Modificación 1: Encabezado destacado (0.5 pts) -->
            <h1 class="titulo-lab">Supermercado UMG - Versión Laboratorio Git</h1>

            <!-- Modificación 2: Elementos visuales nuevos (Badge + Botón) (0.5 pts) -->
            <div class="elementos-lab">
              <span class="badge-lab">Rama: main / Verificado</span>
              <button type="button" class="btn-lab" (click)="verificarEstadoLab()">
                <i class="ri-shield-check-line"></i> Test Git Activo
              </button>
            </div>
          </div>

          <router-outlet></router-outlet>
        </section>
      </main>
    </div>

    <!-- VISTA SI NO ESTÁ AUTENTICADO -->
    <ng-template #loginView>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  /* ========================================================
     MODIFICACIÓN 3: ESTILOS CSS DEL BANNER Y BOTÓN (0.5 pts)
     ======================================================== */
  styles: [`
    .banner-lab-git {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 2px solid #3b82f6;
      border-radius: 12px;
      padding: 1.25rem 1.75rem;
      margin-bottom: 1.75rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }
    .titulo-lab {
      color: #60a5fa;
      font-size: 1.45rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.3px;
    }
    .elementos-lab {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .badge-lab {
      background-color: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      text-transform: uppercase;
    }
    .btn-lab {
      background-color: #2563eb;
      color: #ffffff;
      border: none;
      padding: 0.5rem 1.1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s ease;
    }
    .btn-lab:hover {
      background-color: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    }
  `]
})
export class AppComponent implements OnInit {
  dbStatus = {
    connected: false,
    text: 'Verificando BD...',
    tooltip: 'Comprobando conexión con PostgreSQL (laboratorio)'
  };

  constructor(
    public authService: AuthService, 
    private apiService: ApiService,
    private router: Router
  ) {
    const raw = localStorage.getItem('supermercado_user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u.username === 'admin' || (u.nombre_completo && u.nombre_completo.includes('Carlos'))) {
          u.nombre_completo = 'Oscar G';
          localStorage.setItem('supermercado_user', JSON.stringify(u));
        }
      } catch (e) {}
    }
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
    this.checkDbHealth();
  }

  verificarEstadoLab(): void {
    alert('¡Laboratorio Git UMG verificado y funcionando correctamente!');
  }

  checkDbHealth(): void {
    this.apiService.getHealth().subscribe((res) => {
      if (res && res.status === 'ok') {
        this.dbStatus = {
          connected: true,
          text: `Base de Datos: ${res.motor_base_datos}`,
          tooltip: `Conectado a ${res.ubicacion}`
        };
      } else if (res && res.status === 'offline') {
        this.dbStatus = {
          connected: false,
          text: 'Backend Detenido (:8000)',
          tooltip: 'El servidor FastAPI no responde. Inicia: python run.py en backend'
        };
      } else {
        this.dbStatus = {
          connected: false,
          text: 'PostgreSQL Desconectado',
          tooltip: res.detalle_error || res.conexion_bd || 'Error al conectar'
        };
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUserName(): string {
    const u = this.authService.getUser();
    if (!u) return 'Oscar G';
    if (u.username === 'admin' || (u.nombre_completo && u.nombre_completo.includes('Carlos'))) {
      return 'Oscar G';
    }
    return u.nombre_completo;
  }

  getUserRole(): string {
    const u = this.authService.getUser();
    return u ? u.rol : 'Administrador';
  }

  getUserInitials(): string {
    const name = this.getUserName();
    if (name === 'Oscar G') return 'OG';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}