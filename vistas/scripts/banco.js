var tabla;

function init(){
    mostrarform(false);
    listar();

    $("#formulario").on("submit",function(e){
        guardaryeditar(e);	
    })
}

function limpiar(){
    $("#idbanco").val("");
    $("#nombre").val("");
    $("#descripcion").val("");
}

function mostrarform(flag){
    limpiar();
    if (flag){
        $("#listadoregistros").hide();
        $("#formularioregistros").show();
        $("#btnGuardar").prop("disabled",false);
        $("#btnagregar").hide();
    }
    else{
        $("#listadoregistros").show();
        $("#formularioregistros").hide();
        $("#btnagregar").show();
    }
}

function cancelarform(){
    limpiar();
    mostrarform(false);
}

function listar(){
    tabla=$('#tbllistado').dataTable(
    {
        "aProcessing": true,
        "aServerSide": true,
        dom: 'Bfrtip',
        buttons: ['copyHtml5','excelHtml5','csvHtml5','pdf'],
        "ajax":{
            url: '../ajax/banco.php?op=listar',
            type : "get",
            dataType : "json",						
            error: function(e){
                console.log(e.responseText);	
            }
        },
        "bDestroy": true,
        "iDisplayLength": 5,
        "order": [[ 0, "desc" ]]	
    }).DataTable();
}

function guardaryeditar(e){
    e.preventDefault();
    $("#btnGuardar").prop("disabled",true);
    var formData = new FormData($("#formulario")[0]);

    $.ajax({
        url: "../ajax/banco.php?op=guardaryeditar",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,

        success: function(datos){                    
            bootbox.alert(datos);	            
            mostrarform(false);
            tabla.ajax.reload();
        }
    });
    limpiar();
}

function mostrar(idbanco){
    $.post("../ajax/banco.php?op=mostrar",{idbanco : idbanco}, function(data, status){
        data = JSON.parse(data);		
        mostrarform(true);

        $("#idbanco").val(data.idbanco);
        $("#nombre").val(data.nombre);
        $("#descripcion").val(data.descripcion);
    })
}

function desactivar(idbanco){
    bootbox.confirm("¿Está Seguro de desactivar el banco?", function(result){
        if(result){
            $.post("../ajax/banco.php?op=desactivar", {idbanco : idbanco}, function(e){
                bootbox.alert(e);
                tabla.ajax.reload();
            });	
        }
    })
}

function activar(idbanco){
    bootbox.confirm("¿Está Seguro de activar el banco?", function(result){
        if(result){
            $.post("../ajax/banco.php?op=activar", {idbanco : idbanco}, function(e){
                bootbox.alert(e);
                tabla.ajax.reload();
            });	
        }
    })
}

init();