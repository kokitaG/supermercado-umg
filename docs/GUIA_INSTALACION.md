# Guía de Instalación y Ejecución del Proyecto
## Sistema de Gestión para Supermercado - UMG

Esta guía describe paso a paso cómo poner en marcha tanto la base de datos, el backend FastAPI y el frontend Angular en su equipo.

---

## 1. Requisitos Previos

Asegúrese de contar con las siguientes herramientas instaladas en su equipo:
- **Python**: Versión 3.10 o superior (verificar con `python --version`).
- **Node.js**: Versión 18 o superior (verificar con `node --version`).
- **Angular CLI**: Versión 17, 18 o 19 (verificar con `ng version`).
- **PostgreSQL** o cuenta gratuita en **Supabase** (opcional, el backend cuenta con fallback automático a SQLite para pruebas locales inmediatas).

---

## 2. Configuración de la Base de Datos (PostgreSQL o Supabase)

### Opción A: En Supabase (Recomendado para la entrega web)
1. Inicie sesión en [supabase.com](https://supabase.com) y cree un nuevo proyecto.
2. Vaya a la sección **SQL Editor** en el panel lateral izquierdo.
3. Abra el archivo `database/schema.sql` del proyecto, copie todo su contenido y presione **Run**.
4. Abra el archivo `database/seed_data.sql`, pegue su contenido y presione **Run** para cargar los datos de prueba guatemaltecos.
5. Copie su cadena de conexión URI desde `Project Settings > Database > Connection string (URI)`.

### Opción B: En PostgreSQL Local
1. Abra pgAdmin o su terminal psql.
2. Cree la base de datos:
   ```sql
   CREATE DATABASE supermercado_umg;
   ```
3. Ejecute los scripts en orden:
   ```bash
   psql -U postgres -d supermercado_umg -f database/schema.sql
   psql -U postgres -d supermercado_umg -f database/seed_data.sql
   ```

---

## 3. Puesta en Marcha del Backend (FastAPI)

1. Abra una terminal en la carpeta `backend`:
   ```bash
   cd backend
   ```

2. Cree y active un entorno virtual de Python:
   ```powershell
   # En Windows PowerShell:
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Instale las dependencias necesarias:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure la base de datos en un archivo `.env` (puede basarse en `.env.example`):
   ```env
   # Si utiliza Supabase o PostgreSQL local:
   DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/supermercado_umg

   # O si desea probarlo inmediatamente sin configurar PostgreSQL:
   DATABASE_URL=sqlite:///./supermercado.db
   ```

5. Inicie el servidor backend:
   ```bash
   python run.py
   ```
   *El servidor quedará disponible en `http://localhost:8000`*.
   *Documentación Swagger interactiva: `http://localhost:8000/docs`*.

---

## 4. Puesta en Marcha del Frontend (Angular)

1. Abra una nueva terminal en la carpeta `frontend`:
   ```bash
   cd frontend
   ```

2. Instale los paquetes de Node.js:
   ```bash
   npm install
   ```

3. Inicie el servidor de desarrollo de Angular:
   ```bash
   npm start
   # o bien: ng serve --open
   ```

4. Abra su navegador web en:
   ```
   http://localhost:4200
   ```

---

## 5. Credenciales de Acceso al Sistema

El sistema cuenta con los siguientes usuarios pre-cargados para la demostración académica:

| Rol | Usuario | Contraseña | Propósito |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` | Acceso total a todos los módulos y reportes |
| **Cajero** | `amorales` | `cajero123` | Facturación en punto de venta y catálogo |
| **Supervisor** | `egomez` | `super123` | Auditoría de inventario y compras |

---

## 6. Demostración Instantánea (Sin instalación previa de Angular)

Si requiere realizar una demostración inmediata o verificar la interfaz sin esperar la descarga de `node_modules`, puede abrir directamente el archivo:
```
supermercado-umg/demo-sistema.html
```
en cualquier navegador web moderno (Chrome, Edge, Firefox). Este archivo contiene la aplicación interactiva completa y se comunica en tiempo real con el backend de FastAPI en `http://localhost:8000`.
