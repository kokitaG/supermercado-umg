# Guía para la Defensa y Presentación del Proyecto
## Sistema de Gestión para Supermercado - UMG
**Facultad de Ingeniería en Sistemas de Información**  
**Cursos:** Bases de Datos I & Desarrollo Web  

Esta guía contiene la argumentación técnica y las respuestas a las preguntas que los docentes de ambos cursos suelen realizar durante la evaluación final.

---

# PARTE 1: BASES DE DATOS I

### 1. ¿Cómo se diseñó el Modelo Relacional y por qué existen tablas intermedias?
* **Respuesta clave**:
  > *"Entre las entidades **COMPRAS** y **PRODUCTOS**, así como entre **VENTAS** y **PRODUCTOS**, existe una relación natural de muchos a muchos ($N:M$), ya que una venta puede incluir múltiples productos y un producto se vende en muchas ventas. En el modelo relacional, las relaciones $N:M$ no pueden implementarse directamente sin redundancia. Por ello, se crearon las entidades intermedias **`detalle_compras`** y **`detalle_ventas`**, transformando la relación en dos relaciones $1:N$ con llaves foráneas compuestas o sustitutas."*

### 2. ¿Qué restricciones de integridad se implementaron en PostgreSQL?
* **PRIMARY KEY**: En todas las tablas para garantizar la unicidad de tuplas (`id_producto`, `id_venta`, etc.).
* **FOREIGN KEY**: Integridad referencial entre compras/ventas y sus catálogos con `ON DELETE RESTRICT` (evita que se elimine un producto que ya tiene ventas registradas).
* **CHECK Constraints**:
  - `CHECK (precio_compra >= 0)`
  - `CHECK (precio_venta >= precio_compra)`: Garantiza que nunca se venda a pérdida.
  - `CHECK (existencia >= 0)`: Garantiza a nivel de motor que el stock nunca sea negativo.
  - `CHECK (cantidad > 0)`: Valida cantidades válidas en líneas de detalle.
* **UNIQUE**: Restricción de unicidad en códigos de barras (`codigo`), números de comprobante (`numero_venta`, `numero_compra`), NIT y usernames.

### 3. Explicación de las 10 Consultas SQL Evaluadas
| No. | Nombre de Consulta | Cláusulas Utilizadas | Justificación Técnica |
| :---: | :--- | :--- | :--- |
| **1** | Productos con su categoría | `INNER JOIN`, `ORDER BY` | Une la tabla hija `productos` con el maestro `categorias` mediante su llave foránea `id_categoria`. |
| **2** | Productos bajo stock mínimo | `WHERE existencia < stock_minimo` | Filtro lógico condicional para generar alertas de reabastecimiento al encargado de compras. |
| **3** | Ventas en rango de fechas | `BETWEEN`, `INNER JOIN` | Cruce con `clientes` y filtro de tipo fecha para cortes de caja por período. |
| **4** | Productos más vendidos | `SUM(cantidad)`, `GROUP BY`, `ORDER BY DESC` | Agregación por producto sumando las cantidades de `detalle_ventas`. |
| **5** | Clientes con más compras | `COUNT(v.id_venta)`, `SUM(total)`, `GROUP BY` | Agrupa ventas por cliente identificando a los mejores compradores del supermercado. |
| **6** | Ventas agrupadas por cliente | `LEFT JOIN`, `GROUP BY`, `COALESCE` | El `LEFT JOIN` es crucial aquí para que aparezcan también clientes registrados que aún no han hecho su primera compra. |
| **7** | Total comprado a proveedores | `LEFT JOIN`, `SUM(c.total)`, `GROUP BY` | Totaliza las cuentas pagadas a cada distribuidor mayorista. |
| **8** | Total vendido por categoría | Multi-JOIN (`categorias` $\rightarrow$ `productos` $\rightarrow$ `detalle_ventas` $\rightarrow$ `ventas`) | Determina qué pasillo o familia de productos aporta más ingresos brutos. |
| **9** | Promedio de venta por cliente | `AVG(v.total)`, `GROUP BY`, `HAVING` | Uso de `HAVING` para filtrar grupos luego de aplicar la función de agregación `AVG`. |
| **10**| Top 5 productos de mayor ingreso | `SUM(subtotal) DESC LIMIT 5` | Multiplica precio por volumen para identificar los productos más rentables. |

---

# PARTE 2: DESARROLLO WEB

### 1. ¿Cómo se comunican Angular y FastAPI?
* **Respuesta clave**:
  > *"El frontend desarrollado en Angular opera como una SPA (Single Page Application). Cuando el usuario realiza una acción (por ejemplo, registrar una venta), el servicio `ApiService` utiliza `HttpClient` para emitir una petición asíncrona mediante el protocolo HTTP con cabecera `Content-Type: application/json`. El backend en FastAPI intercepta la petición, valida la estructura mediante Pydantic y ejecuta la consulta SQL a través de SQLAlchemy. La respuesta viaja de regreso en formato JSON y Angular actualiza reactivamente el DOM sin recargar la página."*

### 2. ¿Cómo se garantiza la regla de negocio del inventario al vender?
* **Respuesta clave**:
  > *"Se implementó un doble filtro:
  > 1. **En Frontend (Angular)**: La interfaz bloquea al cajero si intenta agregar una cantidad que excede la existencia visual del producto.
  > 2. **En Backend (FastAPI)**: Dentro de una transacción de base de datos (`db.begin()`), se vuelve a consultar el registro en PostgreSQL. Si `existencia < cantidad_solicitada`, el servidor aborta la transacción (`rollback`), no descuenta nada y responde con un código `HTTP 400 Bad Request` indicando el producto exacto agotado. Si hay suficiente stock, ejecuta `existencia = existencia - cantidad` e inserta los detalles atómicamente."*

### 3. ¿Cómo se garantiza la separación de responsabilidades?
* **Frontend**: Presentación, validación reactiva de formularios, experiencia de usuario y consumo de APIs. Ninguna credencial de base de datos ni lógica de almacenamiento reside en Angular.
* **Backend**: Control de acceso, validaciones de negocio críticas, serialización, seguridad y conexión a base de datos.
* **Base de datos**: Persistencia estructurada, integridad referencial y ejecución de consultas relacionales optimizadas.

---

# PARTE 3: DEMOSTRACIÓN PRÁCTICA PASO A PASO (CHECKLIST)

Durante la presentación con el docente, siga este orden para cubrir el 100% de la rúbrica:

1. **Paso 1: Login al Sistema**  
   Ingresar con el usuario `admin` y contraseña `admin123`. Explicar que el sistema valida en el backend y asigna el rol correspondiente.
2. **Paso 2: Dashboard General**  
   Mostrar los 5 indicadores: productos registrados, clientes, ventas realizadas, ventas del día en Quetzales y la alerta de bajo inventario.
3. **Paso 3: Catálogos (CRUD)**  
   - Registrar una nueva categoría (ej: "Bebidas Calientes").
   - Registrar un nuevo producto asignado a esa categoría. Mostrar cómo el formulario valida que el precio de venta sea mayor al de compra.
4. **Paso 4: Demostración de Compra (Aumento de Stock)**  
   - Tomar nota de la existencia de un producto (ej: Leche Dos Pinos con 50 unidades).
   - Registrar una orden de compra por 20 unidades.
   - Mostrar cómo la existencia aumenta inmediatamente a 70 unidades en inventario.
5. **Paso 5: Demostración de Venta (Descuento de Stock y Bloqueo)**  
   - Abrir el Punto de Venta.
   - Seleccionar un cliente (ej: Juan Pérez) y agregar 5 unidades del producto.
   - Completar la venta y mostrar el ticket de facturación generado.
   - Verificar en la tabla de productos o inventario que el stock se descontó de 70 a 65 unidades.
   - **Prueba de límite**: Intentar vender 999 unidades del producto para demostrar cómo el sistema bloquea la operación e informa que no hay suficiente existencia.
6. **Paso 6: Demostración de Reportes y las 10 Consultas SQL**  
   - Entrar al módulo de Reportes.
   - Navegar por los 4 reportes obligatorios (Productos más vendidos, Bajo stock, Rango de fechas y Por cliente).
   - Abrir la pestaña *"5. Visor 10 Consultas SQL"* y presionar las consultas del 1 al 10 ante el catedrático de Bases de Datos I para mostrar tanto el código SQL como los datos devueltos en tiempo real.
