import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Cliente } from '../../models/supermercado.models';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 1.85rem; margin-bottom: 0.35rem;">Gestión de Clientes</h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Registro de compradores, identificación tributaria (NIT) y datos de facturación.</p>
        </div>
        <button (click)="openCreateModal()" class="btn btn-primary" id="btn-add-client">
          <i class="ri-user-add-line"></i> Nuevo Cliente
        </button>
      </div>

      <div class="panel-card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
        <div class="search-input-wrapper">
          <i class="ri-search-line"></i>
          <input type="text" class="form-control" [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Buscar por NIT, nombre, apellido o código...">
        </div>
      </div>

      <div class="panel-card">
        <div class="table-responsive">
          <table class="custom-table" id="tabla-clientes">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre Completo</th>
                <th>NIT</th>
                <th>Teléfono</th>
                <th>Correo Electrónico</th>
                <th>Dirección</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of clientes">
                <td><strong style="color: #818cf8;">{{ c.identificador }}</strong></td>
                <td><span style="font-weight: 600;">{{ c.nombres }} {{ c.apellidos }}</span></td>
                <td><span class="badge badge-primary">{{ c.nit }}</span></td>
                <td>{{ c.telefono || 'N/A' }}</td>
                <td>{{ c.correo || 'N/A' }}</td>
                <td style="color: var(--text-muted);">{{ c.direccion || 'Ciudad' }}</td>
                <td style="text-align: right;">
                  <button (click)="openEditModal(c)" class="btn btn-secondary btn-sm" title="Editar">
                    <i class="ri-edit-line"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL CLIENTE -->
      <div *ngIf="showModal" class="modal-overlay">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 style="font-size: 1.25rem;">{{ isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente' }}</h3>
            <button (click)="closeModal()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem;">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveCliente()">
            <div class="modal-body">
              <div *ngIf="modalError" class="alert-banner alert-danger">
                <i class="ri-error-warning-fill"></i> {{ modalError }}
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Identificador *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentCliente.identificador" name="identificador" required placeholder="Ej. CLI-007">
                </div>
                <div class="form-group">
                  <label class="form-label">NIT *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentCliente.nit" name="nit" required placeholder="Ej. 1234567-8 o C/F">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nombres *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentCliente.nombres" name="nombres" required placeholder="Ej. Brenda Maribel">
                </div>
                <div class="form-group">
                  <label class="form-label">Apellidos *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentCliente.apellidos" name="apellidos" required placeholder="Ej. Gómez Estrada">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Teléfono</label>
                  <input type="text" class="form-control" [(ngModel)]="currentCliente.telefono" name="telefono" placeholder="Ej. 5555-1234">
                </div>
                <div class="form-group">
                  <label class="form-label">Correo Electrónico</label>
                  <input type="email" class="form-control" [(ngModel)]="currentCliente.correo" name="correo" placeholder="correo@ejemplo.com">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Dirección Fiscal / Entrega</label>
                <input type="text" class="form-control" [(ngModel)]="currentCliente.direccion" name="direccion" placeholder="Ej. Zona 11, Guatemala">
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-save-client">
                <i class="ri-save-line"></i> Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  searchQuery = '';
  showModal = false;
  isEditing = false;
  modalError = '';
  currentCliente: any = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes() {
    this.api.getClientes(this.searchQuery).subscribe({
      next: (data) => this.clientes = data || [],
      error: () => this.clientes = []
    });
  }

  onSearch() {
    this.loadClientes();
  }

  openCreateModal() {
    this.isEditing = false;
    this.modalError = '';
    this.currentCliente = { identificador: '', nombres: '', apellidos: '', nit: 'C/F', telefono: '', correo: '', direccion: '', estado: true };
    this.showModal = true;
  }

  openEditModal(c: Cliente) {
    this.isEditing = true;
    this.modalError = '';
    this.currentCliente = { ...c };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCliente() {
    this.modalError = '';
    if (this.isEditing) {
      this.api.updateCliente(this.currentCliente.id_cliente, this.currentCliente).subscribe({
        next: () => {
          this.closeModal();
          this.loadClientes();
        },
        error: (err) => this.modalError = err.error?.detail || 'Error al actualizar cliente'
      });
    } else {
      this.api.createCliente(this.currentCliente).subscribe({
        next: () => {
          this.closeModal();
          this.loadClientes();
        },
        error: (err) => this.modalError = err.error?.detail || 'Error al registrar cliente'
      });
    }
  }
}
