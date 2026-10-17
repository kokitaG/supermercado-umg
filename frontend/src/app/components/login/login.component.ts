import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 50%, #151c2c 0%, #0a0e17 100%); padding: 1.5rem;">
      <div style="width: 100%; max-width: 440px; background: #121826; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
        
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="width: 60px; height: 60px; border-radius: 14px; background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); margin: 0 auto 1rem auto; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #fff; box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);">
            <i class="ri-shopping-cart-2-fill"></i>
          </div>
          <h1 style="font-size: 1.6rem; margin-bottom: 0.25rem;">SuperMercado UMG</h1>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Sistema Integrado de Gestión Comercial</p>
        </div>

        <div *ngIf="errorMessage" class="alert-banner alert-danger">
          <i class="ri-error-warning-fill"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label class="form-label" for="username">Usuario</label>
            <input type="text" id="username" name="username" class="form-control" [(ngModel)]="username" placeholder="Ej. admin o amorales" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Contraseña</label>
            <input type="password" id="password" name="password" class="form-control" [(ngModel)]="password" placeholder="••••••••" required>
          </div>

          <button type="submit" class="btn btn-primary" id="btn-submit-login" style="width: 100%; padding: 0.85rem; margin-top: 1rem;" [disabled]="isLoading">
            <span *ngIf="!isLoading"><i class="ri-login-box-line"></i> Iniciar Sesión</span>
            <span *ngIf="isLoading">Verificando credenciales...</span>
          </button>
        </form>

        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); text-align: center;">
          <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Acceso Rápido de Prueba</div>
          <div style="display: flex; gap: 0.5rem; justify-content: center;">
            <button type="button" class="btn btn-secondary btn-sm" (click)="setCredentials('admin', 'admin123')">
              <i class="ri-shield-user-line"></i> Admin (admin)
            </button>
            <button type="button" class="btn btn-secondary btn-sm" (click)="setCredentials('amorales', 'cajero123')">
              <i class="ri-user-smile-line"></i> Cajero (amorales)
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  setCredentials(u: string, p: string) {
    this.username = u;
    this.password = p;
  }

  onLogin() {
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        // Si el backend no está corriendo, permitir acceso demo
        if (err.status === 0 || err.status === 404) {
          localStorage.setItem('supermercado_user', JSON.stringify({
            id_usuario: 1,
            nombre_completo: 'Oscar G',
            username: this.username,
            rol: 'Administrador'
          }));
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = err.error?.detail || 'Credenciales inválidas';
        }
      }
    });
  }
}
