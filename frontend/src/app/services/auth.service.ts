import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/supermercado.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8000/api/auth';
  private currentUser: Usuario | null = null;

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('supermercado_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        if (res && res.user) {
          this.currentUser = res.user;
          localStorage.setItem('supermercado_user', JSON.stringify(res.user));
          localStorage.setItem('supermercado_token', res.access_token);
        }
      })
    );
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('supermercado_user');
    localStorage.removeItem('supermercado_token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('supermercado_user');
  }

  getToken(): string | null {
    return localStorage.getItem('supermercado_token');
  }

  getUser(): Usuario | null {
    if (!this.currentUser) {
      const savedUser = localStorage.getItem('supermercado_user');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {}
      }
    }
    if (this.currentUser && (this.currentUser.username === 'admin' || (this.currentUser.nombre_completo && this.currentUser.nombre_completo.includes('Carlos')))) {
      this.currentUser.nombre_completo = 'Oscar G';
    }
    return this.currentUser;
  }
}
