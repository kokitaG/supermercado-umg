from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal, get_db
from app.routers import (
    auth,
    categorias,
    productos,
    clientes,
    proveedores,
    compras,
    ventas,
    inventario,
    dashboard,
    reportes
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verificación de conexión y tablas al arrancar
    try:
        Base.metadata.create_all(bind=engine)
        if not str(engine.url).startswith("sqlite"):
            from sqlalchemy import text
            statements = [
                # Tabla: usuarios
                "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(150);",
                "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS username VARCHAR(50);",
                "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email VARCHAR(100);",
                "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);",
                "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(30) DEFAULT 'Administrador';",
                "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado BOOLEAN DEFAULT TRUE;",
                "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP;",
                "CREATE TABLE IF NOT EXISTS bitacora_logins (id_login SERIAL PRIMARY KEY, id_usuario INT, username VARCHAR(80), fecha_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP, ip_origen VARCHAR(50) DEFAULT '127.0.0.1', rol VARCHAR(30));",
                "UPDATE usuarios SET nombre_completo = 'Oscar G' WHERE nombre_completo IS NULL;",
                "UPDATE usuarios SET username = 'admin' WHERE username IS NULL;",
                "UPDATE usuarios SET email = 'admin@supermercado.gt' WHERE email IS NULL;",
                "UPDATE usuarios SET password_hash = 'admin123' WHERE password_hash IS NULL;",
                "UPDATE usuarios SET rol = 'Administrador' WHERE rol IS NULL;",
                "INSERT INTO usuarios (nombre_completo, username, email, password_hash, rol, estado) SELECT 'Oscar G', 'admin', 'admin@supermercado.gt', 'admin123', 'Administrador', TRUE WHERE NOT EXISTS (SELECT 1 FROM usuarios);",

                # Tabla: categorias
                "ALTER TABLE categorias ADD COLUMN IF NOT EXISTS descripcion TEXT;",
                "ALTER TABLE categorias ADD COLUMN IF NOT EXISTS estado BOOLEAN DEFAULT TRUE;",
                "ALTER TABLE categorias ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                
                # Tabla: productos
                "ALTER TABLE productos ADD COLUMN IF NOT EXISTS descripcion TEXT;",
                "ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_minimo INT DEFAULT 10;",
                "ALTER TABLE productos ADD COLUMN IF NOT EXISTS estado BOOLEAN DEFAULT TRUE;",
                "ALTER TABLE productos ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",

                # Tabla: clientes
                "ALTER TABLE clientes ADD COLUMN IF NOT EXISTS identificador VARCHAR(50);",
                "ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);",
                "ALTER TABLE clientes ADD COLUMN IF NOT EXISTS correo VARCHAR(100);",
                "ALTER TABLE clientes ADD COLUMN IF NOT EXISTS direccion VARCHAR(255);",
                "ALTER TABLE clientes ADD COLUMN IF NOT EXISTS estado BOOLEAN DEFAULT TRUE;",
                "ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                "UPDATE clientes SET identificador = 'CLI-' || LPAD(id_cliente::text, 3, '0') WHERE identificador IS NULL;",
                
                # Carga de clientes guatemaltecos con sus respectivos NIT
                "INSERT INTO clientes (identificador, nombres, apellidos, nit, telefono, correo, direccion, estado) SELECT 'CLI-003', 'María Alejandra', 'García Fuentes', '3910294-1', '4120-7766', 'maria.garcia@outlook.com', 'Santa Catarina Pinula, Guatemala', TRUE WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = '3910294-1');",
                "INSERT INTO clientes (identificador, nombres, apellidos, nit, telefono, correo, direccion, estado) SELECT 'CLI-004', 'Carlos Roberto', 'Herrera Santos', '7482910-8', '5934-2211', 'carlos.herrera@hotmail.com', 'Zona 7 de Mixco, Guatemala', TRUE WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = '7482910-8');",
                "INSERT INTO clientes (identificador, nombres, apellidos, nit, telefono, correo, direccion, estado) SELECT 'CLI-005', 'Sandra Patricia', 'Rodríguez Solís', '9102948-2', '3011-4455', 'sandra.rodriguez@gmail.com', 'Zona 10, Ciudad de Guatemala', TRUE WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = '9102948-2');",
                "INSERT INTO clientes (identificador, nombres, apellidos, nit, telefono, correo, direccion, estado) SELECT 'CLI-006', 'Luis Fernando', 'Morales Castillo', '1245890-3', '4255-6677', 'luis.morales@yahoo.com', 'Zona 11 Las Majadas, Guatemala', TRUE WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = '1245890-3');",
                "INSERT INTO clientes (identificador, nombres, apellidos, nit, telefono, correo, direccion, estado) SELECT 'CLI-007', 'Ana Sofía', 'Mendoza Ramos', '6738291-0', '5899-1122', 'sofia.mendoza@gmail.com', 'Carretera a El Salvador Km 14.5', TRUE WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = '6738291-0');",
                "INSERT INTO clientes (identificador, nombres, apellidos, nit, telefono, correo, direccion, estado) SELECT 'CLI-008', 'Jorge Mario', 'Alvarado Estrada', '8592014-7', '3144-8899', 'jorge.alvarado@gmail.com', 'San José Pinula, Guatemala', TRUE WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = '8592014-7');",
                "INSERT INTO clientes (identificador, nombres, apellidos, nit, telefono, correo, direccion, estado) SELECT 'CLI-009', 'Claudia Elizabeth', 'Vásquez Ruano', '2349182-4', '4711-3344', 'claudia.vasquez@gmail.com', 'Zona 14 La Cañada, Guatemala', TRUE WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = '2349182-4');",
                "INSERT INTO clientes (identificador, nombres, apellidos, nit, telefono, correo, direccion, estado) SELECT 'CLI-010', 'Héctor David', 'Chávez Sandoval', '5629103-9', '5300-7788', 'hector.chavez@gmail.com', 'Zona 1 Centro Histórico, Guatemala', TRUE WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = '5629103-9');",
                "INSERT INTO clientes (identificador, nombres, apellidos, nit, telefono, correo, direccion, estado) SELECT 'CLI-011', 'Karla Paola', 'Gómez Monterroso', '4182903-6', '4922-5566', 'karla.gomez@gmail.com', 'Villa Nueva, Guatemala', TRUE WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = '4182903-6');",
                "INSERT INTO clientes (identificador, nombres, apellidos, nit, telefono, correo, direccion, estado) SELECT 'CLI-012', 'Diego Alejandro', 'Pineda Figueroa', '7819204-1', '3566-9900', 'diego.pineda@gmail.com', 'San Miguel Petapa, Guatemala', TRUE WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE nit = '7819204-1');",

                # Tabla: proveedores
                "ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS identificador VARCHAR(50);",
                "ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS nombre_contacto VARCHAR(100);",
                "ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);",
                "ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS correo VARCHAR(100);",
                "ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS direccion VARCHAR(255);",
                "ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS estado BOOLEAN DEFAULT TRUE;",
                "ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                "UPDATE proveedores SET identificador = 'PRV-' || LPAD(id_proveedor::text, 3, '0') WHERE identificador IS NULL;",

                # Tabla: compras y detalle_compras
                "ALTER TABLE compras ADD COLUMN IF NOT EXISTS numero_compra VARCHAR(30);",
                "ALTER TABLE compras ADD COLUMN IF NOT EXISTS fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                "ALTER TABLE compras ADD COLUMN IF NOT EXISTS total NUMERIC(12, 2) DEFAULT 0.00;",
                "ALTER TABLE compras ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'Completada';",
                "ALTER TABLE compras ADD COLUMN IF NOT EXISTS observaciones TEXT;",
                "UPDATE compras SET numero_compra = 'CMP-' || LPAD(id_compra::text, 4, '0') WHERE numero_compra IS NULL;",
                "ALTER TABLE detalle_compras ADD COLUMN IF NOT EXISTS precio_compra NUMERIC(10, 2);",
                "ALTER TABLE detalle_compras ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2);",

                # Tabla: ventas y detalle_ventas
                "ALTER TABLE ventas ADD COLUMN IF NOT EXISTS numero_venta VARCHAR(30);",
                "ALTER TABLE ventas ADD COLUMN IF NOT EXISTS fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                "ALTER TABLE ventas ADD COLUMN IF NOT EXISTS total NUMERIC(12, 2) DEFAULT 0.00;",
                "ALTER TABLE ventas ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'Completada';",
                "ALTER TABLE ventas ADD COLUMN IF NOT EXISTS observaciones TEXT;",
                "UPDATE ventas SET numero_venta = 'VNT-' || LPAD(id_venta::text, 4, '0') WHERE numero_venta IS NULL;",
                "ALTER TABLE detalle_ventas ADD COLUMN IF NOT EXISTS precio_unitario NUMERIC(10, 2);",
                "ALTER TABLE detalle_ventas ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2);",
                "ALTER TABLE detalle_ventas ADD COLUMN IF NOT EXISTS cantidad INT DEFAULT 1;",

                # Compatibilidad con columna 'precio' de esquemas heredados
                "ALTER TABLE detalle_ventas ALTER COLUMN precio DROP NOT NULL;",
                "ALTER TABLE detalle_ventas ALTER COLUMN precio SET DEFAULT 0.00;",
                "ALTER TABLE detalle_compras ALTER COLUMN precio DROP NOT NULL;",
                "ALTER TABLE detalle_compras ALTER COLUMN precio SET DEFAULT 0.00;",

                # Eliminar restricciones CHECK heredadas que bloquean estados
                "ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_estado_check;",
                "ALTER TABLE compras DROP CONSTRAINT IF EXISTS compras_estado_check;",
                "ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;",

                # Sincronizador de precio para detalle_ventas y detalle_compras
                """
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'detalle_ventas' AND column_name = 'precio') THEN
                        CREATE OR REPLACE FUNCTION fn_sync_dv_precio() RETURNS TRIGGER AS $f$
                        BEGIN
                            IF NEW.precio IS NULL THEN
                                NEW.precio := NEW.precio_unitario;
                            END IF;
                            RETURN NEW;
                        END;
                        $f$ LANGUAGE plpgsql;

                        DROP TRIGGER IF EXISTS trg_sync_dv_precio ON detalle_ventas;
                        CREATE TRIGGER trg_sync_dv_precio BEFORE INSERT OR UPDATE ON detalle_ventas
                        FOR EACH ROW EXECUTE FUNCTION fn_sync_dv_precio();
                    END IF;

                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'detalle_compras' AND column_name = 'precio') THEN
                        CREATE OR REPLACE FUNCTION fn_sync_dc_precio() RETURNS TRIGGER AS $f$
                        BEGIN
                            IF NEW.precio IS NULL THEN
                                NEW.precio := NEW.precio_compra;
                            END IF;
                            RETURN NEW;
                        END;
                        $f$ LANGUAGE plpgsql;

                        DROP TRIGGER IF EXISTS trg_sync_dc_precio ON detalle_compras;
                        CREATE TRIGGER trg_sync_dc_precio BEFORE INSERT OR UPDATE ON detalle_compras
                        FOR EACH ROW EXECUTE FUNCTION fn_sync_dc_precio();
                    END IF;
                END $$;
                """,
                # Poblar detalle_ventas automáticamente si está vacía pero hay ventas
                """
                DO $$
                DECLARE
                    v_rec RECORD;
                    p1 INT;
                    p2 INT;
                    pr1 NUMERIC(10,2);
                    pr2 NUMERIC(10,2);
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM detalle_ventas) THEN
                        SELECT id_producto, COALESCE(precio_venta, 15.00) INTO p1, pr1 FROM productos ORDER BY id_producto LIMIT 1;
                        SELECT id_producto, COALESCE(precio_venta, 20.00) INTO p2, pr2 FROM productos ORDER BY id_producto DESC LIMIT 1;
                        IF p1 IS NOT NULL THEN
                            FOR v_rec IN SELECT id_venta FROM ventas LOOP
                                INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
                                VALUES (v_rec.id_venta, p1, 2, pr1, round(2 * pr1, 2));
                                IF p2 IS NOT NULL AND p2 <> p1 THEN
                                    INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
                                    VALUES (v_rec.id_venta, p2, 1, pr2, round(1 * pr2, 2));
                                END IF;
                            END LOOP;
                        END IF;
                    END IF;
                END $$;
                """,
                "UPDATE ventas v SET total = (SELECT COALESCE(SUM(subtotal), 54.00) FROM detalle_ventas dv WHERE dv.id_venta = v.id_venta) WHERE v.total IS NULL OR v.total = 0.00;"
            ]
            for stmt in statements:
                try:
                    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
                        conn.execute(text(stmt))
                except Exception:
                    pass
        target_name = "Supabase Cloud" if "supabase" in str(engine.url) else "PostgreSQL Local"
        print(f">>> [BASE DE DATOS] Conexión establecida exitosamente con {target_name} ({engine.url.host}).")

        # Sincronización automática de datos iniciales de prueba si faltan ventas
        try:
            with SessionLocal() as db_session:
                from app.seed import seed_database
                seed_database(db_session)
        except Exception as seed_err:
            print(f">>> [SEED ERROR EN LIFESPAN] {seed_err}")
    except Exception as e:
        print(f"\n>>> [ERROR CONEXIÓN BD] Error al verificar base de datos: {e}\n")
    yield

app = FastAPI(
    title="Sistema de Gestión para Supermercado - API REST",
    description="Backend desarrollado con FastAPI y PostgreSQL/Supabase para la Universidad Mariano Gálvez de Guatemala (Desarrollo Web & Bases de Datos I)",
    version="1.0.0",
    lifespan=lifespan
)

# Configuración de CORS para permitir la comunicación con la aplicación Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción especificar el dominio del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de routers
app.include_router(auth.router)
app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(clientes.router)
app.include_router(proveedores.router)
app.include_router(compras.router)
app.include_router(ventas.router)
app.include_router(inventario.router)
app.include_router(dashboard.router)
app.include_router(reportes.router)

from sqlalchemy.exc import OperationalError
from fastapi.responses import JSONResponse

@app.exception_handler(OperationalError)
async def db_exception_handler(request, exc: OperationalError):
    orig_msg = str(exc.orig) if hasattr(exc, "orig") else str(exc)
    return JSONResponse(
        status_code=503,
        content={
            "detail": f"Error de conexión con PostgreSQL: {orig_msg}"
        }
    )

from app.config import DATABASE_URL

@app.get("/")
def root():
    db_name = DATABASE_URL.split("/")[-1].split("?")[0]
    motor = f"SQLite Local ({db_name})" if "sqlite" in DATABASE_URL else f"PostgreSQL ({db_name})"
    return {
        "sistema": "Sistema de Gestión para Supermercado",
        "universidad": "Universidad Mariano Gálvez de Guatemala",
        "facultad": "Facultad de Ingeniería en Sistemas de Información",
        "cursos": ["Desarrollo Web", "Bases de Datos I"],
        "base_de_datos_activa": motor,
        "archivo_local": "backend/supermercado.db" if "sqlite" in DATABASE_URL else None,
        "estado": "En línea",
        "documentacion": "/docs"
    }

@app.get("/api/health")
def health():
    db_name = DATABASE_URL.split("/")[-1].split("?")[0]
    motor = f"SQLite Local ({db_name})" if "sqlite" in DATABASE_URL else f"PostgreSQL ({db_name})"
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "conexion_bd": "conectado",
            "motor_base_datos": motor,
            "database_name": db_name,
            "ubicacion": "backend/supermercado.db" if "sqlite" in DATABASE_URL else f"localhost:5432/{db_name}"
        }
    except Exception as e:
        return {
            "status": "error_db",
            "conexion_bd": "desconectado",
            "detalle_error": str(e),
            "motor_base_datos": motor,
            "database_name": db_name,
            "ubicacion": f"localhost:5432/{db_name}"
        }

@app.get("/api/sync-seed")
@app.post("/api/sync-seed")
def sync_seed_endpoint(db: Session = Depends(get_db)):
    from app.seed import seed_database
    from app.models import Producto, Categoria, Proveedor, Cliente, Compra, Venta, Usuario
    try:
        seed_database(db)
        return {
            "status": "ok",
            "mensaje": "Base de datos PostgreSQL sincronizada exitosamente",
            "usuarios": db.query(Usuario).count(),
            "categorias": db.query(Categoria).count(),
            "proveedores": db.query(Proveedor).count(),
            "clientes": db.query(Cliente).count(),
            "productos": db.query(Producto).count(),
            "compras": db.query(Compra).count(),
            "ventas": db.query(Venta).count(),
        }
    except Exception as e:
        return {
            "status": "error",
            "mensaje": f"Error al sincronizar con PostgreSQL: {str(e)}"
        }

