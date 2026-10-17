import datetime
from sqlalchemy.orm import Session
from app.models import Usuario, Categoria, Producto, Cliente, Proveedor, Compra, DetalleCompra, Venta, DetalleVenta

def seed_database(db: Session):
    """Inserta datos iniciales de forma modular si faltan registros en las tablas de PostgreSQL"""
    print(">>> [SEED] Iniciando verificación y sincronización en PostgreSQL...")

    # 1. USUARIOS
    try:
        usuarios = [
            Usuario(
                nombre_completo="Oscar G",
                username="admin",
                email="admin@supermercado.gt",
                password_hash="admin123",
                rol="Administrador",
                estado=True
            ),
            Usuario(
                nombre_completo="Ana Lucía Morales",
                username="amorales",
                email="cajero1@supermercado.gt",
                password_hash="cajero123",
                rol="Cajero",
                estado=True
            ),
            Usuario(
                nombre_completo="Edwin Estuardo Gómez",
                username="egomez",
                email="supervisor@supermercado.gt",
                password_hash="super123",
                rol="Supervisor",
                estado=True
            )
        ]
        for u in usuarios:
            existente = db.query(Usuario).filter(Usuario.username == u.username).first()
            if not existente:
                db.add(u)
            elif u.username == "admin" and existente.nombre_completo != "Oscar G":
                existente.nombre_completo = "Oscar G"
        db.commit()
        print(">>> [SEED] Usuarios sincronizados (Administrador: Oscar G).")
    except Exception as e:
        db.rollback()
        print(f">>> [SEED ERROR] Usuarios: {e}")

    # 2. CATEGORÍAS
    try:
        categorias_def = [
            ("CAT-BEB", "Bebidas", "Jugos, gaseosas, aguas purificadas y energizantes"),
            ("CAT-LAC", "Lácteos", "Leches pasteurizadas, quesos, cremas y yogures"),
            ("CAT-CAR", "Carnes", "Cortes de res, cerdo, aves y embutidos"),
            ("CAT-FRU", "Frutas", "Frutas frescas de temporada"),
            ("CAT-VER", "Verduras", "Hortalizas, legumbres y vegetales"),
            ("CAT-LIM", "Limpieza", "Detergentes, desinfectantes y cloro"),
            ("CAT-HIG", "Higiene Personal", "Jabones, champús y pastas dentales"),
            ("CAT-PAN", "Panadería", "Pan dulce, francés e integral"),
            ("CAT-CON", "Congelados", "Vegetales congelados y helados"),
            ("CAT-ABA", "Abarrotes", "Granos básicos, aceites, café y pastas"),
        ]
        existing_cats = db.query(Categoria).all()
        existing_names = {c.nombre.lower(): c for c in existing_cats}
        existing_codes = {c.codigo.lower(): c for c in existing_cats}

        for cod, nom, desc in categorias_def:
            if nom.lower() not in existing_names and cod.lower() not in existing_codes:
                db.add(Categoria(codigo=cod, nombre=nom, descripcion=desc, estado=True))
        db.commit()
        print(">>> [SEED] Categorías sincronizadas.")
    except Exception as e:
        db.rollback()
        print(f">>> [SEED ERROR] Categorías: {e}")

    # 3. PROVEEDORES
    try:
        if db.query(Proveedor).count() == 0:
            proveedores = [
                Proveedor(identificador="PRV-001", nombre_proveedor="Distribuidora La Cervecería y Bebidas S.A.", nit="8472910-4", nombre_contacto="Ing. Roberto Paiz", telefono="2384-9000", correo="ventas@distribuidorabebidas.gt", direccion="Calzada Aguilar Batres 34-77 Zona 11, Guatemala", estado=True),
                Proveedor(identificador="PRV-002", nombre_proveedor="Lácteos del Altiplano & Trébol", nit="3910294-8", nombre_contacto="Licda. Silvia Castillo", telefono="7765-1200", correo="pedidos@lacteosaltiplano.com", direccion="Km. 24.5 Carretera a El Salvador, Fraijanes", estado=True),
                Proveedor(identificador="PRV-003", nombre_proveedor="Carnes Selectas de Guatemala S.A.", nit="5501928-1", nombre_contacto="Mario René Pineda", telefono="2477-8899", correo="contacto@carnesselectas.gt", direccion="Av. Petapa 14-88 Zona 12, Guatemala", estado=True),
                Proveedor(identificador="PRV-004", nombre_proveedor="Abarrotes y Granos Mayas S.A.", nit="1294820-9", nombre_contacto="Brenda Marroquín", telefono="2230-4545", correo="info@granosmayas.com.gt", direccion="18 Calle 9-22 Zona 1, Guatemala", estado=True),
                Proveedor(identificador="PRV-005", nombre_proveedor="Industrias Químicas y Limpieza S.A.", nit="6718290-3", nombre_contacto="Héctor Rodas", telefono="6633-1122", correo="servicio@quimicaslimpieza.gt", direccion="Carretera al Atlántico Km 8.5 Zona 17, Guatemala", estado=True)
            ]
            db.add_all(proveedores)
            db.commit()
            print(">>> [SEED] Proveedores sincronizados.")
    except Exception as e:
        db.rollback()
        print(f">>> [SEED ERROR] Proveedores: {e}")

    # 4. CLIENTES
    try:
        if db.query(Cliente).count() == 0:
            clientes = [
                Cliente(identificador="CLI-001", nombres="Consumidor", apellidos="Final", nit="C/F", telefono="0000-0000", correo="cf@supermercado.gt", direccion="Ciudad de Guatemala", estado=True),
                Cliente(identificador="CLI-002", nombres="Juan José", apellidos="Pérez López", nit="4829104-5", telefono="5521-9988", correo="juan.perez@gmail.com", direccion="Colonia El Carmen, Zona 12, Guatemala", estado=True),
                Cliente(identificador="CLI-003", nombres="María Alejandra", apellidos="García Fuentes", nit="3910294-1", telefono="4120-7766", correo="maria.garcia@outlook.com", direccion="Residenciales Las Luces, Santa Catarina Pinula", estado=True),
                Cliente(identificador="CLI-004", nombres="Carlos Roberto", apellidos="Herrera Santos", nit="7482910-8", telefono="5934-2211", correo="carlos.herrera@hotmail.com", direccion="Zona 7 de Mixco, Colonia Bosques de San Nicolás", estado=True),
                Cliente(identificador="CLI-005", nombres="Sandra Patricia", apellidos="Rodríguez Solís", nit="9102948-2", telefono="3011-4455", correo="sandra.rodriguez@gmail.com", direccion="Zona 10, Ciudad de Guatemala", estado=True)
            ]
            db.add_all(clientes)
            db.commit()
            print(">>> [SEED] Clientes sincronizados.")
    except Exception as e:
        db.rollback()
        print(f">>> [SEED ERROR] Clientes: {e}")

    # 5. PRODUCTOS
    try:
        if db.query(Producto).count() == 0:
            cats = db.query(Categoria).all()
            def get_cat_id(keyword):
                for c in cats:
                    if keyword.lower() in c.codigo.lower() or keyword.lower() in c.nombre.lower():
                        return c.id_categoria
                return cats[0].id_categoria if cats else 1

            id_beb = get_cat_id("beb")
            id_lac = get_cat_id("lac")
            id_pan = get_cat_id("pan")
            id_aba = get_cat_id("aba")
            id_lim = get_cat_id("lim")
            id_car = get_cat_id("car")

            productos = [
                Producto(codigo="PROD-001", nombre="Agua Pura Salvavidas 1L", descripcion="Agua purificada 1000ml", id_categoria=id_beb, precio_compra=3.50, precio_venta=5.50, existencia=45, stock_minimo=15, estado=True),
                Producto(codigo="PROD-002", nombre="Gaseosa Coca Cola 2.5L", descripcion="Refresco familiar desechable", id_categoria=id_beb, precio_compra=14.00, precio_venta=18.00, existencia=28, stock_minimo=12, estado=True),
                Producto(codigo="PROD-003", nombre="Jugo de Naranja Kerns 1L", descripcion="Jugo néctar natural", id_categoria=id_beb, precio_compra=8.50, precio_venta=12.00, existencia=8, stock_minimo=10, estado=True),
                Producto(codigo="PROD-004", nombre="Leche Entera Dos Pinos 1L", descripcion="Leche fluida pasteurizada", id_categoria=id_lac, precio_compra=8.00, precio_venta=12.00, existencia=50, stock_minimo=20, estado=True),
                Producto(codigo="PROD-005", nombre="Queso Crema Trebolac 225g", descripcion="Queso untable pasteurizado", id_categoria=id_lac, precio_compra=9.50, precio_venta=14.50, existencia=18, stock_minimo=10, estado=True),
                Producto(codigo="PROD-006", nombre="Crema Pura La Vaquita 500ml", descripcion="Crema de vaca fresca", id_categoria=id_lac, precio_compra=11.00, precio_venta=16.00, existencia=6, stock_minimo=12, estado=True),
                Producto(codigo="PROD-007", nombre="Pan Baguette Francés (Paquete)", descripcion="Bolsa con 5 unidades", id_categoria=id_pan, precio_compra=3.00, precio_venta=5.00, existencia=60, stock_minimo=25, estado=True),
                Producto(codigo="PROD-008", nombre="Pan Sandwich Integral Bimbo", descripcion="Pan de molde con semillas", id_categoria=id_pan, precio_compra=14.50, precio_venta=21.00, existencia=22, stock_minimo=10, estado=True),
                Producto(codigo="PROD-009", nombre="Café Tostado León 400g", descripcion="Café 100% arábigo guatemalteco", id_categoria=id_aba, precio_compra=24.00, precio_venta=35.00, existencia=35, stock_minimo=15, estado=True),
                Producto(codigo="PROD-010", nombre="Aceite Vegetal Capullo 800ml", descripcion="Aceite puro comestible", id_categoria=id_aba, precio_compra=12.00, precio_venta=17.50, existencia=30, stock_minimo=15, estado=True),
                Producto(codigo="PROD-011", nombre="Arroz Blanco Gran Gallo 1 lb", descripcion="Arroz grano largo", id_categoria=id_aba, precio_compra=3.20, precio_venta=5.00, existencia=80, stock_minimo=20, estado=True),
                Producto(codigo="PROD-012", nombre="Frijol Negro Ducal 430g (Lata)", descripcion="Frijoles volteados", id_categoria=id_aba, precio_compra=6.50, precio_venta=9.75, existencia=4, stock_minimo=15, estado=True),
                Producto(codigo="PROD-013", nombre="Detergente Blanca Nieves 1kg", descripcion="Detergente biodegradable", id_categoria=id_lim, precio_compra=10.00, precio_venta=15.00, existencia=40, stock_minimo=15, estado=True),
                Producto(codigo="PROD-014", nombre="Cloro Magia Blanca 1 Galón", descripcion="Desinfectante concentrado", id_categoria=id_lim, precio_compra=14.00, precio_venta=20.00, existencia=16, stock_minimo=10, estado=True),
                Producto(codigo="PROD-015", nombre="Libra de Pollo Rey", descripcion="Piezas de pollo frescas", id_categoria=id_car, precio_compra=10.50, precio_venta=15.00, existencia=25, stock_minimo=15, estado=True),
                Producto(codigo="PROD-016", nombre="Libra de Carne para Asar", descripcion="Corte fino de res", id_categoria=id_car, precio_compra=28.00, precio_venta=42.00, existencia=5, stock_minimo=10, estado=True),
            ]
            db.add_all(productos)
            db.commit()
            print(">>> [SEED] Productos sincronizados con stock.")
    except Exception as e:
        db.rollback()
        print(f">>> [SEED ERROR] Productos: {e}")

    # 6. COMPRAS INICIALES
    try:
        if db.query(Compra).count() == 0:
            prov = db.query(Proveedor).first()
            admin_user = db.query(Usuario).filter(Usuario.username == "admin").first() or db.query(Usuario).first()
            if prov and admin_user:
                c1 = Compra(numero_compra="CMP-2026-001", id_proveedor=prov.id_proveedor, id_usuario=admin_user.id_usuario, total=1092.50, estado="Completada", observaciones="Abastecimiento inicial lácteos")
                db.add(c1)
                db.commit()
                db.refresh(c1)

                prod_leche = db.query(Producto).filter(Producto.codigo == "PROD-004").first()
                prod_queso = db.query(Producto).filter(Producto.codigo == "PROD-005").first()
                prod_crema = db.query(Producto).filter(Producto.codigo == "PROD-006").first()
                if prod_leche and prod_queso and prod_crema:
                    db.add_all([
                        DetalleCompra(id_compra=c1.id_compra, id_producto=prod_leche.id_producto, cantidad=100, precio_compra=8.00, subtotal=800.00),
                        DetalleCompra(id_compra=c1.id_compra, id_producto=prod_queso.id_producto, cantidad=25, precio_compra=9.50, subtotal=237.50),
                        DetalleCompra(id_compra=c1.id_compra, id_producto=prod_crema.id_producto, cantidad=5, precio_compra=11.00, subtotal=55.00),
                    ])
                    db.commit()
                    print(">>> [SEED] Compras iniciales sincronizadas.")
    except Exception as e:
        db.rollback()
        print(f">>> [SEED ERROR] Compras: {e}")

    # 7. VENTAS INICIALES
    try:
        if db.query(Venta).count() == 0:
            prods = db.query(Producto).all()
            clientes = db.query(Cliente).all()
            usr = db.query(Usuario).first()

            if prods and clientes and usr:
                c1 = clientes[0]
                c2 = clientes[1] if len(clientes) > 1 else c1
                c3 = clientes[2] if len(clientes) > 2 else c1

                # Venta 1
                p1 = prods[0]
                p2 = prods[1] if len(prods) > 1 else p1
                sub1 = round(float(p1.precio_venta) * 2, 2)
                sub2 = round(float(p2.precio_venta) * 1, 2)
                tot1 = round(sub1 + sub2, 2)
                v1 = Venta(
                    numero_venta="VNT-1001",
                    id_cliente=c1.id_cliente,
                    id_usuario=usr.id_usuario,
                    fecha=datetime.datetime.now() - datetime.timedelta(hours=2),
                    total=tot1,
                    estado="Completada",
                    observaciones="Venta inicial en caja 1"
                )
                db.add(v1)
                db.commit()
                db.refresh(v1)
                db.add_all([
                    DetalleVenta(id_venta=v1.id_venta, id_producto=p1.id_producto, cantidad=2, precio_unitario=float(p1.precio_venta), subtotal=sub1),
                    DetalleVenta(id_venta=v1.id_venta, id_producto=p2.id_producto, cantidad=1, precio_unitario=float(p2.precio_venta), subtotal=sub2),
                ])

                # Venta 2
                if len(prods) > 2:
                    p3 = prods[2]
                    sub3 = round(float(p3.precio_venta) * 3, 2)
                    v2 = Venta(
                        numero_venta="VNT-1002",
                        id_cliente=c2.id_cliente,
                        id_usuario=usr.id_usuario,
                        fecha=datetime.datetime.now() - datetime.timedelta(hours=1),
                        total=sub3,
                        estado="Completada",
                        observaciones="Venta cliente frecuente"
                    )
                    db.add(v2)
                    db.commit()
                    db.refresh(v2)
                    db.add(DetalleVenta(id_venta=v2.id_venta, id_producto=p3.id_producto, cantidad=3, precio_unitario=float(p3.precio_venta), subtotal=sub3))

                # Venta 3
                if len(prods) > 3:
                    p4 = prods[3]
                    sub4 = round(float(p4.precio_venta) * 2, 2)
                    v3 = Venta(
                        numero_venta="VNT-1003",
                        id_cliente=c3.id_cliente,
                        id_usuario=usr.id_usuario,
                        fecha=datetime.datetime.now(),
                        total=sub4,
                        estado="Completada",
                        observaciones="Venta en efectivo"
                    )
                    db.add(v3)
                    db.commit()
                    db.refresh(v3)
                    db.add(DetalleVenta(id_venta=v3.id_venta, id_producto=p4.id_producto, cantidad=2, precio_unitario=float(p4.precio_venta), subtotal=sub4))

                db.commit()
                print(">>> [SEED] Ventas iniciales sincronizadas con éxito.")
    except Exception as e:
        db.rollback()
        print(f">>> [SEED ERROR] Ventas: {e}")

    print(">>> [SEED] Sincronización modular finalizada.")
