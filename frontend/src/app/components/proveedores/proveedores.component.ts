import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Proveedor } from '../../models/supermercado.models';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 1.85rem; margin-bottom: 0.35rem;">Gestión de Proveedores</h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Empresas y distribuidores mayoristas que abastecen el supermercado.</p>
        </div>
        <button (click)="openCreateModal()" class="btn btn-primary" id="btn-add-supplier">
          <i class="ri-user-add-line"></i> Nuevo Proveedor
        </button>
      </div>

      <div class="panel-card">
        <div class="table-responsive">
          <table class="custom-table" id="tabla-proveedores">
            <thead>
              <tr>
                <th>Código</th>
                <th>Razón Social / Proveedor</th>
                <th>NIT</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of proveedores">
                <td><strong style="color: #818cf8;">{{ p.identificador }}</strong></td>
                <td><span style="font-weight: 600;">{{ p.nombre_proveedor }}</span></td>
                <td>{{ p.nit }}</td>
                <td>{{ p.nombre_contacto || 'N/A' }}</td>
                <td>{{ p.telefono }}</td>
                <td>{{ p.correo || 'N/A' }}</td>
                <td>
                  <span class="badge" [ngClass]="p.estado ? 'badge-success' : 'badge-neutral'">
                    {{ p.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button (click)="openEditModal(p)" class="btn btn-secondary btn-sm" title="Editar" style="margin-right: 0.35rem;">
                    <i class="ri-edit-line"></i>
                  </button>
                  <button (click)="deactivateProveedor(p)" class="btn btn-danger btn-sm" title="Desactivar">
                    <i class="ri-forbid-line"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL PROVEEDOR -->
      <div *ngIf="showModal" class="modal-overlay">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 style="font-size: 1.25rem;">{{ isEditing ? 'Editar Proveedor' : 'Registrar Proveedor' }}</h3>
            <button (click)="closeModal()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem;">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveProveedor()">
            <div class="modal-body">
              <div *ngIf="modalError" class="alert-banner alert-danger">
                <i class="ri-error-warning-fill"></i> {{ modalError }}
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Identificador *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentProv.identificador" name="identificador" required placeholder="Ej. PRV-006">
                </div>
                <div class="form-group">
                  <label class="form-label">NIT *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentProv.nit" name="nit" required placeholder="Ej. 1294820-9">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Nombre del Proveedor (Razón Social) *</label>
                <input type="text" class="form-control" [(ngModel)]="currentProv.nombre_proveedor" name="nombre_proveedor" required placeholder="Ej. Distribuidora del Valle S.A.">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nombre de Contacto</label>
                  <input type="text" class="form-control" [(ngModel)]="currentProv.nombre_contacto" name="nombre_contacto" placeholder="Ej. Licda. Karla Soto">
                </div>
                <div class="form-group">
                  <label class="form-label">Teléfono *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentProv.telefono" name="telefono" required placeholder="Ej. 2400-0000">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Correo Electrónico</label>
                <input type="email" class="form-control" [(ngModel)]="currentProv.correo" name="correo" placeholder="pedidos@empresa.com">
              </div>

              <div class="form-group">
                <label class="form-label">Dirección de Empresa</label>
                <input type="text" class="form-control" [(ngModel)]="currentProv.direccion" name="direccion" placeholder="Ej. Calzada Roosevelt Zona 7">
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-save-supplier">
                <i class="ri-save-line"></i> Guardar Proveedor
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  showModal = false;
  isEditing = false;
  modalError = '';
  currentProv: any = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadProveedores();
  }

  loadProveedores() {
    this.api.getProveedores().subscribe({
      next: (data) => this.proveedores = data || [],
      error: () => this.proveedores = []
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.modalError = '';
    this.currentProv = { identificador: '', nombre_proveedor: '', nit: '', nombre_contacto: '', telefono: '', correo: '', direccion: '', estado: true };
    this.showModal = true;
  }

  openEditModal(p: Proveedor) {
    this.isEditing = true;
    this.modalError = '';
    this.currentProv = { ...p };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveProveedor() {
    this.modalError = '';
    if (this.isEditing) {
      this.api.updateProveedor(this.currentProv.id_proveedor, this.currentProv).subscribe({
        next: () => {
          this.closeModal();
          this.loadProveedores();
        },
        error: (err) => this.modalError = err.error?.detail || 'Error al actualizar proveedor'
      });
    } else {
      this.api.createProveedor(this.currentProv).subscribe({
        next: () => {
          this.closeModal();
          this.loadProveedores();
        },
        error: (err) => this.modalError = err.error?.detail || 'Error al registrar proveedor'
      });
    }
  }

  deactivateProveedor(p: Proveedor) {
    if (confirm(`¿Desea desactivar el proveedor "${p.nombre_proveedor}"?`)) {
      if (p.id_proveedor) {
        this.api.deleteProveedor(p.id_proveedor).subscribe(() => this.loadProveedores());
      }
    }
  }
}
