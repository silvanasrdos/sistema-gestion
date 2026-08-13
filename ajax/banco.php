<?php 
require_once "../modelos/Banco.php";

$banco = new Banco();

$idbanco = isset($_POST["idbanco"]) ? limpiarCadena($_POST["idbanco"]) : "";
$nombre = isset($_POST["nombre"]) ? limpiarCadena($_POST["nombre"]) : "";
$descripcion = isset($_POST["descripcion"]) ? limpiarCadena($_POST["descripcion"]) : "";

switch ($_GET["op"]){
    case 'guardaryeditar':
        if (empty($idbanco)){
            $rspta = $banco->insertar($nombre, $descripcion);
            echo $rspta ? "Banco registrado" : "Banco no se pudo registrar";
        }
        else {
            $rspta = $banco->editar($idbanco, $nombre, $descripcion);
            echo $rspta ? "Banco actualizado" : "Banco no se pudo actualizar";
        }
    break;

    case 'desactivar':
        $rspta = $banco->desactivar($idbanco);
        echo $rspta ? "Banco Desactivado" : "Banco no se puede desactivar";
    break;

    case 'activar':
        $rspta = $banco->activar($idbanco);
        echo $rspta ? "Banco Activado" : "Banco no se puede activar";
    break;

    case 'mostrar':
        $rspta = $banco->mostrar($idbanco);
        echo json_encode($rspta);
    break;

    case 'listar':
        $rspta = $banco->listar();
        $data = Array();

        while ($reg = $rspta->fetch_object()){
            $data[] = array(
                "0" => ($reg->condicion) ? 
                    '<button class="btn btn-warning" onclick="mostrar('.$reg->idbanco.')"><i class="fa fa-pencil"></i></button>'.
                    ' <button class="btn btn-danger" onclick="desactivar('.$reg->idbanco.')"><i class="fa fa-close"></i></button>' :
                    '<button class="btn btn-warning" onclick="mostrar('.$reg->idbanco.')"><i class="fa fa-pencil"></i></button>'.
                    ' <button class="btn btn-success" onclick="activar('.$reg->idbanco.')"><i class="fa fa-check"></i></button>',
                "1" => $reg->nombre,
                "2" => $reg->descripcion,
                "3" => ($reg->condicion) ? '<span class="label bg-green">Activado</span>' : '<span class="label bg-red">Desactivado</span>'
            );
        }
        $results = array(
            "sEcho" => 1,
            "iTotalRecords" => count($data),
            "iTotalDisplayRecords" => count($data),
            "aaData" => $data);
        echo json_encode($results);
    break;
}
?>