# Sistema de Gestión 
Breve descripción
- Aplicación web para gestión de tienda: inventario, ventas, ingresos, clientes y usuarios.

Tecnologías
- PHP (puro)
- MySQL / MariaDB
- HTML/CSS, Bootstrap
- jQuery, DataTables
- FPDF (generación de PDFs)
- JS y plugins en `public/` y `public2/`

Estructura importante
- `config/` — archivos de configuración 
- `db/dbsistema.sql` — base de datos
- `files/` — archivos subidos por usuarios 

Instalación (local)
1. Clona el repositorio:

```bash
git clone <repo-url> sistema
cd sistema
```

2. Configuración
- Copia el ejemplo de configuración (o crea variables de entorno):

```bash
cp config/global.example.php config/global.php
# o configurar variables de entorno DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_ENCODE
```

- Asegúrate de que `config/global.php` no contiene credenciales reales antes de subir.

3. Importa la base de datos (si tienes el dump y es seguro):

```bash
mysql -u <user> -p < db/dbsistema.sql
```

4. Ajusta permisos para la carpeta de uploads:

```powershell
# Windows (ejemplo)
icacls files /grant "%USERNAME%":(OI)(CI)F /T
```

5. Levanta el servidor (Laragon, XAMPP, etc.) y abre la URL local.

