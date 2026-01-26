# 🚗 Control de Vehículos - Documentación Técnica Completa

## 📋 Descripción General

**Control de Vehículos** es una plataforma empresarial robusta diseñada para la gestión 360° de flotas de transporte. El sistema centraliza la operativa diaria, desde el control de conductores y mantenimiento mecánico hasta la auditoría administrativa de facturación y consumo de combustible.

El sistema se integra con sistemas administrativos externos (ProfitPlus) para la ingesta de datos financieros, consolidando información dispersa en un dashboard unificado para la toma de decisiones.

---

## 🛠 Stack Tecnológico

- **Backend**: Laravel 11.x (PHP 8.2+)
- **Frontend**: React 18 (TypeScript) + Inertia.js (SPA Monolítica)
- **Estilos**: Tailwind CSS
- **Bases de Datos**:
    - **MySQL**: Base de datos principal de la aplicación (usuarios, vehículos, auditorías). Integrado con ProfitPlus.
    - **SQL Server (sqlsrv)**: Conexión de lectura con sistema administrativo legacy para consultar facturación histórica.
- **Transmisión de Eventos**: Laravel Reverb (WebSockets).
- **Reportes**: Maatwebsite Excel.

---

## 🧠 Arquitectura del Sistema

El proyecto sigue una arquitectura **MVC Moderno** potenciado por **Inertia.js**, lo que permite construir una Single Page Application (SPA) utilizando el enrutamiento y controladores clásicos de Laravel.

### Flujo de Datos

1.  **Request**: El usuario navega a una ruta (ej. `/dashboard`).
2.  **Controller**: Laravel procesa la lógica, consulta ambas bases de datos (MySQL/SQL Server) y prepara un objeto props.
3.  **Response**: Se retorna una vista Inertia (`Inertia::render`), inyectando los datos directamente en los componentes React sin necesidad de una API REST separada.

---

## 🚀 Módulos del Sistema

### 1. Dashboard (`DashboardController`)

**Vista**: `dashboard.tsx`
Es el centro de operaciones. Diferencia entre vistas de **Administrador** y **Usuario**.

- **Admin**: Ve todos los vehículos filtrados por su tipo asignado. Recibe alertas de revisiones omitidas y auditorías pendientes.
- **Conductor**: Solo visualiza los vehículos que tiene asignados activamente.
- **KPIs**: Muestra métricas de observaciones no resueltas, facturas por auditar y estado diario de revisiones.

### 2. Gestión de Combustible (`SurtidosController`)

Módulo crítico para el control de costos operativo.

- **Algoritmo de Consumo Ideal**:
  Calcula la eficiencia del vehículo comparando el kilometraje actual vs. anterior.
    ```php
    // Ejemplo simplificado de la lógica de negocio
    $consumo_teorico = ($km_actual - $km_anterior) * $factor_vehiculo; // 0.10 o 0.035
    $desviacion = $consumo_teorico - $litros_reales;
    ```
- **Exportación Financiera**: Permite a los administradores seleccionar múltiples registros y generar un reporte consolidado en Excel para reembolso de gastos, calculando promedios de consumo por flota.

### 3. Ficha Técnica (`FichaTecnicaController`)

Expediente digital único del vehículo. Centraliza 4 sub-módulos:

- **Expediente Mecánico**: Checklist del estado físico del vehículo.
- **Permisología**:
    - Gestión de documentos legales (Trimestres, Seguros).
    - **Alerta de Vencimiento**: Sistema proactivo que notifica fechas próximas a caducar.
    - **Polimorfismo de Archivos**: Soporte transparente para subir tanto PDFs como Imágenes (`App\Services\Multimedia`).
- **Accesorios y Piezas**: Inventario detallado de componentes.

### 4. Facturación y Auditoría (`FacturasController`)

**Conexión Híbrida SQL/MySQL**.

- **Ingesta**: Lee las facturas emitidas directamente desde la base de datos de ProfitPlus (SQL Server).
- **Auditoría**: Permite a los administradores o choferes subir "pruebas" (fotos) de los repuestos comprados asocidándolas a los renglones de la factura original.
- **Flujo de Aprobación**:
    1. Chofer sube foto del repuesto instalado.
    2. Admin revisa la foto vs factura.
    3. Admin aprueba o rechaza con observaciones.

### 5. Asignaciones de Flota (`AsignacionesController`)

Control dinámico de quién conduce qué vehículo.

- **Historial**: Mantiene un log inmutable de todas las asignaciones pasadas y futuras.
- **Validación de Kilometraje**: Al asignar un vehículo, se exige la foto del odómetro para cerrar el ciclo de responsabilidad del conductor anterior.
- **Roles**: Soporta un Conductor Principal y hasta 3 Ayudantes (Usuarios Adicionales).

### 6. Sistema de Envíos (`EnviosController`)

Gestión logística de paquetería interna.

- **Ciclo de Vida**: `Pendiente` -> `En Camino` (Admin envía) -> `Recibido` (Chofer confirma).
- **Evidencia**: Requiere foto al enviar y foto al recibir para cerrar el ticket.

### 7. Observaciones (`ObservacionesController`)

Sistema de tickets para reportar fallas mecánicas o novedades.

- Permite abrir hilos de conversación sobre un estado del vehículo.
- Los administradores pueden marcar tickets como "Resueltos".

### 8. Pistas de Auditoría (`PistaController`)

Módulo de seguridad y supervisión ("Quién hizo qué").

- Utiliza `ActivityLog` para registrar acciones críticas.
- Visualización matricial: Muestra qué administradores han realizado qué acciones (aprobar facturas, editar permisos) en un rango de fechas.

### 9. Revisiones Mecánicas (`RevisionDiaria` / `RevisionSemanal`)

Protocolos de mantenimiento preventivo.

- **Diaria**: Inspección rápida de fluidos (Aceite, Agua, Frenos). Obligatoria para iniciar operación.
- **Semanal**: Inspección profunda de carrocería y mecánica pesada.

---

## 🔐 Seguridad y Middleware

El sistema implementa capas de seguridad estrictas en `routes/web.php` y `bootstrap/app.php`:

1.  **`RoleMiddleware`**: Bloquea rutas administrativas a usuarios estándar.
2.  **`AuditAction`**: Middleware personalizado que intercepte solicitudes HTTP para registrar automáticamente la actividad del usuario en el log de auditoría antes de procesar la acción.
3.  **Sanitización**: Validación estricta de Request inputs y manejo de archivos seguros (mime-type checking).

---

## 🔧 Guía de Instalación

1.  **Clonar Repositorio**

    ```bash
    git clone <repo>
    ```

2.  **Configurar Entorno (.env)**
    Es crucial configurar ambas conexiones de base de datos:

    ```ini
    # Base de Datos Principal (App)
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_DATABASE=control_vehiculos

    # Base de Datos Administrativa (Lectura Facturas)
    DB_CONNECTION_SQLSRV=sqlsrv
    DB_HOST_SQLSRV=192.168.x.x
    DB_DATABASE_SQLSRV=PROFIT_A
    ```

3.  **Instalar Dependencias**

    ```bash
    composer install
    npm install
    ```

4.  **Despliegue**
    ```bash
    php artisan migrate
    php artisan key:generate
    npm run build
    ```

---

_Documentación Técnica Confidencial - Uso Interno_
