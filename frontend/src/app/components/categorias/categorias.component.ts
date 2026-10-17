import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Categoria } from '../../models/supermercado.models';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 1.85rem; margin-bottom: 0.35rem;">Gestión de Categorías</h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Clasificación de pasillos y familias de productos del supermercado.</p>
        </div>
        <button (click)="openCreateModal()" class="btn btn-primary" id="btn-add-category">
          <i class="ri-add-line"></i> Nueva Categoría
        </button>
      </div>

      <div class="panel-card">
        <div class="table-responsive">
          <table class="custom-table" id="tabla-categorias">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cat of categorias">
                <td><strong style="color: #818cf8;">{{ cat.codigo }}</strong></td>
                <td><span style="font-weight: 600;">{{ cat.nombre }}</span></td>
                <td style="color: var(--text-muted); max-width: 320px;">{{ cat.descripcion || 'Sin descripción' }}</td>
                <td>
                  <span class="badge" [ngClass]="cat.estado ? 'badge-success' : 'badge-neutral'">
                    {{ cat.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button (click)="openEditModal(cat)" class="btn btn-secondary btn-sm" title="Editar" style="margin-right: 0.35rem;">
                    <i class="ri-edit-line"></i>
                  </button>
                  <button (click)="deactivateCategoria(cat)" class="btn btn-danger btn-sm" title="Desactivar">
                    <i class="ri-forbid-line"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL CREAR / EDITAR CATEGORÍA -->
      <div *ngIf="showModal" class="modal-overlay">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 style="font-size: 1.25rem;">{{ isEditing ? 'Modificar Categoría' : 'Registrar Categoría' }}</h3>
            <button (click)="closeModal()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem;">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveCategoria()">
            <div class="modal-body">
              <div *ngIf="modalError" class="alert-banner alert-danger">
                <i class="ri-error-warning-fill"></i> {{ modalError }}
              </div>

              <div class="form-group">
                <label class="form-label">Código (Mnemotécnico) *</label>
                <input type="text" class="form-control" [(ngModel)]="currentCat.codigo" name="codigo" required placeholder="Ej. CAT-VER">
              </div>

              <div class="form-group">
                <label class="form-label">Nombre de Categoría *</label>
                <input type="text" class="form-control" [(ngModel)]="currentCat.nombre" name="nombre" required placeholder="Ej. Verduras y Legumbres">
              </div>

              <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" rows="3" [(ngModel)]="currentCat.descripcion" name="descripcion" placeholder="Alcance o tipo de productos"></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-save-cat">
                <i class="ri-save-line"></i> Guardar
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  showModal = false;
  isEditing = false;
  modalError = '';
  currentCat: any = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias() {
    this.api.getCategorias().subscribe({
      next: (data) => this.categorias = data || [],
      error: () => this.categorias = []
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.modalError = '';
    this.currentCat = { codigo: '', nombre: '', descripcion: '', estado: true };
    this.showModal = true;
  }

  openEditModal(cat: Categoria) {
    this.isEditing = true;
    this.modalError = '';
    this.currentCat = { ...cat };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCategoria() {
    this.modalError = '';
    if (this.isEditing) {
      this.api.updateCategoria(this.currentCat.id_categoria, this.currentCat).subscribe({
        next: () => {
          this.closeModal();
          this.loadCategorias();
        },
        error: (err) => this.modalError = err.error?.detail || 'Error al actualizar categoría'
      });
    } else {
      this.api.createCategoria(this.currentCat).subscribe({
        next: () => {
          this.closeModal();
          this.loadCategorias();
        },
        error: (err) => this.modalError = err.error?.detail || 'Error al crear categoría'
      });
    }
  }

  deactivateCategoria(cat: Categoria) {
    if (confirm(`¿Desea desactivar la categoría "${cat.nombre}"?`)) {
      if (cat.id_categoria) {
        this.api.deleteCategoria(cat.id_categoria).subscribe(() => this.loadCategorias());
      }
    }
  }
}
