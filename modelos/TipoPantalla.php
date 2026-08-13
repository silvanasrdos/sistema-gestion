<?php 
//Incluímos inicialmente la conexión a la base de datos
require "../config/Conexion.php";

Class TipoPantalla
{
	//Implementamos nuestro constructor
	public function __construct()
	{

	}

	//Implementar un método para listar los registros activos
	public function select()
	{
		$sql="SELECT * FROM tipo_pantalla WHERE condicion=1 ORDER BY nombre ASC";
		return ejecutarConsulta($sql);		
	}
}

?>

