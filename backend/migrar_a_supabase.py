"""
Script para crear las tablas y poblar los datos iniciales en Supabase
"""
import sys
import os

# Asegurar path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db import engine, Base, SessionLocal
from app.models import Usuario, Categoria, Producto, Cliente, Proveedor, Compra, DetalleCompra, Venta, DetalleVenta
from app.seed import seed_database
from sqlalchemy import text

def migrar():
    print("=" * 60)
    print(">>> Conectando a Supabase y creando tablas...")
    print(f">>> Destino: {engine.url.host}:{engine.url.port}")
    print("=" * 60)

    try:
        # 1. Probar conexión
        with engine.connect() as conn:
            val = conn.execute(text("SELECT 1")).scalar()
            print(">>> [1/3] Conexión establecida con éxito (SELECT 1 -> OK).")

        # 2. Crear todas las tablas en Supabase
        print(">>> [2/3] Creando tablas (usuarios, categorias, productos, clientes, ventas, etc.)...")
        Base.metadata.create_all(bind=engine)
        print(">>> Tablas creadas exitosamente en el esquema public.")

        # 3. Poblar datos iniciales
        print(">>> [3/3] Sembrando datos iniciales...")
        with SessionLocal() as db:
            seed_database(db)

        print("=" * 60)
        print(">>> ¡LISTO! Tablas y datos creados exitosamente en Supabase.")
        print(">>> Ya puedes ir a Supabase Table Editor y presionar F5 para ver todo.")
        print("=" * 60)

    except Exception as e:
        print(f"\n>>> [ERROR]: {e}")
        print("\nSi el error es de conexión o timeout:")
        print("1. Verifica que la contraseña en .env sea correcta.")
        print("2. O copia y pega el contenido de database/schema.sql en el SQL Editor de Supabase.")

if __name__ == "__main__":
    migrar()
