import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Producto, Categoria } from '../../models/supermercado.models';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- HEADER MÓDULO -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 1.85rem; margin-bottom: 0.35rem;">Gestión de Productos</h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Catálogo oficial de productos, precios en Quetzales y control de existencias.</p>
        </div>
        <button (click)="openCreateModal()" class="btn btn-primary" id="btn-add-product">
          <i class="ri-add-line"></i> Nuevo Producto
        </button>
      </div>

      <!-- BARRA DE BÚSQUEDA Y FILTROS -->
      <div class="panel-card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 1rem; flex: 1; min-width: 280px;">
            <div class="search-input-wrapper" style="flex: 1;">
              <i class="ri-search-line"></i>
              <input type="text" class="form-control" [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Buscar por código, nombre o descripción...">
            </div>
            <select class="form-control" style="max-width: 220px;" [(ngModel)]="selectedCategoriaId" (change)="onFilterCategoria()">
              <option [ngValue]="null">Todas las Categorías</option>
              <option *ngFor="let cat of categorias" [ngValue]="cat.id_categoria">{{ cat.nombre }}</option>
            </select>
          </div>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Total encontrados: <strong>{{ productos.length }}</strong></span>
        </div>
      </div>

      <!-- TABLA DE PRODUCTOS -->
      <div class="panel-card">
        <div class="table-responsive">
          <table class="custom-table" id="tabla-productos">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Producto</th>
                <th>Categoría</th>
                <th>P. Compra</th>
                <th>P. Venta</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let prod of productos">
                <td><strong style="color: #818cf8;">{{ prod.codigo }}</strong></td>
                <td>
                  <div style="font-weight: 600;">{{ prod.nombre }}</div>
                  <div style="font-size: 0.78rem; color: var(--text-dim);">{{ prod.descripcion }}</div>
                </td>
                <td><span class="badge badge-primary">{{ prod.categoria_nombre }}</span></td>
                <td>Q{{ prod.precio_compra | number:'1.2-2' }}</td>
                <td><strong style="color: var(--accent-emerald);">Q{{ prod.precio_venta | number:'1.2-2' }}</strong></td>
                <td>
                  <span class="badge" [ngClass]="prod.existencia <= prod.stock_minimo ? 'badge-danger' : 'badge-success'">
                    {{ prod.existencia }} uds
                  </span>
                </td>
                <td>{{ prod.stock_minimo }} uds</td>
                <td>
                  <span class="badge" [ngClass]="prod.estado ? 'badge-success' : 'badge-neutral'">
                    {{ prod.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button (click)="openEditModal(prod)" class="btn btn-secondary btn-sm" title="Editar" style="margin-right: 0.35rem;">
                    <i class="ri-edit-line"></i>
                  </button>
                  <button (click)="deactivateProducto(prod)" class="btn btn-danger btn-sm" title="Desactivar">
                    <i class="ri-forbid-line"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="productos.length === 0">
                <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                  <i class="ri-inbox-line" style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem; color: var(--text-dim);"></i>
                  No se encontraron productos coincidentes
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL CREAR / EDITAR PRODUCTO -->
      <div *ngIf="showModal" class="modal-overlay">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 style="font-size: 1.25rem;">{{ isEditing ? 'Modificar Producto' : 'Registrar Nuevo Producto' }}</h3>
            <button (click)="closeModal()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem;">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <form (ngSubmit)="saveProducto()">
            <div class="modal-body">
              <div *ngIf="modalError" class="alert-banner alert-danger">
                <i class="ri-error-warning-fill"></i> {{ modalError }}
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Código (SKU/Barras) *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentProd.codigo" name="codigo" required placeholder="Ej. PROD-017">
                </div>
                <div class="form-group">
                  <label class="form-label">Categoría *</label>
                  <select class="form-control" [(ngModel)]="currentProd.id_categoria" name="id_categoria" required>
                    <option *ngFor="let c of categorias" [ngValue]="c.id_categoria">{{ c.nombre }}</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Nombre del Producto *</label>
                <input type="text" class="form-control" [(ngModel)]="currentProd.nombre" name="nombre" required placeholder="Ej. Galletas Chocochips 200g">
              </div>

              <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" rows="2" [(ngModel)]="currentProd.descripcion" name="descripcion" placeholder="Detalles del empaque o presentación"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Precio de Compra (Q) *</label>
                  <input type="number" step="0.01" class="form-control" [(ngModel)]="currentProd.precio_compra" name="precio_compra" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Precio de Venta (Q) *</label>
                  <input type="number" step="0.01" class="form-control" [(ngModel)]="currentProd.precio_venta" name="precio_venta" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Existencia Inicial *</label>
                  <input type="number" class="form-control" [(ngModel)]="currentProd.existencia" name="existencia" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Stock Mínimo Alerta *</label>
                  <input type="number" class="form-control" [(ngModel)]="currentProd.stock_minimo" name="stock_minimo" required>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-save-prod">
                <i class="ri-save-line"></i> Guardar Producto
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  searchQuery = '';
  selectedCategoriaId: number | null = null;

  showModal = false;
  isEditing = false;
  modalError = '';
  currentProd: any = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadProductos();
  }

  loadCategorias() {
    this.api.getCategorias().subscribe({
      next: (data) => this.categorias = data || [],
      error: () => this.categorias = []
    });
  }

  loadProductos() {
    this.api.getProductos(this.searchQuery, this.selectedCategoriaId || undefined).subscribe({
      next: (data) => this.productos = data || [],
      error: () => this.productos = []
    });
  }

  onSearch() {
    this.loadProductos();
  }

  onFilterCategoria() {
    this.loadProductos();
  }

  openCreateModal() {
    this.isEditing = false;
    this.modalError = '';
    this.currentProd = {
      codigo: '',
      nombre: '',
      descripcion: '',
      id_categoria: this.categorias[0]?.id_categoria || 1,
      precio_compra: 0.00,
      precio_venta: 0.00,
      existencia: 10,
      stock_minimo: 5,
      estado: true
    };
    this.showModal = true;
  }

  openEditModal(p: Producto) {
    this.isEditing = true;
    this.modalError = '';
    this.currentProd = { ...p };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveProducto() {
    this.modalError = '';
    if (this.currentProd.precio_venta < this.currentProd.precio_compra) {
      this.modalError = 'Regla de negocio: El precio de venta no puede ser menor al precio de compra';
      return;
    }

    if (this.isEditing) {
      this.api.updateProducto(this.currentProd.id_producto, this.currentProd).subscribe({
        next: () => {
          this.closeModal();
          this.loadProductos();
        },
        error: (err) => this.modalError = err.error?.detail || 'Error al actualizar'
      });
    } else {
      this.api.createProducto(this.currentProd).subscribe({
        next: () => {
          this.closeModal();
          this.loadProductos();
        },
        error: (err) => this.modalError = err.error?.detail || 'Error al registrar'
      });
    }
  }

  deactivateProducto(p: Producto) {
    if (confirm(`¿Confirma que desea desactivar el producto "${p.nombre}"?`)) {
      if (p.id_producto) {
        this.api.deleteProducto(p.id_producto).subscribe(() => this.loadProductos());
      }
    }
  }
}
