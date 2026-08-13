<?php
//Activamos el almacenamiento en el buffer
ob_start();
session_start();

if (!isset($_SESSION["nombre"]))
{
  header("Location: login.html");
}
else
{
require 'header.php';
?>
<!--Contenido-->
      <!-- Content Wrapper. Contains page content -->
      <div class="content-wrapper">        
        <!-- Main content -->
        <section class="content">
            <div class="row">
              <div class="col-md-12">
                  <div class="box">
                    <div class="box-header with-border">
                          <h1 class="box-title">Acerca de</h1>
	                        <div class="box-tools pull-right">
	                        </div>
                    </div>
                    <!-- /.box-header -->
                    <!-- centro -->
                    <div class="panel-body">
                    	<h4>Proyecto: </h4> <p>Sistema de Gestión Integral - Ventas, Compras e Inventario</p>
		                <h4>Versión: </h4> <p>1.0</p>
		                <h4>Descripción: </h4> 
		                <p>Sistema completo para la gestión empresarial que incluye:</p>
		                <ul>
		                	<li>Control de ventas y facturación</li>
		                	<li>Gestión de compras e ingresos</li>
		                	<li>Control de inventario y stock</li>
		                	<li>Administración de clientes y proveedores</li>
		                	<li>Gestión de usuarios y permisos</li>
		                	<li>Reportes y estadísticas</li>
		                </ul>
		                <h4>Tecnologías: </h4> <p>PHP, MySQL, JavaScript, Bootstrap, AdminLTE</p>
		                <h4>Fecha: </h4> <p>2025</p>
                    </div>
                    <!--Fin centro -->
                  </div><!-- /.box -->
              </div><!-- /.col -->
          </div><!-- /.row -->
      </section><!-- /.content -->

    </div><!-- /.content-wrapper -->
  <!--Fin-Contenido-->
<?php
require 'footer.php';
?>
<?php 
}
ob_end_flush();
?>


