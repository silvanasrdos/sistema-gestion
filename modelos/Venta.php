<?php 
//Incluímos inicialmente la conexión a la base de datos
require "../config/Conexion.php";

Class Venta
{
	//Implementamos nuestro constructor
	public function __construct()
	{

	}

	//Implementamos un método para insertar registros
	public function insertar($idcliente,$idusuario,$tipo_comprobante,$serie_comprobante,$num_comprobante,$fecha_hora,$impuesto,$total_venta,$idarticulo,$cantidad,$precio_venta,$descuento)
	{
		$sql="INSERT INTO venta (idcliente,idusuario,tipo_comprobante,serie_comprobante,num_comprobante,fecha_hora,impuesto,total_venta,estado)
		VALUES ('$idcliente','$idusuario','$tipo_comprobante','$serie_comprobante','$num_comprobante','$fecha_hora','$impuesto','$total_venta','Aceptado')";
		//return ejecutarConsulta($sql);
		$idventanew=ejecutarConsulta_retornarID($sql);

		$num_elementos=0;
		$sw=true;

		while ($num_elementos < count($idarticulo))
		{
			$sql_detalle = "INSERT INTO detalle_venta(idventa, idarticulo,cantidad,precio_venta,descuento) VALUES ('$idventanew', '$idarticulo[$num_elementos]','$cantidad[$num_elementos]','$precio_venta[$num_elementos]','$descuento[$num_elementos]')";
			ejecutarConsulta($sql_detalle) or $sw = false;
			$num_elementos=$num_elementos + 1;
		}

		return $sw;
	}

	
	//Implementamos un método para anular la venta
	public function anular($idventa)
	{
		$sql="UPDATE venta SET estado='Anulado' WHERE idventa='$idventa'";
		return ejecutarConsulta($sql);
	}


	//Implementar un método para mostrar los datos de un registro a modificar
	public function mostrar($idventa)
	{
		$sql="SELECT v.idventa,DATE(v.fecha_hora) as fecha,v.idcliente,p.nombre as cliente,u.idusuario,
		CASE WHEN v.serie_comprobante = 'WEB' THEN 'Autogestionado' ELSE u.nombre END as usuario,
		v.tipo_comprobante,v.serie_comprobante,v.num_comprobante,v.total_venta,v.impuesto,v.estado 
		FROM venta v INNER JOIN persona p ON v.idcliente=p.idpersona INNER JOIN usuario u ON v.idusuario=u.idusuario 
		WHERE v.idventa='$idventa'";
		return ejecutarConsultaSimpleFila($sql);
	}

	public function listarDetalle($idventa)
	{
		$sql="SELECT dv.idventa,dv.idarticulo,a.nombre,dv.cantidad,dv.precio_venta,dv.descuento,(dv.cantidad*dv.precio_venta-dv.descuento) as subtotal FROM detalle_venta dv inner join articulo a on dv.idarticulo=a.idarticulo where dv.idventa='$idventa'";
		return ejecutarConsulta($sql);
	}

	//Implementar un método para listar los registros
	public function listar()
	{
		$sql="SELECT v.idventa,DATE(v.fecha_hora) as fecha,v.idcliente,p.nombre as cliente,u.idusuario,
		CASE WHEN v.serie_comprobante = 'WEB' THEN 'Autogestionado' ELSE u.nombre END as usuario,
		v.tipo_comprobante,v.serie_comprobante,v.num_comprobante,v.total_venta,v.impuesto,v.estado 
		FROM venta v INNER JOIN persona p ON v.idcliente=p.idpersona INNER JOIN usuario u ON v.idusuario=u.idusuario 
		ORDER by v.idventa desc";
		return ejecutarConsulta($sql);		
	}

	public function ventacabecera($idventa){
		$sql="SELECT v.idventa,v.idcliente,p.nombre as cliente,p.direccion,p.tipo_documento,p.num_documento,p.email,p.telefono,v.idusuario,
		CASE WHEN v.serie_comprobante = 'WEB' THEN 'Autogestionado' ELSE u.nombre END as usuario,
		v.tipo_comprobante,v.serie_comprobante,v.num_comprobante,date(v.fecha_hora) as fecha,v.impuesto,v.total_venta 
		FROM venta v INNER JOIN persona p ON v.idcliente=p.idpersona INNER JOIN usuario u ON v.idusuario=u.idusuario 
		WHERE v.idventa='$idventa'";
		return ejecutarConsulta($sql);
	}

	public function ventadetalle($idventa){
		$sql="SELECT a.nombre as articulo,a.codigo,d.cantidad,d.precio_venta,d.descuento,(d.cantidad*d.precio_venta-d.descuento) as subtotal FROM detalle_venta d INNER JOIN articulo a ON d.idarticulo=a.idarticulo WHERE d.idventa='$idventa'";
		return ejecutarConsulta($sql);
	}

	// Método para insertar venta desde la tienda online
	public function insertarVentaTienda($nombre_cliente, $email, $telefono, $direccion_completa, $metodo_pago, $metodo_entrega, $total_venta, $productos)
	{
		global $conexion;
		
		try {
			// Primero, buscar o crear el cliente
			$email = mysqli_real_escape_string($conexion, $email);
			$sql_buscar = "SELECT idpersona FROM persona WHERE email='$email' AND tipo_persona='Cliente'";
			$resultado = ejecutarConsultaSimpleFila($sql_buscar);
			
			if ($resultado) {
				$idcliente = $resultado['idpersona'];
				error_log('Cliente existente encontrado: ' . $idcliente);
			} else {
				// Crear nuevo cliente
				$nombre_cliente = mysqli_real_escape_string($conexion, $nombre_cliente);
				$telefono = mysqli_real_escape_string($conexion, $telefono);
				$direccion_completa = mysqli_real_escape_string($conexion, $direccion_completa);
				
				$sql_cliente = "INSERT INTO persona (tipo_persona, nombre, email, telefono, direccion) 
								VALUES ('Cliente', '$nombre_cliente', '$email', '$telefono', '$direccion_completa')";
				
				error_log('SQL Cliente: ' . $sql_cliente);
				$idcliente = ejecutarConsulta_retornarID($sql_cliente);
				
				if ($idcliente) {
					error_log('Nuevo cliente creado: ' . $idcliente);
				} else {
					error_log('Error al crear cliente: ' . $conexion->error);
					return array('success' => false, 'mensaje' => 'Error al crear cliente: ' . $conexion->error);
				}
			}
			
			// Usuario del sistema será 1 (administrador)
			$idusuario = 1;
			
			// Generar número de comprobante único (máximo 10 caracteres para VARCHAR(10))
			// Formato: W + timestamp de 8 dígitos
			// Ejemplo: W62183119 (9 caracteres)
			$timestamp = substr(time(), -8); // Últimos 8 dígitos del timestamp
			$num_comprobante = 'W' . $timestamp;
			
			// Determinar tipo de comprobante según método de pago
			if ($metodo_pago == 'efectivo') {
				$tipo_comprobante = 'Ticket';
			} else if ($metodo_pago == 'transferencia') {
				$tipo_comprobante = 'Ticket';
			} else {
				$tipo_comprobante = 'Boleta';
			}
			
			$fecha_hora = date('Y-m-d H:i:s');
			$impuesto = 0;
			
			// Insertar la venta
			$sql_venta = "INSERT INTO venta (idcliente, idusuario, tipo_comprobante, serie_comprobante, num_comprobante, fecha_hora, impuesto, total_venta, estado) 
						  VALUES ('$idcliente', '$idusuario', '$tipo_comprobante', 'WEB', '$num_comprobante', '$fecha_hora', '$impuesto', '$total_venta', 'Aceptado')";
			
			error_log('SQL Venta: ' . $sql_venta);
			$resultado_venta = ejecutarConsulta($sql_venta);
			
			if (!$resultado_venta) {
				error_log('Error al insertar venta: ' . $conexion->error);
				return array('success' => false, 'mensaje' => 'Error al insertar venta: ' . $conexion->error);
			}
			
			$idventa = $conexion->insert_id;
			error_log('Venta creada con ID: ' . $idventa);
			
			if ($idventa) {
				// Insertar los detalles de la venta
				$sw = true;
				foreach ($productos as $producto) {
					$idarticulo = intval($producto['idarticulo']);
					$cantidad = intval($producto['cantidad']);
					$precio_venta = floatval($producto['precio']);
					$descuento = 0;
					
					$sql_detalle = "INSERT INTO detalle_venta (idventa, idarticulo, cantidad, precio_venta, descuento) 
									VALUES ('$idventa', '$idarticulo', '$cantidad', '$precio_venta', '$descuento')";
					
					error_log('SQL Detalle: ' . $sql_detalle);
					$resultado_detalle = ejecutarConsulta($sql_detalle);
					
					if (!$resultado_detalle) {
						error_log('Error al insertar detalle: ' . $conexion->error);
						$sw = false;
					}
					
					// El stock se descuenta automáticamente mediante el trigger tr_updStockVenta
				}
				
				if ($sw) {
					return array(
						'success' => true,
						'idventa' => $idventa,
						'num_comprobante' => $num_comprobante,
						'mensaje' => 'Venta registrada correctamente'
					);
				} else {
					return array('success' => false, 'mensaje' => 'Error al insertar detalles de la venta');
				}
			}
			
			return array('success' => false, 'mensaje' => 'Error al obtener ID de venta');
			
		} catch (Exception $e) {
			error_log('Excepción en insertarVentaTienda: ' . $e->getMessage());
			return array('success' => false, 'mensaje' => 'Excepción: ' . $e->getMessage());
		}
	}
	
}
?>