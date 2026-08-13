<?php 
require "../config/Conexion.php";

Class Banco
{
    public function __construct()
    {
    }
    
    public function insertar($nombre,$descripcion)
    {
        $sql="INSERT INTO banco (nombre,descripcion,condicion)
        VALUES ('$nombre','$descripcion','1')";
        return ejecutarConsulta($sql);
    }
    
    public function editar($idbanco,$nombre,$descripcion)
    {
        $sql="UPDATE banco SET nombre='$nombre',descripcion='$descripcion' WHERE idbanco='$idbanco'";
        return ejecutarConsulta($sql);
    }
    
    public function desactivar($idbanco)
    {
        $sql="UPDATE banco SET condicion='0' WHERE idbanco='$idbanco'";
        return ejecutarConsulta($sql);
    }
    
    public function activar($idbanco)
    {
        $sql="UPDATE banco SET condicion='1' WHERE idbanco='$idbanco'";
        return ejecutarConsulta($sql);
    }
    
    public function mostrar($idbanco)
    {
        $sql="SELECT * FROM banco WHERE idbanco='$idbanco'";
        return ejecutarConsultaSimpleFila($sql);
    }
    
    public function listar()
    {
        $sql="SELECT * FROM banco";
        return ejecutarConsulta($sql);      
    }
}
?>