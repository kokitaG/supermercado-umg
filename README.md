# Sistema de Gestión para Supermercado
### Universidad Mariano Gálvez de Guatemala (UMG)
**Facultad de Ingeniería en Sistemas de Información**  
**Proyecto Final de Semestre Integrado:**  
- **Desarrollo Web**
- **Bases de Datos I**

---

## 📌 Arquitectura y Tecnologías
- **Frontend**: [Angular](file:///C:/Users/OEMA/.gemini/antigravity-ide/scratch/supermercado-umg/frontend) (Componentes Standalone, TypeScript, Reactive Forms, Vanilla CSS Design System).
- **Backend**: [FastAPI](file:///C:/Users/OEMA/.gemini/antigravity-ide/scratch/supermercado-umg/backend) (Python REST API, Pydantic, SQLAlchemy 2.0).
- **Base de Datos**: [PostgreSQL / Supabase](file:///C:/Users/OEMA/.gemini/antigravity-ide/scratch/supermercado-umg/database) (con fallback SQLite local automático).

---

## 📁 Estructura del Repositorio

```
supermercado-umg/
├── database/                        # [Bases de Datos I]
│   ├── schema.sql                   # DDL: CREATE TABLE, PK, FK, CHECK, UNIQUE, DEFAULT
│   ├── seed_data.sql                # DML: Datos iniciales guatemaltecos (moneda Quetzales Q)
│   ├── consultas_requeridas.sql     # Las 10 Consultas SQL obligatorias evaluadas
│   └── modelo_er.md                 # Diagrama Entidad-Relación Mermaid y Diccionario
├── backend/                         # [Desarrollo Web - Backend]
│   ├── app/
│   │   ├── main.py                  # API FastAPI con CORS y auto-sembrado
│   │   ├── config.py                # Variables de entorno y conexión a PostgreSQL/Supabase
│   │   ├── database.py              # Motor SQLAlchemy
│   │   ├── models.py                # Modelos ORM relacionales
│   │   ├── schemas.py               # Validadores Pydantic de entrada y salida
│   │   ├── seed.py                  # Sembrador automático de datos de prueba
│   │   └── routers/                 # Endpoints REST para cada recurso
│   ├── requirements.txt             # Dependencias Python
│   ├── .env.example                 # Plantilla de variables de entorno
│   └── run.py                       # Script para iniciar el servidor
├── frontend/                        # [Desarrollo Web - Frontend Angular]
│   ├── src/app/
│   │   ├── components/              # Login, Dashboard, Ventas, Compras, Inventario, Catálogos, Reportes
│   │   ├── services/                # ApiService y AuthService (Consumo HTTP)
│   │   └── models/                  # Interfaces TypeScript
│   ├── package.json
│   └── angular.json
├── docs/                            # Documentación Académica
│   ├── ARQUITECTURA.md              # Diagramas y flujos de información
│   ├── GUIA_INSTALACION.md          # Instrucciones paso a paso para ejecutar el proyecto
│   └── GUIA_DEFENSA_PROYECTO.md     # Rúbrica y respuestas para defender la evaluación
└── demo-sistema.html                # Demostración interactiva instantánea en el navegador
```

---

## 🚀 Inicio Rápido

### 1. Iniciar el Backend (FastAPI)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python run.py
```
*API disponible en:* `http://localhost:8000`  
*Swagger interactivo:* `http://localhost:8000/docs`

### 2. Iniciar el Frontend (Angular)
```bash
abrir otra terminal
cd frontend
npm install
npm start
```
*Aplicación web en:* `http://localhost:4201`

### 3. Demostración Instantánea


## 🔑 Credenciales de Acceso
- **Administrador**: `admin` / `admin123`
- **Cajero**: `amorales` / `cajero123`
## ☁️ Conexión a Supabase (Cloud)
- **Proyecto**: `Supermercado_UMG`
- **ID Referencia**: `mxxmrkxthsulvtbjhgmi`
- **Host Pooler**: `aws-0-us-east-1.pooler.supabase.com:5432`
- **Base de Datos**: `postgres`
- **Comando para probar conexión**:
  ```bash
  python -c "from app.db import engine; from sqlalchemy import text; conn=engine.connect(); print(conn.execute(text('select 1')).scalar()); conn.close()"
  ```