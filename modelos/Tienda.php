<?php 
//Incluímos inicialmente la conexión a la base de datos
require "../config/Conexion.php";

Class Tienda
{
    //Implementamos nuestro constructor
    public function __construct()
    {

    }

    //Implementar un método para listar los artículos activos con precios para la tienda pública
    public function listarProductos($categoria = '', $buscar = '', $precio_min = '', $precio_max = '', $ordenar = '', $marca = '', $limite = 9, $offset = 0)
    {
        $sql = "SELECT a.idarticulo, a.idcategoria, c.nombre as categoria, a.codigo, a.nombre, a.stock, a.descripcion, a.imagen, a.marca,
                (SELECT precio_venta FROM detalle_ingreso WHERE idarticulo=a.idarticulo ORDER BY iddetalle_ingreso DESC LIMIT 1) as precio_venta
                FROM articulo a 
                INNER JOIN categoria c ON a.idcategoria=c.idcategoria 
                WHERE a.condicion='1' AND a.stock > 0";
        
        // Filtro por categoría
        if (!empty($categoria)) {
            $sql .= " AND a.idcategoria = '$categoria'";
        }
        
        // Filtro por marca
        if (!empty($marca)) {
            $marca = limpiarCadena($marca);
            $sql .= " AND a.marca = '$marca'";
        }
        
        // Filtro por búsqueda
        if (!empty($buscar)) {
            $buscar = limpiarCadena($buscar);
            $sql .= " AND (a.nombre LIKE '%$buscar%' OR a.descripcion LIKE '%$buscar%')";
        }
        
        // Subconsulta para obtener precio y aplicar filtro de precio
        $sql = "SELECT * FROM ($sql) as productos WHERE precio_venta IS NOT NULL";
        
        if (!empty($precio_min) && !empty($precio_max)) {
            $sql .= " AND precio_venta BETWEEN '$precio_min' AND '$precio_max'";
        }
        
        // Ordenamiento
        switch ($ordenar) {
            case 'name_asc':
                $sql .= " ORDER BY nombre ASC";
                break;
            case 'name_desc':
                $sql .= " ORDER BY nombre DESC";
                break;
            case 'price_asc':
                $sql .= " ORDER BY precio_venta ASC";
                break;
            case 'price_desc':
                $sql .= " ORDER BY precio_venta DESC";
                break;
            default:
                $sql .= " ORDER BY nombre ASC";
                break;
        }
        
        // Límite y offset para paginación
        $sql .= " LIMIT $limite OFFSET $offset";
        
        return ejecutarConsulta($sql);
    }

    //Implementar un método para contar el total de productos (para paginación)
    public function contarProductos($categoria = '', $buscar = '', $precio_min = '', $precio_max = '', $marca = '')
    {
        $sql = "SELECT COUNT(*) as total FROM (
                    SELECT a.idarticulo, 
                    (SELECT precio_venta FROM detalle_ingreso WHERE idarticulo=a.idarticulo ORDER BY iddetalle_ingreso DESC LIMIT 1) as precio_venta
                    FROM articulo a 
                    INNER JOIN categoria c ON a.idcategoria=c.idcategoria 
                    WHERE a.condicion='1' AND a.stock > 0";
        
        // Filtro por categoría
        if (!empty($categoria)) {
            $sql .= " AND a.idcategoria = '$categoria'";
        }
        
        // Filtro por marca
        if (!empty($marca)) {
            $marca = limpiarCadena($marca);
            $sql .= " AND a.marca = '$marca'";
        }
        
        // Filtro por búsqueda
        if (!empty($buscar)) {
            $buscar = limpiarCadena($buscar);
            $sql .= " AND (a.nombre LIKE '%$buscar%' OR a.descripcion LIKE '%$buscar%')";
        }
        
        $sql .= ") as productos WHERE precio_venta IS NOT NULL";
        
        if (!empty($precio_min) && !empty($precio_max)) {
            $sql .= " AND precio_venta BETWEEN '$precio_min' AND '$precio_max'";
        }
        
        return ejecutarConsultaSimpleFila($sql);
    }

    //Implementar un método para obtener las categorías activas
    public function listarCategorias()
    {
        $sql = "SELECT idcategoria, nombre FROM categoria WHERE condicion=1 ORDER BY nombre ASC";
        return ejecutarConsulta($sql);
    }

    //Implementar un método para obtener las marcas activas
    public function listarMarcas()
    {
        // TEMPORAL: Muestra todas las marcas (incluso IDs) 
        // TODO: Después de ejecutar fix_marcas_ahora.php, puedes agregar: AND a.marca NOT REGEXP '^[0-9]+$'
        $sql = "SELECT DISTINCT a.marca 
                FROM articulo a 
                WHERE a.condicion='1' 
                AND a.stock > 0 
                AND a.marca IS NOT NULL 
                AND a.marca != '' 
                ORDER BY a.marca ASC";
        return ejecutarConsulta($sql);
    }

    //Implementar un método para mostrar un producto específico
    public function mostrarProducto($idarticulo)
    {
        $sql = "SELECT a.idarticulo, a.idcategoria, c.nombre as categoria, a.codigo, a.nombre, a.stock, a.descripcion, a.imagen,
                (SELECT precio_venta FROM detalle_ingreso WHERE idarticulo=a.idarticulo ORDER BY iddetalle_ingreso DESC LIMIT 1) as precio_venta
                FROM articulo a 
                INNER JOIN categoria c ON a.idcategoria=c.idcategoria 
                WHERE a.idarticulo='$idarticulo' AND a.condicion='1'";
        return ejecutarConsultaSimpleFila($sql);
    }

    //Implementar un método para productos relacionados (misma categoría)
    public function productosRelacionados($idcategoria, $idarticulo, $limite = 4)
    {
        $sql = "SELECT a.idarticulo, a.nombre, a.imagen,
                (SELECT precio_venta FROM detalle_ingreso WHERE idarticulo=a.idarticulo ORDER BY iddetalle_ingreso DESC LIMIT 1) as precio_venta
                FROM articulo a 
                WHERE a.idcategoria='$idcategoria' AND a.idarticulo != '$idarticulo' AND a.condicion='1' AND a.stock > 0
                ORDER BY RAND() 
                LIMIT $limite";
        return ejecutarConsulta($sql);
    }
}

?>