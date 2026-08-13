<?php
require "../config/Conexion.php";

class Marca {
    public function __construct() {
    }

    public function select() {
        $sql = "SELECT * FROM marca WHERE estado=1 ORDER BY nombre ASC";
        return ejecutarConsulta($sql);
    }
}