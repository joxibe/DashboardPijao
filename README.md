# Dashboard de Gestión de Pendientes Comunitarios — Comunidad Pijao

Esta aplicación web estática sirve como un portal público interactivo para que la comunidad consulte en tiempo real el progreso de los compromisos y pendientes. Los datos se gestionan directamente desde Google Sheets y se exponen mediante una API REST en Google Apps Script.

---

## 🛠️ Estructura del Proyecto

El repositorio está compuesto por los siguientes archivos clave:

1. **`index.html`**: El frontend del dashboard.
   - Construido con **HTML5, Vanilla JavaScript y Tailwind CSS**.
   - Diseñado bajo el enfoque **Mobile-First**: en dispositivos móviles se muestra como tarjetas individuales y en pantallas de escritorio como una tabla elegante.
   - Incluye filtros interactivos por estados (*Pendiente, En gestión, Finalizado, Reaperturado*) y buscador en tiempo real sobre todos los campos.
   - Formatea automáticamente la columna **Valor** a pesos colombianos (`COP`).
   - Se conecta al API de Google Apps Script para actualizar la información al cargar.
   
2. **`api.gs`**: El backend que reside en Google Sheets.
   - Código escrito para **Google Apps Script** (JavaScript adaptado para servicios de Google Workspace).
   - Contiene la función `doGet(e)` para responder a solicitudes HTTP GET de manera pública.
   - Procesa la hoja de cálculo activa de manera dinámica, normalizando las columnas de la fila 1 a minúsculas y sin acentos.
   - Formatea y convierte de manera segura las columnas de fechas para que viajen como texto limpio (`YYYY-MM-DD`).

---

## 📋 Estructura Requerida en Google Sheets

Para que la API lea y normalice los datos de manera correcta, la **Fila 1** (encabezados) de la hoja de cálculo de Google Sheets debe estructurarse de la siguiente manera:

| Columna A | Columna B | Columna C | Columna D | Columna E | Columna F | Columna G | Columna H | Columna I |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `titulo` | `descripcion` | `estado` | `prioridad` | `fechaReporte` | `fechaCierre` | `valor` | `responsable` |

### Reglas para los Datos:
1. **Mayúsculas/Minúsculas en Encabezados**: No importan. El Apps Script convierte automáticamente todas las cabeceras a minúsculas sin acentos ni espacios especiales para generar el JSON.
2. **Columna `estado`**: Los valores deben coincidir con los filtros de la página:
   - `Pendiente` (Badge Amarillo)
   - `En gestión` (Badge Azul)
   - `Finalizado` (Badge Verde)
   - `Reaperturado` (Badge Rojo)
3. **Columna `prioridad`**: Soporta valores como `Alta`, `Media` y `Baja`.
4. **Columnas de Fecha**: Puedes usar el calendario integrado de Google Sheets (Validación de Datos). La API se encarga de convertir la fecha al formato estándar `AAAA-MM-DD`.
5. **Columna `valor`**: Ingresa solo números planos (ej. `1200000`). Google Sheets puede darle el formato visual de pesos, y en el dashboard se convertirá automáticamente a moneda COP (`$1.200.000`).
6. **Columnas adicionales**: Puedes agregar libremente columnas extra a la derecha (ej. *Ubicación*, *Observaciones*). El sistema las detectará y renderizará automáticamente como etiquetas informativas sin requerir cambios de código.

---

## 🚀 Guía de Despliegue y Mantenimiento

### Paso 1: Configurar la API en Google Sheets
1. En tu Google Sheet, ve a **Extensiones** > **Apps Script**.
2. Pega todo el contenido de [`api.gs`](./api.gs) en el archivo de código.
3. Haz clic en **Implementar** (o *Deploy*) > **Nueva implementación**.
4. Selecciona el tipo **Aplicación web** (icono de engranaje).
5. Configura los parámetros:
   - **Ejecutar como**: `Yo` (tu usuario propietario).
   - **Quién tiene acceso**: `Cualquier persona` (para permitir la lectura pública).
6. Copia la URL de aplicación web generada (termina en `/exec`).

### Paso 2: Vincular la API con el Frontend
1. Abre el archivo [`index.html`](./index.html).
2. En la línea `249`, localiza la constante `GAS_API_URL` y reemplaza su valor con la URL que copiaste:
   ```javascript
   const GAS_API_URL = 'https://script.google.com/macros/s/TU_CODIGO_AQUI/exec';
   ```
3. Guarda el archivo y realiza un commit y push a tu rama principal de GitHub.

### Paso 3: Publicar en GitHub Pages
1. Ve a la configuración de tu repositorio en GitHub (**Settings**).
2. En la barra lateral izquierda, haz clic en **Pages**.
3. En la sección *Build and deployment*, elige como fuente (**Source**): `Deploy from a branch`.
4. Selecciona tu rama `main` y la carpeta raíz `/` (root).
5. Haz clic en **Save**. En unos minutos, GitHub te dará el enlace público de tu dashboard.

---

## 🔒 Seguridad e Integridad

- **Acceso Restringido**: El enlace de edición del Google Sheet (`https://docs.google.com/spreadsheets/d/.../edit`) solo debe tener acceso de edición para el administrador. 
- **Lectura Pública**: La URL del Apps Script (`/exec`) funciona únicamente para consultas de lectura (método GET), por lo que nadie podrá modificar, borrar ni alterar la base de datos a través del sitio web.
