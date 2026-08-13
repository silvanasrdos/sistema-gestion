<?php 
//Incluímos inicialmente la conexión a la base de datos
require "../config/Conexion.php";

Class Articulo
{
	//Implementamos nuestro constructor
	public function __construct()
	{

	}

	//Implementamos un método para insertar registros
	public function insertar($idcategoria,$nombre,$stock,$descripcion,$imagen,$marca,$tipo_pantalla)
	{
		$tipo_pantalla_value = empty($tipo_pantalla) ? 'NULL' : "'$tipo_pantalla'";
		$sql="INSERT INTO articulo (idcategoria,nombre,stock,descripcion,imagen,marca,tipo_pantalla,condicion)
		VALUES ('$idcategoria','$nombre','$stock','$descripcion','$imagen','$marca',$tipo_pantalla_value,'1')";
		$resultado = ejecutarConsulta($sql);
		if (!$resultado) {
			global $conexion;
			error_log("Error al insertar artículo: " . $conexion->error);
		}
		return $resultado;
	}

	//Implementamos un método para editar registros
	public function editar($idarticulo,$idcategoria,$nombre,$stock,$descripcion,$imagen,$marca,$tipo_pantalla)
	{
		$tipo_pantalla_value = empty($tipo_pantalla) ? 'NULL' : "'$tipo_pantalla'";
		$sql="UPDATE articulo SET idcategoria='$idcategoria',nombre='$nombre',stock='$stock',descripcion='$descripcion',imagen='$imagen',marca='$marca',tipo_pantalla=$tipo_pantalla_value WHERE idarticulo='$idarticulo'";
		return ejecutarConsulta($sql);
	}

	//Implementamos un método para desactivar registros
	public function desactivar($idarticulo)
	{
		$sql="UPDATE articulo SET condicion='0' WHERE idarticulo='$idarticulo'";
		return ejecutarConsulta($sql);
	}

	//Implementamos un método para activar registros
	public function activar($idarticulo)
	{
		$sql="UPDATE articulo SET condicion='1' WHERE idarticulo='$idarticulo'";
		return ejecutarConsulta($sql);
	}

	//Implementar un método para mostrar los datos de un registro a modificar
	public function mostrar($idarticulo)
	{
		$sql="SELECT * FROM articulo WHERE idarticulo='$idarticulo'";
		return ejecutarConsultaSimpleFila($sql);
	}

	//Implementar un método para listar los registros
	public function listar()
	{
		$sql="SELECT a.idarticulo,a.idcategoria,c.nombre as categoria,a.nombre,a.stock,a.descripcion,a.imagen,IFNULL(a.marca, 'Sin marca') as marca,a.tipo_pantalla,IFNULL(tp.nombre, 'Sin pantalla') as tipo_pantalla_nombre,a.condicion FROM articulo a INNER JOIN categoria c ON a.idcategoria=c.idcategoria LEFT JOIN tipo_pantalla tp ON a.tipo_pantalla=tp.id";
		return ejecutarConsulta($sql);		
	}

	//Implementar un método para listar los registros activos
	public function listarActivos()
	{
		$sql="SELECT a.idarticulo,a.idcategoria,c.nombre as categoria,a.codigo,a.nombre,a.stock,a.descripcion,a.imagen,IFNULL(a.marca, 'Sin marca') as marca,a.tipo_pantalla,IFNULL(tp.nombre, 'Sin pantalla') as tipo_pantalla_nombre,a.condicion FROM articulo a INNER JOIN categoria c ON a.idcategoria=c.idcategoria LEFT JOIN tipo_pantalla tp ON a.tipo_pantalla=tp.id WHERE a.condicion='1'";
		return ejecutarConsulta($sql);		
	}

	//Implementar un método para listar los registros activos, su último precio y el stock (vamos a unir con el último registro de la tabla detalle_ingreso)
	public function listarActivosVenta()
	{
		$sql="SELECT a.idarticulo,a.idcategoria,c.nombre as categoria,a.codigo,a.nombre,a.stock,(SELECT precio_venta FROM detalle_ingreso WHERE idarticulo=a.idarticulo order by iddetalle_ingreso desc limit 0,1) as precio_venta,a.descripcion,a.imagen,IFNULL(a.marca, 'Sin marca') as marca,a.tipo_pantalla,IFNULL(tp.nombre, 'Sin pantalla') as tipo_pantalla_nombre,a.condicion FROM articulo a INNER JOIN categoria c ON a.idcategoria=c.idcategoria LEFT JOIN tipo_pantalla tp ON a.tipo_pantalla=tp.id WHERE a.condicion='1'";
		return ejecutarConsulta($sql);		
	}
}

?>