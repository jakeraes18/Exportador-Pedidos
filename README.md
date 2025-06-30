Ejercicio técnico – Evaluación para Front-end Developer
======================

Este proyecto es un script de Node.js diseñado para generar un reporte diario automático de los pedidos realizados en una tienda de Shopify y exportar esta información a una hoja de cálculo de Google Sheets. Es ideal para equipos operativos que necesitan una visión rápida y consolidada de la actividad diaria.

Características
---------------

*   Consume la API de Shopify para obtener pedidos recientes.
    
*   Formatea los datos de los pedidos para una fácil lectura.
    
*   Inserta la información en una hoja de Google Sheets existente.
    
*   Diseñado para ser ejecutado diariamente de forma automática.
    
*   Incluye lógica para evitar la duplicación de pedidos (mediante control de fechas).
    

Campos del Reporte
------------------

El reporte generado incluirá los siguientes campos para cada pedido:

*   **ID de Pedido**
    
*   **Nombre del cliente**
    
*   **Fecha de compra**
    
*   **Productos comprados** (nombre del producto + cantidad)
    
*   **Monto total**
    

Requisitos
----------

Antes de comenzar, asegúrate de tener lo siguiente:

*   **Node.js** (versión 16 o superior) y **npm** instalados en tu sistema.
    
*   Acceso al panel de administración de tu tienda **Shopify**.
    
*   Una cuenta de **Google** y acceso a **Google Cloud Platform (GCP)**.
    
*   Una hoja de cálculo existente en **Google Sheets**.
    

Configuración
-------------

Sigue estos pasos para configurar tu proyecto:

### 1\. Configuración en Shopify

1.  **Inicia sesión** en tu panel de administración de Shopify.
    
2.  Ve a **Configuración** > **Aplicaciones y canales de ventas**.
    
3.  Haz clic en **Desarrollar aplicaciones**.
    
4.  Haz clic en **Crear una aplicación personalizada**.
    
5.  Asígnale un nombre (ej., "Reporte Diario").
    
6.  En la sección "Permisos de la API de Admin", busca y asigna permisos de **lectura** para **Pedidos** (read\_orders) y **Productos** (read\_products).
    
7.  Guarda los cambios.
    
8.  Una vez creada, te proporcionará la **Clave API** y el **Token de Acceso de la API (Admin API access token)**. Anótalos.
    
9.  También necesitarás el **nombre de tu tienda Shopify** (ej., tu-tienda.myshopify.com).
    

### 2\. Configuración en Google Cloud Platform (GCP)

1.  **Inicia sesión** en [Google Cloud Console](https://console.cloud.google.com/).
    
2.  **Crea un nuevo proyecto** o selecciona uno existente.
    
3.  En el menú de navegación, ve a **APIs y servicios** > **Biblioteca**.
    
4.  Busca y **habilita la Google Sheets API**.
    
5.  (Opcional, si usas OAuth de usuario en lugar de cuenta de servicio) Ve a **APIs y servicios** > **Pantalla de consentimiento de OAuth**.
    
    *   Configura el **Tipo de usuario** como "Externo".
        
    *   En la sección **"Usuarios de prueba"** (o similar, en la sección de pasos de configuración), **añade la dirección de correo electrónico de tu cuenta de Google** que utilizarás para acceder a la hoja de cálculo. Esto evita el error "aplicación no verificada".
        

### 3\. Preparar la Hoja de Google Sheets

1.  **Crea una nueva hoja de cálculo** en Google Sheets (ej., "Reporte Diarios Shopify").
    
2.  **Nombra la primera pestaña** (ej., "Reporte").
    
3.  **Añade los encabezados** en la primera fila de la pestaña "Reporte" (A1 a E1):
    
    *   ID de Pedido
        
    *   Nombre del cliente
        
    *   Fecha de compra
        
    *   Productos comprados (nombre + cantidad)
        
    *   Monto total
        
4.  Copia el **ID de la Hoja de Cálculo**. Lo encuentras en la URL de la hoja: https://docs.google.com/spreadsheets/d//edit#gid=0
    

### 4\. Configurar el Proyecto Local

1.  **Clona o descarga** este repositorio.
    
2.  Navega al directorio del proyecto en tu terminal.
    
3.  npm install axios googleapis dotenv
    

#### A. Archivo .env

Crea un archivo llamado .env en la raíz de tu proyecto con tus credenciales. **¡Nunca subas este archivo a un repositorio público!** `

#### B. Autenticación de Google Sheets (Cuenta de Servicio - Recomendado)

##### Paso 1: Crear y Descargar Clave de Cuenta de Servicio

##### Paso 2: Compartir la Hoja con la Cuenta de Servicio
    
##### Paso 3: Actualizar index.js

Uso
---

### Ejecución Manual (para Pruebas)

Puedes ejecutar el script manualmente para probar la configuración o depurar.

1.  **Ajusta el rango de fechas en index.js** temporalmente para que incluya los pedidos de hoy o de un día específico que desees probar (en la sección dateFilter de la función main).
    
2.  **Guarda** el archivo index.js.
    
3.  node index.js
    
4.  Verifica tu Google Sheet para ver los datos insertados.
    
5.  **Recuerda revertir** los cambios temporales en el rango de fechas de index.js si quieres que el script funcione con la lógica diaria predeterminada.
    

Seguridad de Credenciales
-------------------------
    
*   **No Subir a Repositorios Públicos:** Nunca subas tus archivos .env, token.json o tu archivo JSON de clave de cuenta de servicio a Git (añádelos a tu .gitignore).
    
*   **Cuenta de Servicio:** El uso de una cuenta de servicio para Google Sheets es más seguro que el OAuth de usuario para la automatización, ya que no requiere un refresh token que pueda caducar o ser comprometido.
    

Depuración y Solución de Problemas
----------------------------------

*   **Revisa el Log:** Si configuraste el cron job con redirección de salida (>> .../shopify\_report.log), revisa este archivo para ver los mensajes de error o la salida del script.
    
*   **Verifica Credenciales:** Asegúrate de que todas las claves y tokens en tu .env sean correctos y que el ID de la hoja de Google y el nombre de la pestaña sean exactos.
    
*   **Permisos de API:** Confirma que las APIs de Shopify y Google Sheets estén habilitadas y que las credenciales tengan los permisos necesarios.