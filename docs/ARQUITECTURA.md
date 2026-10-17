# Arquitectura del Sistema de Gestión para Supermercado
**Universidad Mariano Gálvez de Guatemala**  
**Facultad de Ingeniería en Sistemas de Información**  
**Cursos:** Desarrollo Web & Bases de Datos I  

---

## 1. Visión General de la Arquitectura

El sistema implementa una arquitectura en capas moderna y desacoplada basada en el patrón cliente-servidor mediante servicios REST:

```
               USUARIO (Cajero / Administrador)
                             │
                             ▼
     ┌───────────────────────────────────────────────────┐
     │                     FRONTEND                      │
     │      Angular (SPA - Single Page Application)      │
     │   - Enrutamiento y Guards de Navegación           │
     │   - Componentes Reactivos Standalone              │
     │   - HttpClient para consumo de API REST           │
     │   - Formularios y Validación en Tiempo Real       │
     └───────────────────────┬───────────────────────────┘
                             │
                      Peticiones HTTP (JSON)
                      GET, POST, PUT, DELETE
                             │
                             ▼
     ┌───────────────────────────────────────────────────┐
     │                     BACKEND                       │
     │                 FastAPI (Python)                  │
     │   - Controladores RESTful estructurados           │
     │   - Validación de Esquemas con Pydantic           │
     │   - Reglas de Negocio (Control de Stock)          │
     │   - Manejo de Transacciones Atómicas              │
     │   - ORM SQLAlchemy 2.0                            │
     └───────────────────────┬───────────────────────────┘
                             │
                      Conexión TCP / Pool
                             │
                             ▼
     ┌───────────────────────────────────────────────────┐
     │                  BASE DE DATOS                    │
     │              PostgreSQL / Supabase                │
     │   - 9 Tablas Relacionales Normalizadas (3FN)      │
     │   - Restricciones: PK, FK, UNIQUE, CHECK, DEFAULT │
     │   - Transacciones ACID                            │
     │   - Índices para alto rendimiento                 │
     └───────────────────────────────────────────────────┘
```

---

## 2. Flujo de Información (Ejemplo: Proceso de Venta)

Siguiendo el flujo requerido en el laboratorio:

1. **Angular**: El cajero busca productos en el catálogo visual, ingresa cantidades y selecciona al cliente.
2. **Angular**: Se valida en el cliente que las cantidades sean mayores a cero y no excedan el stock visual.
3. **Petición HTTP**: Angular envía un `POST /api/ventas` con el payload JSON conteniendo el `id_cliente` y el arreglo de `detalles`.
4. **FastAPI**: El router `ventas.py` recibe y deserializa la petición validándola contra el esquema `VentaCreate` (Pydantic).
5. **FastAPI**: Se inicia una transacción atómica en PostgreSQL.
6. **Validación de Inventario (Regla Crítica)**:
   ```python
   if prod.existencia < item.cantidad:
       raise HTTPException(
           status_code=400,
           detail=f"Stock insuficiente para '{prod.nombre}'. Existencia: {prod.existencia}"
       )
   ```
7. **Descuento de Inventario**:
   $$\text{existencia}_{\text{nueva}} = \text{existencia} - \text{cantidad}$$
8. **Inserción de Registros**:
   - Se crea el registro maestro en la tabla `ventas`.
   - Se insertan las filas correspondientes en `detalle_ventas`.
9. **Confirmación (Commit)**: Se confirma la transacción en PostgreSQL.
10. **Respuesta JSON**: FastAPI retorna el objeto `VentaResponse` con código HTTP 201 Created.
11. **Angular**: Muestra el mensaje *"Venta registrada correctamente"*, actualiza el inventario en pantalla y abre el ticket/factura para impresión.

---

## 3. Catálogo de Recursos REST (Endpoints FastAPI)

| Módulo | Método | Endpoint | Descripción |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Validación de credenciales y generación de sesión |
| **Categorías** | `GET` | `/api/categorias` | Listar todas las categorías activas |
| | `POST` | `/api/categorias` | Registrar una nueva categoría |
| | `PUT` | `/api/categorias/{id}` | Actualizar datos de categoría |
| | `DELETE`| `/api/categorias/{id}`| Desactivar categoría |
| **Productos** | `GET` | `/api/productos` | Listar productos con búsqueda y filtros |
| | `GET` | `/api/productos/bajo-stock` | Productos por debajo del stock mínimo |
| | `POST` | `/api/productos` | Registrar producto (valida `precio_venta >= precio_compra`) |
| | `PUT` | `/api/productos/{id}` | Modificar datos de producto |
| | `DELETE`| `/api/productos/{id}`| Desactivar producto |
| **Clientes** | `GET` | `/api/clientes` | Listar clientes con búsqueda por NIT/nombre |
| | `POST` | `/api/clientes` | Registrar nuevo cliente |
| | `PUT` | `/api/clientes/{id}` | Actualizar datos de cliente |
| **Proveedores**| `GET` | `/api/proveedores` | Listar proveedores comerciales |
| | `POST` | `/api/proveedores` | Registrar proveedor |
| **Compras** | `GET` | `/api/compras` | Listar historial de órdenes de compra |
| | `POST` | `/api/compras` | Registrar compra (incrementa `existencia` en productos) |
| **Ventas** | `GET` | `/api/ventas` | Listar facturas emitidas |
| | `POST` | `/api/ventas` | Registrar venta (valida stock y descuenta `existencia`) |
| **Inventario** | `GET` | `/api/inventario` | Resumen de existencias y valorización en Quetzales |
| **Dashboard** | `GET` | `/api/dashboard/stats`| Métricas y KPIs en tiempo real |
| **Reportes** | `GET` | `/api/reportes/productos-mas-vendidos` | Reporte 1: Ranking por volumen e ingresos |
| | `GET` | `/api/reportes/inventario-bajo` | Reporte 2: Alertas de reabastecimiento |
| | `GET` | `/api/reportes/ventas-rango-fechas` | Reporte 3: Filtro por fecha inicial y final |
| | `GET` | `/api/reportes/ventas-por-cliente` | Reporte 4: Total y promedio por comprador |
| | `GET` | `/api/reportes/consultas-sql/{num}` | Ejecución en vivo de las 10 consultas SQL del curso |
