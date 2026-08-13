<?php 
require_once "../config/Conexion.php";
require_once "../modelos/Tienda.php";

$tienda = new Tienda();

$categoria = isset($_GET["categoria"]) ? limpiarCadena($_GET["categoria"]) : "";
$buscar = isset($_GET["buscar"]) ? limpiarCadena($_GET["buscar"]) : "";
$precio_rango = isset($_GET["precio"]) ? limpiarCadena($_GET["precio"]) : "";
$ordenar = isset($_GET["ordenar"]) ? limpiarCadena($_GET["ordenar"]) : "";
$marca = isset($_GET["marca"]) ? limpiarCadena($_GET["marca"]) : "";
$pagina = isset($_GET["pagina"]) ? (int)$_GET["pagina"] : 1;
$idarticulo = isset($_GET["idarticulo"]) ? limpiarCadena($_GET["idarticulo"]) : "";

// Configuración de paginación
$productos_por_pagina = 6;
$offset = ($pagina - 1) * $productos_por_pagina;

// Procesar rango de precios
$precio_min = "";
$precio_max = "";
if (!empty($precio_rango)) {
    if ($precio_rango == "1000+") {
        $precio_min = "1000";
        $precio_max = "99999";
    } else {
        $precios = explode("-", $precio_rango);
        $precio_min = $precios[0];
        $precio_max = $precios[1];
    }
}

switch ($_GET["op"]) {
    case 'listarProductos':
        $rspta = $tienda->listarProductos($categoria, $buscar, $precio_min, $precio_max, $ordenar, $marca, $productos_por_pagina, $offset);
        $data = Array();

        while ($reg = $rspta->fetch_object()) {
            // Formatear precio
            $precio_formateado = number_format($reg->precio_venta, 2);
            
            // Imagen por defecto si no existe
            $imagen = !empty($reg->imagen) ? $reg->imagen : "default.jpg";
            
            $data[] = array(
                "idarticulo" => $reg->idarticulo,
                "nombre" => $reg->nombre,
                "categoria" => $reg->categoria,
                "marca" => $reg->marca,
                "descripcion" => $reg->descripcion,
                "precio_venta" => $reg->precio_venta,
                "precio_formateado" => "$" . $precio_formateado,
                "stock" => $reg->stock,
                "imagen" => $imagen
            );
        }

        // Obtener total de productos para paginación
        $total_productos = $tienda->contarProductos($categoria, $buscar, $precio_min, $precio_max, $marca);

        //Problema ya que el ceiling deberia devolver 2 y devuelve 1 ya que el total es 1,11
        $total_paginas = ceil($total_productos['total'] / $productos_por_pagina);
        // $prueba = $total_productos['total'] / $productos_por_pagina;
        // echo("<script>console.log(". prueba .")</script>");

        $results = array(
            "productos" => $data,
            "total_productos" => $total_productos['total'],
            "total_paginas" => $total_paginas,
            "pagina_actual" => $pagina
        );

        echo json_encode($results);
        break;

    case 'listarCategorias':
        $rspta = $tienda->listarCategorias();
        $data = Array();

        while ($reg = $rspta->fetch_object()) {
            $data[] = array(
                "idcategoria" => $reg->idcategoria,
                "nombre" => $reg->nombre
            );
        }

        echo json_encode($data);
        break;

    case 'listarMarcas':
        $rspta = $tienda->listarMarcas();
        $data = Array();

        while ($reg = $rspta->fetch_object()) {
            $data[] = array(
                "marca" => $reg->marca
            );
        }

        echo json_encode($data);
        break;

    case 'mostrarProducto':
        $rspta = $tienda->mostrarProducto($idarticulo);
        
        if ($rspta) {
            $precio_formateado = number_format($rspta['precio_venta'], 2);
            $imagen = !empty($rspta['imagen']) ? $rspta['imagen'] : "default.jpg";
            
            $producto = array(
                "idarticulo" => $rspta['idarticulo'],
                "nombre" => $rspta['nombre'],
                "categoria" => $rspta['categoria'],
                "descripcion" => $rspta['descripcion'],
                "precio_venta" => $rspta['precio_venta'],
                "precio_formateado" => "$" . $precio_formateado,
                "stock" => $rspta['stock'],
                "imagen" => $imagen,
                "codigo" => $rspta['codigo']
            );
            
            echo json_encode($producto);
        } else {
            echo json_encode(array("error" => "Producto no encontrado"));
        }
        break;

    case 'productosRelacionados':
        $producto = $tienda->mostrarProducto($idarticulo);
        if ($producto) {
            $rspta = $tienda->productosRelacionados($producto['idcategoria'], $idarticulo, 4);
            $data = Array();

            while ($reg = $rspta->fetch_object()) {
                $precio_formateado = number_format($reg->precio_venta, 2);
                $imagen = !empty($reg->imagen) ? $reg->imagen : "default.jpg";
                
                $data[] = array(
                    "idarticulo" => $reg->idarticulo,
                    "nombre" => $reg->nombre,
                    "precio_venta" => $reg->precio_venta,
                    "precio_formateado" => "$" . $precio_formateado,
                    "imagen" => $imagen
                );
            }

            echo json_encode($data);
        } else {
            echo json_encode(array());
        }
        break;

    case 'registrarVenta':
        // Recibir datos JSON del POST
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        // Log para debugging
        error_log('Datos recibidos: ' . print_r($data, true));
        
        if ($data && isset($data['nombre']) && isset($data['email']) && isset($data['productos'])) {
            try {
                require_once "../modelos/Venta.php";
                $venta = new Venta();
                
                // Limpiar datos del cliente
                $nombre_cliente = limpiarCadena($data['nombre']);
                $email = limpiarCadena($data['email']);
                $telefono = limpiarCadena($data['telefono']);
                
                // Construir dirección completa
                $direccion_completa = limpiarCadena(
                    $data['direccion']['calle'] . ' ' . 
                    $data['direccion']['numero'] . ', ' . 
                    $data['direccion']['ciudad'] . ', ' . 
                    $data['direccion']['provincia'] . ' - CP: ' . 
                    $data['direccion']['codigoPostal']
                );
                
                // Limpiar método de pago
                $metodo_pago = limpiarCadena($data['metodoPago']);
                $metodo_entrega = isset($data['metodoEntrega']) ? limpiarCadena($data['metodoEntrega']) : 'retiro';
                
                // Preparar productos
                $productos = $data['productos'];
                
                // Calcular total (con descuento si es efectivo)
                $total = floatval($data['total']);
                if ($metodo_pago == 'efectivo') {
                    $total = $total * 0.85; // 15% descuento
                }
                
                // Registrar la venta
                $resultado = $venta->insertarVentaTienda(
                    $nombre_cliente,
                    $email,
                    $telefono,
                    $direccion_completa,
                    $metodo_pago,
                    $metodo_entrega,
                    $total,
                    $productos
                );
                
                error_log('Resultado: ' . print_r($resultado, true));
                echo json_encode($resultado);
                
            } catch (Exception $e) {
                error_log('Error al registrar venta: ' . $e->getMessage());
                echo json_encode(array('success' => false, 'mensaje' => 'Error: ' . $e->getMessage()));
            }
        } else {
            echo json_encode(array('success' => false, 'mensaje' => 'Datos incompletos o inválidos'));
        }
        break;

    default:
        echo json_encode(array("error" => "Operación no válida"));
        break;
}
?>