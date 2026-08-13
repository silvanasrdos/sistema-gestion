// Función para decodificar entidades HTML
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

var IMG_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%231a1a2e'/%3E%3Ctext x='100' y='105' font-family='Arial' font-size='13' text-anchor='middle' fill='%23555'%3ESin imagen%3C/text%3E%3C/svg%3E";

function imgFallback(img) { img.onerror = null; img.src = IMG_PLACEHOLDER; }

// Variables globales
var productos = [];
var paginaActual = 1;
var totalPaginas = 1;
var carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Función para limpiar entidades HTML en el carrito existente y actualizar stock
function limpiarCarritoExistente() {
    if (carrito.length > 0) {
        carrito = carrito.map(function(item) {
            return {
                ...item,
                nombre: decodeHtml(item.nombre)
            };
        });
        
        // Actualizar el stock de los items que no lo tengan
        carrito.forEach(function(item) {
            if (!item.stock) {
                // Consultar el stock mediante AJAX
                $.ajax({
                    url: '../ajax/tienda.php?op=mostrarProducto',
                    type: 'GET',
                    data: { idarticulo: item.idarticulo },
                    dataType: 'json',
                    async: false,
                    success: function(producto) {
                        if (!producto.error) {
                            item.stock = producto.stock;
                        }
                    }
                });
            }
        });
        
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }
}

// Función que se ejecuta al inicio
function init() {
    limpiarCarritoExistente();
    cargarCategorias();
    cargarMarcas();
    cargarProductos();
    actualizarContadorCarrito();
}

// Función para cargar categorías dinámicamente
function cargarCategorias() {
    console.log('🔍 Iniciando carga de categorías...');
    $.ajax({
        url: '../ajax/tienda.php?op=listarCategorias',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log('✓ Categorías recibidas:', data);
            console.log('Total de categorías:', data.length);
            
            var select = $('#categoryFilter');
            select.html('<option value="">Todas las categorías</option>');
            
            $.each(data, function(index, categoria) {
                select.append('<option value="' + categoria.idcategoria + '">' + categoria.nombre + '</option>');
            });
            console.log('✓ Categorías cargadas correctamente');
        },
        error: function(xhr, status, error) {
            console.error('✗ Error al cargar categorías:', error);
            console.error('Response:', xhr.responseText);
            mostrarError('Error al cargar las categorías');
        }
    });
}

// Función para cargar marcas dinámicamente
function cargarMarcas() {
    console.log('🔍 Iniciando carga de marcas...');
    $.ajax({
        url: '../ajax/tienda.php?op=listarMarcas',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log('✓ Marcas recibidas:', data);
            console.log('Total de marcas:', data.length);
            
            var select = $('#marcaFilter');
            select.html('<option value="">Todas las marcas</option>');
            
            if (data.length === 0) {
                console.warn('⚠️ No se encontraron marcas en la base de datos');
                select.append('<option value="" disabled>No hay marcas disponibles</option>');
            } else {
                $.each(data, function(index, item) {
                    console.log('Agregando marca:', item.marca);
                    select.append('<option value="' + item.marca + '">' + item.marca + '</option>');
                });
                console.log('✓ Marcas cargadas correctamente en el select');
            }
        },
        error: function(xhr, status, error) {
            console.error('✗ Error al cargar marcas:', error);
            console.error('Status:', status);
            console.error('Response:', xhr.responseText);
            mostrarError('Error al cargar las marcas');
        }
    });
}

// Función principal para cargar productos
function cargarProductos(pagina = 1) {
    mostrarCargando(true);
    ocultarMensajes();
    
    var categoria = $('#categoryFilter').val();
    var buscar = $('#searchInput').val();
    var precio = $('#priceFilter').val();
    var ordenar = $('#sortFilter').val();
    var marca = $('#marcaFilter').val();
    
    $.ajax({
        url: '../ajax/tienda.php?op=listarProductos',
        type: 'GET',
        data: {
            categoria: categoria,
            buscar: buscar,
            precio: precio,
            ordenar: ordenar,
            marca: marca,
            pagina: pagina
        },
        dataType: 'json',
        success: function(response) {
            productos = response.productos;
            paginaActual = response.pagina_actual;
            totalPaginas = response.total_paginas;
            
            mostrarProductos();
            crearPaginacion();
            mostrarCargando(false);
            
            if (productos.length === 0) {
                mostrarError('No se encontraron productos con los filtros seleccionados');
            }
        },
        error: function(xhr, status, error) {
            console.log('Error al cargar productos:', error);
            mostrarError('Error al cargar los productos. Intente nuevamente.');
            mostrarCargando(false);
        }
    });
}

// Función para mostrar productos en el DOM
function mostrarProductos() {
    var container = $('#productsContainer');
    container.empty();
    
    if (productos.length === 0) {
        container.html('<div class="no-products">No se encontraron productos</div>');
        return;
    }
    
    $.each(productos, function(index, producto) {
        var imagePath = producto.imagen !== 'default.jpg' 
            ? '../files/articulos/' + producto.imagen 
            : IMG_PLACEHOLDER;
        
        // Decodificar entidades HTML en nombre y descripción
        var nombreDecodificado = decodeHtml(producto.nombre);
        var descripcionDecodificada = decodeHtml(producto.descripcion);
        
        var productCard = `
            <div class="product-card" onclick="verProducto(${producto.idarticulo})">
                <div class="product-image">
                    <img src="${imagePath}" alt="${nombreDecodificado}" onerror="imgFallback(this)">
                </div>
                <div class="product-info">
                    <div class="product-name">${nombreDecodificado}</div>
                    <div class="product-description">${descripcionDecodificada}</div>
                    <div class="product-price">${producto.precio_formateado}</div>
                    <div class="product-stock">Stock: ${producto.stock} unidades</div>
                    <button class="add-to-cart" onclick="agregarAlCarrito(event, ${producto.idarticulo}, '${nombreDecodificado.replace(/'/g, "\\'")}', ${producto.precio_venta}, '${producto.imagen}')">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        `;
        
        container.append(productCard);
    });
}

// Función para crear paginación
function crearPaginacion() {

    var paginationContainer = $('#pagination');
    paginationContainer.empty();
    
    if (totalPaginas < 1) {
        return;
    }
    
    // Botón anterior
    if (paginaActual > 1) {
        paginationContainer.append(`<button class="page-btn" onclick="cargarProductos(${paginaActual - 1})">‹ Anterior</button>`);
    }
    
    // Números de página
    var inicio = Math.max(1, paginaActual - 2);
    var fin = Math.min(totalPaginas, paginaActual + 2);
    
    
    for (var i = inicio; i <= fin; i++) {
        var activeClass = i === paginaActual ? 'active' : '';
        paginationContainer.append(`<button class="page-btn ${activeClass}" onclick="cargarProductos(${i})">${i}</button>`);
    }
    
    // Botón siguiente
    if (paginaActual < totalPaginas) {
        paginationContainer.append(`<button class="page-btn" onclick="cargarProductos(${paginaActual + 1})">Siguiente ›</button>`);
    }
}

// Función de búsqueda
function buscarProductos() {
    cargarProductos(1);
}

// Función para limpiar filtros
function limpiarFiltros() {
    $('#categoryFilter').val('');
    $('#marcaFilter').val('');
    $('#priceFilter').val('');
    $('#sortFilter').val('');
    $('#searchInput').val('');
    cargarProductos(1);
}

// Función para ver detalles del producto
function verProducto(idarticulo) {
    $.ajax({
        url: '../ajax/tienda.php?op=mostrarProducto',
        type: 'GET',
        data: { idarticulo: idarticulo },
        dataType: 'json',
        success: function(producto) {
            if (producto.error) {
                mostrarError('Producto no encontrado');
                return;
            }
            
            mostrarDetalleProducto(producto);
        },
        error: function() {
            mostrarError('Error al cargar el producto');
        }
    });
}

// Función para mostrar modal con detalles del producto
function mostrarDetalleProducto(producto) {
    var imagePath = producto.imagen !== 'default.jpg' 
        ? '../files/articulos/' + producto.imagen 
        : IMG_PLACEHOLDER;
    
    // Decodificar entidades HTML
    var nombreDecodificado = decodeHtml(producto.nombre);
    var descripcionDecodificada = decodeHtml(producto.descripcion);
    var categoriaDecodificada = decodeHtml(producto.categoria);
    
    var modal = `
        <div id="productModal" class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <span class="close" onclick="cerrarModal()">&times;</span>
                <div class="modal-body">
                    <div class="product-detail-image">
                        <img src="${imagePath}" alt="${nombreDecodificado}" onerror="imgFallback(this)">
                    </div>
                    <div class="product-detail-info">
                        <h2>${nombreDecodificado}</h2>
                        <p class="category">Categoría: ${categoriaDecodificada}</p>
                        <p class="description">${descripcionDecodificada}</p>
                        <p class="price">${producto.precio_formateado}</p>
                        <p class="stock">Stock disponible: ${producto.stock} unidades</p>
                        <button class="add-to-cart-large" onclick="agregarAlCarrito(event, ${producto.idarticulo}, '${nombreDecodificado.replace(/'/g, "\\'")}', ${producto.precio_venta}, '${producto.imagen}')">
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(modal);
}

// Función para cerrar modal
function cerrarModal() {
    $('#productModal').remove();
}

// Función para formatear precio
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(precio);
}

// Función para agregar productos al carrito
function agregarAlCarrito(event, idarticulo, nombre, precio, imagen = 'default.jpg') {
    event.stopPropagation();
    
    // Buscar el producto para obtener el stock disponible
    var producto = productos.find(p => p.idarticulo === idarticulo);
    
    // Si el producto no está en la lista actual, obtener el stock mediante AJAX
    if (!producto) {
        obtenerStockYAgregar(idarticulo, nombre, precio, imagen);
        return;
    }
    
    var stockDisponible = producto.stock;
    var itemExistente = carrito.find(item => item.idarticulo === idarticulo);
    
    if (itemExistente) {
        // Verificar si se puede agregar más
        if (itemExistente.cantidad >= stockDisponible) {
            mostrarError(`No hay más stock disponible. Solo hay ${stockDisponible} unidades.`);
            return;
        }
        itemExistente.cantidad++;
        itemExistente.stock = stockDisponible; // Actualizar stock en el item
    } else {
        // Verificar que haya stock
        if (stockDisponible <= 0) {
            mostrarError('Producto sin stock disponible');
            return;
        }
        
        carrito.push({
            idarticulo: idarticulo,
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            cantidad: 1,
            stock: stockDisponible
        });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarExito(`${decodeHtml(nombre)} agregado al carrito`);
}

// Función auxiliar para obtener stock mediante AJAX cuando el producto no está en la lista actual
function obtenerStockYAgregar(idarticulo, nombre, precio, imagen) {
    $.ajax({
        url: '../ajax/tienda.php?op=mostrarProducto',
        type: 'GET',
        data: { idarticulo: idarticulo },
        dataType: 'json',
        success: function(producto) {
            if (producto.error) {
                mostrarError('Error al obtener información del producto');
                return;
            }
            
            var stockDisponible = producto.stock;
            var itemExistente = carrito.find(item => item.idarticulo === idarticulo);
            
            if (itemExistente) {
                if (itemExistente.cantidad >= stockDisponible) {
                    mostrarError(`No hay más stock disponible. Solo hay ${stockDisponible} unidades.`);
                    return;
                }
                itemExistente.cantidad++;
                itemExistente.stock = stockDisponible;
            } else {
                if (stockDisponible <= 0) {
                    mostrarError('Producto sin stock disponible');
                    return;
                }
                
                carrito.push({
                    idarticulo: idarticulo,
                    nombre: nombre,
                    precio: precio,
                    imagen: imagen,
                    cantidad: 1,
                    stock: stockDisponible
                });
            }
            
            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarContadorCarrito();
            mostrarExito(`${decodeHtml(nombre)} agregado al carrito`);
        },
        error: function() {
            mostrarError('Error al verificar el stock del producto');
        }
    });
}

// Función para actualizar contador del carrito
function actualizarContadorCarrito() {
    var totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    $('#cartCount').text(totalItems);
}

// Función para ver carrito
function verCarrito() {
    if (carrito.length === 0) {
        mostrarError('El carrito está vacío');
        return;
    }
    
    var total = 0;
    var carritoHTML = `
        <div id="cartModal" class="modal-overlay" onclick="cerrarCarrito()">
            <div class="modal-content cart-modal" onclick="event.stopPropagation()">
                <span class="close" onclick="cerrarCarrito()">&times;</span>
                <h2><i class="fas fa-shopping-cart"></i> Carrito de Compras</h2>
                <div class="cart-items">
    `;
    
    carrito.forEach(function(item) {
        var subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        // Determinar la ruta de la imagen
        var imagePath = (item.imagen && item.imagen !== 'default.jpg') 
            ? '../files/articulos/' + item.imagen 
            : IMG_PLACEHOLDER;
        
        // Decodificar el nombre del producto
        var nombreDecodificado = decodeHtml(item.nombre);
        
        // Usar el stock guardado en el item
        var stockDisponible = item.stock || 999;
        
        carritoHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${imagePath}" alt="${nombreDecodificado}" onerror="imgFallback(this)">
                </div>
                <div class="cart-item-info">
                    <h4>${nombreDecodificado}</h4>
                    <p class="cart-item-price">Precio: ${formatearPrecio(item.precio)}</p>
                    <div class="quantity-controls">
                        <button onclick="cambiarCantidad(${item.idarticulo}, -1)" class="qty-btn">-</button>
                        <span class="qty-display">Cantidad: ${item.cantidad}</span>
                        <button onclick="cambiarCantidad(${item.idarticulo}, 1)" class="qty-btn">+</button>
                    </div>
                    <p style="font-size: 12px; color: #888; margin-top: 5px;">Stock disponible: ${stockDisponible}</p>
                </div>
                <div class="cart-item-total">
                    <p class="subtotal-label">Subtotal:</p>
                    <p class="subtotal-amount">${formatearPrecio(subtotal)}</p>
                    <button class="remove-item" onclick="eliminarDelCarrito(${item.idarticulo})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    });
    
    carritoHTML += `
                </div>
                <div class="cart-total">
                    <h3><i class="fas fa-calculator"></i> Total: ${formatearPrecio(total)}</h3>
                    <button class="checkout-btn" onclick="procederAlPago()">
                        <i class="fas fa-credit-card"></i> Proceder al Pago
                    </button>
                    <button class="clear-cart-btn" onclick="vaciarCarrito()">
                        <i class="fas fa-times-circle"></i> Vaciar Carrito
                    </button>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(carritoHTML);
}

// Función para cambiar cantidad en el carrito
function cambiarCantidad(idarticulo, cambio) {
    var item = carrito.find(item => item.idarticulo === idarticulo);
    if (item) {
        var nuevaCantidad = item.cantidad + cambio;
        
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(idarticulo);
            return;
        }
        
        // Usar el stock guardado en el item (se actualiza cada vez que se agrega)
        var stockDisponible = item.stock || 999;
        
        // Verificar si la nueva cantidad excede el stock
        if (nuevaCantidad > stockDisponible) {
            mostrarError(`No hay más stock disponible. Solo hay ${stockDisponible} unidades.`);
            return;
        }
        
        item.cantidad = nuevaCantidad;
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarVistaCarrito();
    }
}

// Función para actualizar la vista del carrito sin cerrarlo y reabrirlo
function actualizarVistaCarrito() {
    // Actualizar items del carrito
    var cartItemsContainer = $('.cart-items');
    cartItemsContainer.empty();
    
    var total = 0;
    carrito.forEach(function(item) {
        var subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        var imagePath = (item.imagen && item.imagen !== 'default.jpg') 
            ? '../files/articulos/' + item.imagen 
            : IMG_PLACEHOLDER;
        
        var nombreDecodificado = decodeHtml(item.nombre);
        
        // Usar el stock guardado en el item
        var stockDisponible = item.stock || 999;
        
        var itemHTML = `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${imagePath}" alt="${nombreDecodificado}" onerror="imgFallback(this)">
                </div>
                <div class="cart-item-info">
                    <h4>${nombreDecodificado}</h4>
                    <p class="cart-item-price">Precio: ${formatearPrecio(item.precio)}</p>
                    <div class="quantity-controls">
                        <button onclick="cambiarCantidad(${item.idarticulo}, -1)" class="qty-btn">-</button>
                        <span class="qty-display">Cantidad: ${item.cantidad}</span>
                        <button onclick="cambiarCantidad(${item.idarticulo}, 1)" class="qty-btn">+</button>
                    </div>
                    <p style="font-size: 12px; color: #888; margin-top: 5px;">Stock disponible: ${stockDisponible}</p>
                </div>
                <div class="cart-item-total">
                    <p class="subtotal-label">Subtotal:</p>
                    <p class="subtotal-amount">${formatearPrecio(subtotal)}</p>
                    <button class="remove-item" onclick="eliminarDelCarrito(${item.idarticulo})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
        
        cartItemsContainer.append(itemHTML);
    });
    
    // Actualizar total
    $('.cart-total h3').html('<i class="fas fa-calculator"></i> Total: ' + formatearPrecio(total));
    
    // Actualizar contador
    actualizarContadorCarrito();
}

// Función para eliminar item del carrito
function eliminarDelCarrito(idarticulo) {
    carrito = carrito.filter(item => item.idarticulo !== idarticulo);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    cerrarCarrito();
    if (carrito.length > 0) {
        verCarrito();
    } else {
        mostrarExito('Carrito vacío');
    }
}

// Función para vaciar carrito
function vaciarCarrito(mostrarMensaje = true) {
    carrito = [];
    localStorage.removeItem('carrito');
    actualizarContadorCarrito();
    cerrarCarrito();
    if (mostrarMensaje) {
        mostrarExito('Carrito vaciado');
    }
}

// Función para cerrar carrito
function cerrarCarrito() {
    $('#cartModal').remove();
}

// Función para proceder al pago
function procederAlPago() {
    if (carrito.length === 0) {
        mostrarError('El carrito está vacío');
        return;
    }
    
    mostrarFormularioPago();
}

// Función para mostrar formulario de pago
function mostrarFormularioPago() {
    var total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    var modalPago = `
        <div id="pagoModal" class="modal-overlay" onclick="cerrarPago()">
            <div class="modal-content pago-modal" onclick="event.stopPropagation()">
                <span class="close" onclick="cerrarPago()">&times;</span>
                <h2><i class="fas fa-credit-card"></i> Procesar Pago</h2>
                
                <div class="pago-container">
                    <div class="pago-resumen">
                        <h3><i class="fas fa-shopping-cart"></i> Resumen del Pedido</h3>
                        <div class="pago-items">
    `;
    
    carrito.forEach(function(item) {
        var subtotal = item.precio * item.cantidad;
        var imagePath = (item.imagen && item.imagen !== 'default.jpg') 
            ? '../files/articulos/' + item.imagen 
            : IMG_PLACEHOLDER;
        
        // Decodificar el nombre del producto
        var nombreDecodificado = decodeHtml(item.nombre);
            
        modalPago += `
            <div class="pago-item">
                <div class="pago-item-image">
                    <img src="${imagePath}" alt="${nombreDecodificado}" onerror="imgFallback(this)">
                </div>
                <div class="pago-item-info">
                    <h4>${nombreDecodificado}</h4>
                    <p>Cantidad: ${item.cantidad}</p>
                    <p>Precio: ${formatearPrecio(item.precio)}</p>
                </div>
                <div class="pago-item-subtotal">
                    ${formatearPrecio(subtotal)}
                </div>
            </div>
        `;
    });
    
    modalPago += `
                        </div>
                        <div class="pago-total">
                            <h3>Total: ${formatearPrecio(total)}</h3>
                        </div>
                    </div>
                    
                    <div class="pago-formulario">
                        <h3><i class="fas fa-user"></i> Información de Contacto</h3>
                        <form id="formularioPago">
                            <div class="form-group">
                                <label for="nombreCliente">Nombre Completo *</label>
                                <input type="text" 
                                       id="nombreCliente" 
                                       name="nombreCliente" 
                                       minlength="3" 
                                       maxlength="100"
                                       title="Ingrese su nombre completo (mínimo 3 caracteres)"
                                       required>
                                <small class="char-counter">0/100 caracteres</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="emailCliente">Email *</label>
                                <input type="email" 
                                       id="emailCliente" 
                                       name="emailCliente" 
                                       maxlength="100"
                                       title="Ingrese un email válido"
                                       required>
                                <small class="char-counter">0/100 caracteres</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="telefonoCliente">Teléfono *</label>
                                <input type="tel" 
                                       id="telefonoCliente" 
                                       name="telefonoCliente" 
                                       minlength="7" 
                                       maxlength="15"
                                       title="Ingrese un teléfono válido (7-15 caracteres)"
                                       required>
                                <small class="char-counter">0/15 caracteres</small>
                            </div>
                            
                            <h3><i class="fas fa-map-marker-alt"></i> Dirección de Entrega</h3>
                            <div class="direccion-campos">
                                <div class="form-group">
                                    <label for="calleCliente">Calle *</label>
                                    <input type="text" 
                                           id="calleCliente" 
                                           name="calleCliente" 
                                           minlength="3" 
                                           maxlength="150"
                                           title="Ingrese el nombre de la calle (mínimo 3 caracteres)"
                                           required>
                                    <small class="char-counter">0/150 caracteres</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="numeroCliente">Número *</label>
                                    <input type="text" 
                                           id="numeroCliente" 
                                           name="numeroCliente" 
                                           maxlength="10"
                                           title="Ingrese el número (ej: 123, 45A, S/N)"
                                           required>
                                    <small class="char-counter">0/10 caracteres</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="ciudadCliente">Ciudad *</label>
                                    <input type="text" 
                                           id="ciudadCliente" 
                                           name="ciudadCliente" 
                                           minlength="2" 
                                           maxlength="100"
                                           title="Ingrese la ciudad (mínimo 2 caracteres)"
                                           required>
                                    <small class="char-counter">0/100 caracteres</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="provinciaCliente">Provincia *</label>
                                    <input type="text" 
                                           id="provinciaCliente" 
                                           name="provinciaCliente" 
                                           minlength="2" 
                                           maxlength="100"
                                           title="Ingrese la provincia (mínimo 2 caracteres)"
                                           required>
                                    <small class="char-counter">0/100 caracteres</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="codigoPostalCliente">Código Postal *</label>
                                    <input type="text" 
                                           id="codigoPostalCliente" 
                                           name="codigoPostalCliente" 
                                           minlength="3" 
                                           maxlength="10"
                                           title="Ingrese el código postal (3-10 caracteres)"
                                           required>
                                    <small class="char-counter">0/10 caracteres</small>
                                </div>
                            </div>
                            
                            <h3><i class="fas fa-credit-card"></i> Método de Pago</h3>
                            
                            <div class="metodos-pago">
                                <div class="metodo-pago">
                                    <input type="radio" id="efectivo" name="metodoPago" value="efectivo" checked>
                                    <label for="efectivo">
                                        <i class="fas fa-money-bill-wave"></i>
                                        <span>Efectivo</span>
                                    </label>
                                </div>
                                
                                <div class="metodo-pago">
                                    <input type="radio" id="transferencia" name="metodoPago" value="transferencia">
                                    <label for="transferencia">
                                        <i class="fas fa-university"></i>
                                        <span>Transferencia</span>
                                    </label>
                                </div>
                                
                                <div class="metodo-pago">
                                    <input type="radio" id="tarjeta" name="metodoPago" value="tarjeta">
                                    <label for="tarjeta">
                                        <i class="fas fa-credit-card"></i>
                                        <span>Tarjeta</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="pago-botones">
                                <button type="button" onclick="cerrarPago()" class="btn-cancelar">
                                    <i class="fas fa-times"></i> Cancelar
                                </button>
                                <button type="submit" class="btn-confirmar">
                                    <i class="fas fa-check"></i> Confirmar Pedido
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(modalPago);
    
    // Manejar envío del formulario
    $('#formularioPago').on('submit', function(e) {
        e.preventDefault();
        
        // Validar todos los campos antes de procesar
        var todosValidos = true;
        var primerError = null;
        
        $('#formularioPago input[required]').each(function() {
            var $input = $(this);
            var minLength = $input.attr('minlength');
            var valor = $input.val().trim();
            
            if (valor.length === 0) {
                todosValidos = false;
                $input.addClass('input-error');
                if (!$input.siblings('.error-message').length) {
                    $input.after('<span class="error-message">Este campo es requerido</span>');
                }
                if (!primerError) primerError = $input;
            } else if (minLength && valor.length < minLength) {
                todosValidos = false;
                $input.addClass('input-error');
                if (!$input.siblings('.error-message').length) {
                    $input.after('<span class="error-message">Mínimo ' + minLength + ' caracteres</span>');
                }
                if (!primerError) primerError = $input;
            } else if ($input.attr('type') === 'email') {
                var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(valor)) {
                    todosValidos = false;
                    $input.addClass('input-error');
                    if (!$input.siblings('.error-message').length) {
                        $input.after('<span class="error-message">Ingrese un email válido</span>');
                    }
                    if (!primerError) primerError = $input;
                }
            }
        });
        
        if (!todosValidos) {
            mostrarError('Por favor, complete todos los campos correctamente');
            if (primerError) {
                primerError.focus();
            }
            return false;
        }
        
        procesarPedido();
    });
    
    // Configurar contadores de caracteres para todos los campos
    $('#nombreCliente, #emailCliente, #telefonoCliente, #calleCliente, #numeroCliente, #ciudadCliente, #provinciaCliente, #codigoPostalCliente').on('input', function() {
        var $input = $(this);
        var maxLength = $input.attr('maxlength');
        var currentLength = $input.val().length;
        var $counter = $input.siblings('.char-counter');
        
        $counter.text(currentLength + '/' + maxLength + ' caracteres');
        
        // Cambiar color según el límite
        if (currentLength >= maxLength * 0.9) {
            $counter.css('color', '#ff0040');
        } else if (currentLength >= maxLength * 0.7) {
            $counter.css('color', '#ffa500');
        } else {
            $counter.css('color', 'var(--gamer-text-secondary)');
        }
    });
    
    // Validación personalizada para nombre (solo letras y espacios)
    $('#nombreCliente').on('input', function() {
        var valor = $(this).val();
        var soloLetras = valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
        if (valor !== soloLetras) {
            $(this).val(soloLetras);
        }
    });
    
    // Validación personalizada para teléfono (solo números y caracteres permitidos)
    $('#telefonoCliente').on('input', function() {
        var valor = $(this).val();
        var soloTelefono = valor.replace(/[^0-9+\-\s()]/g, '');
        if (valor !== soloTelefono) {
            $(this).val(soloTelefono);
        }
    });
    
    // Validación personalizada para ciudad y provincia (solo letras)
    $('#ciudadCliente, #provinciaCliente').on('input', function() {
        var valor = $(this).val();
        var soloLetras = valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
        if (valor !== soloLetras) {
            $(this).val(soloLetras);
        }
    });
    
    // Validación en tiempo real (solo cuando el usuario sale del campo)
    $('#formularioPago input').on('blur', function() {
        var $input = $(this);
        var minLength = $input.attr('minlength');
        var maxLength = $input.attr('maxlength');
        var valor = $input.val().trim();
        
        // Validar solo si hay contenido
        if (valor.length > 0) {
            var esValido = true;
            var mensaje = '';
            
            // Validar longitud mínima
            if (minLength && valor.length < minLength) {
                esValido = false;
                mensaje = 'Mínimo ' + minLength + ' caracteres';
            }
            
            // Validar email
            if ($input.attr('type') === 'email') {
                var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(valor)) {
                    esValido = false;
                    mensaje = 'Ingrese un email válido';
                }
            }
            
            if (!esValido) {
                $input.addClass('input-error');
                if (!$input.siblings('.error-message').length) {
                    $input.after('<span class="error-message">' + mensaje + '</span>');
                } else {
                    $input.siblings('.error-message').text(mensaje);
                }
            } else {
                $input.removeClass('input-error');
                $input.siblings('.error-message').remove();
            }
        } else {
            $input.removeClass('input-error');
            $input.siblings('.error-message').remove();
        }
    });
    
    // Limpiar error al escribir
    $('#formularioPago input').on('input', function() {
        $(this).removeClass('input-error');
        $(this).siblings('.error-message').remove();
    });
}

// Función para procesar el pedido
function procesarPedido() {
    var formData = {
        nombre: $('#nombreCliente').val(),
        email: $('#emailCliente').val(),
        telefono: $('#telefonoCliente').val(),
        direccion: {
            calle: $('#calleCliente').val(),
            numero: $('#numeroCliente').val(),
            ciudad: $('#ciudadCliente').val(),
            provincia: $('#provinciaCliente').val(),
            codigoPostal: $('#codigoPostalCliente').val()
        },
        metodoPago: $('input[name="metodoPago"]:checked').val(),
        productos: carrito,
        total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    };
    
    // Cerrar el modal de pago
    cerrarPago();
    
    // Mostrar modal según el método de pago
    var metodoPago = formData.metodoPago;
    
    if (metodoPago === 'efectivo') {
        mostrarModalEfectivo(formData);
    } else if (metodoPago === 'transferencia') {
        mostrarModalTransferencia(formData);
    } else if (metodoPago === 'tarjeta') {
        mostrarModalTarjeta(formData);
    }
}

// Función para cerrar modal de pago
function cerrarPago() {
    $('#pagoModal').remove();
}

// Modal para pago en efectivo (15% descuento)
function mostrarModalEfectivo(formData) {
    var totalOriginal = formData.total;
    var descuento = totalOriginal * 0.15;
    var totalConDescuento = totalOriginal - descuento;
    
    var modalEfectivo = `
        <div id="efectivoModal" class="modal-overlay" onclick="cerrarModalEfectivo()">
            <div class="modal-content pago-modal" onclick="event.stopPropagation()">
                <span class="close" onclick="cerrarModalEfectivo()">&times;</span>
                <h2><i class="fas fa-money-bill-wave"></i> Pago en Efectivo</h2>
                
                <div class="efectivo-container">
                    <div class="descuento-info">
                        <div class="descuento-badge">
                            <i class="fas fa-tags"></i>
                            <span>15% DE DESCUENTO</span>
                        </div>
                        <div class="precio-detalle">
                            <p class="precio-original">Precio original: <span>${formatearPrecio(totalOriginal)}</span></p>
                            <p class="precio-descuento">Descuento (15%): <span>-${formatearPrecio(descuento)}</span></p>
                            <hr>
                            <p class="precio-final">Total a pagar: <span>${formatearPrecio(totalConDescuento)}</span></p>
                        </div>
                    </div>
                    
                    <div class="entrega-opciones">
                        <h3><i class="fas fa-truck"></i> Método de Entrega</h3>
                        <div class="opciones-entrega">
                            <div class="opcion-entrega">
                                <input type="radio" id="retiroLocal" name="entrega" value="retiro" checked>
                                <label for="retiroLocal">
                                    <i class="fas fa-store"></i>
                                    <div class="opcion-info">
                                        <strong>Retiro en Local</strong>
                                        <p>Sáenz Peña, Chaco - Sin cargo</p>
                                    </div>
                                </label>
                            </div>
                            
                            <div class="opcion-entrega">
                                <input type="radio" id="envioLocal" name="entrega" value="envio">
                                <label for="envioLocal">
                                    <i class="fas fa-shipping-fast"></i>
                                    <div class="opcion-info">
                                        <strong>Envío a Domicilio</strong>
                                        <p>${formData.direccion.calle} ${formData.direccion.numero}, ${formData.direccion.ciudad}</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="efectivo-botones">
                        <button onclick="cerrarModalEfectivo()" class="btn-cancelar">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button onclick="confirmarPedidoEfectivo()" class="btn-confirmar">
                            <i class="fas fa-check"></i> Confirmar Pedido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(modalEfectivo);
    
    // Guardar datos globalmente para usar en confirmación
    window.pedidoActual = formData;
    window.pedidoActual.totalConDescuento = totalConDescuento;
}

function cerrarModalEfectivo() {
    $('#efectivoModal').remove();
}

function confirmarPedidoEfectivo() {
    console.log('=== INICIO confirmarPedidoEfectivo ===');
    
    try {
        var metodoEntrega = $('input[name="entrega"]:checked').val();
        console.log('Método de entrega seleccionado:', metodoEntrega);
        
        if (!window.pedidoActual) {
            console.error('ERROR: window.pedidoActual no existe');
            mostrarError('Error: No se encontraron datos del pedido');
            return;
        }
        
        window.pedidoActual.metodoEntrega = metodoEntrega;
        
        console.log('Datos del pedido a enviar:', window.pedidoActual);
        console.log('Productos en el pedido:', window.pedidoActual.productos);
        console.log('Total:', window.pedidoActual.total);
        
        cerrarModalEfectivo();
        mostrarCargando(true);
        
        console.log('Iniciando petición AJAX...');
        
        // Enviar datos al servidor para registrar la venta
        $.ajax({
            url: '../ajax/tienda.php?op=registrarVenta',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(window.pedidoActual),
            dataType: 'json',
            beforeSend: function() {
                console.log('AJAX: beforeSend - Enviando datos...');
            },
            success: function(response) {
                console.log('AJAX: success - Respuesta del servidor:', response);
                
                mostrarCargando(false);
                
                if (response.success) {
                    console.log('Venta registrada exitosamente:', response);
                    
                    // Vaciar carrito sin mostrar mensaje
                    vaciarCarrito(false);
                    
                    var mensaje = '';
                    
                    if (metodoEntrega === 'retiro') {
                        mensaje = '¡Pedido #' + response.num_comprobante + ' confirmado! Te contactaremos pronto para coordinar la entrega en nuestro local.';
                    } else {
                        mensaje = '¡Pedido #' + response.num_comprobante + ' confirmado! Te contactaremos pronto para coordinar el envío. El pedido será enviado una vez pagada la compra.';
                    }
                    
                    console.log('Mostrando mensaje:', mensaje);
                    mostrarExitoLargo(mensaje);
                } else {
                    console.error('Error del servidor:', response.mensaje);
                    mostrarError('Error al procesar el pedido: ' + response.mensaje);
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX: error - Estado:', status);
                console.error('AJAX: error - Error:', error);
                console.error('AJAX: error - Response Text:', xhr.responseText);
                console.error('AJAX: error - Status Code:', xhr.status);
                
                mostrarCargando(false);
                mostrarError('Error al procesar el pedido. Por favor, intenta nuevamente. Status: ' + xhr.status);
            },
            complete: function() {
                console.log('AJAX: complete - Petición finalizada');
            }
        });
        
    } catch (e) {
        console.error('EXCEPCIÓN en confirmarPedidoEfectivo:', e);
        console.error('Stack:', e.stack);
        mostrarError('Error inesperado: ' + e.message);
    }
    
    console.log('=== FIN confirmarPedidoEfectivo ===');
}

// Modal para transferencia bancaria
function mostrarModalTransferencia(formData) {
    var total = formData.total;
    
    var modalTransferencia = `
        <div id="transferenciaModal" class="modal-overlay" onclick="cerrarModalTransferencia()">
            <div class="modal-content pago-modal" onclick="event.stopPropagation()">
                <span class="close" onclick="cerrarModalTransferencia()">&times;</span>
                <h2><i class="fas fa-university"></i> Transferencia Bancaria</h2>
                
                <div class="transferencia-container">
                    <div class="transferencia-info">
                        <p class="transferencia-instruccion">
                            <i class="fas fa-info-circle"></i>
                            Realiza la transferencia a la siguiente cuenta:
                        </p>
                        
                        <div class="datos-bancarios">
                            <div class="dato-bancario">
                                <label><i class="fas fa-tag"></i> Alias:</label>
                                <div class="dato-valor">
                                    <strong>bugstienda.mp</strong>
                                    <button onclick="copiarTexto('bugstienda.mp')" class="btn-copiar" title="Copiar">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="dato-bancario">
                                <label><i class="fas fa-credit-card"></i> CVU:</label>
                                <div class="dato-valor">
                                    <strong>0000003100089876543210</strong>
                                    <button onclick="copiarTexto('0000003100089876543210')" class="btn-copiar" title="Copiar">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="dato-bancario total">
                                <label><i class="fas fa-dollar-sign"></i> Monto a transferir:</label>
                                <div class="dato-valor">
                                    <strong class="monto-transferir">${formatearPrecio(total)}</strong>
                                </div>
                            </div>
                        </div>
                        
                        <div class="transferencia-mensaje">
                            <i class="fas fa-envelope"></i>
                            <p><strong>Importante:</strong> Si la transferencia llegó correctamente, te llegará un mail de confirmación con tu pedido.</p>
                        </div>
                    </div>
                    
                    <div class="transferencia-botones">
                        <button onclick="cerrarModalTransferencia()" class="btn-cancelar">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button onclick="confirmarTransferencia()" class="btn-confirmar">
                            <i class="fas fa-paper-plane"></i> Transferencia Enviada
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(modalTransferencia);
    window.pedidoActual = formData;
}

function cerrarModalTransferencia() {
    $('#transferenciaModal').remove();
}

function copiarTexto(texto) {
    navigator.clipboard.writeText(texto).then(function() {
        mostrarExito('¡Copiado al portapapeles!');
    }).catch(function(err) {
        console.error('Error al copiar:', err);
    });
}

function confirmarTransferencia() {
    console.log('Transferencia confirmada:', window.pedidoActual);
    
    cerrarModalTransferencia();
    mostrarCargando(true);
    
    // Enviar datos al servidor para registrar la venta
    $.ajax({
        url: '../ajax/tienda.php?op=registrarVenta',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(window.pedidoActual),
        dataType: 'json',
        success: function(response) {
            console.log('Respuesta del servidor:', response);
            
            mostrarCargando(false);
            
            if (response.success) {
                vaciarCarrito(false);
                mostrarExitoLargo('¡Pedido #' + response.num_comprobante + ' registrado! Verificaremos la transferencia y te enviaremos un correo de confirmación.');
            } else {
                mostrarError('Error al procesar el pedido: ' + response.mensaje);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error en la petición:', error);
            mostrarCargando(false);
            mostrarError('Error al procesar el pedido. Por favor, intenta nuevamente.');
        }
    });
}

// Modal para pago con tarjeta
function mostrarModalTarjeta(formData) {
    var total = formData.total;
    
    var modalTarjeta = `
        <div id="tarjetaModal" class="modal-overlay" onclick="cerrarModalTarjeta()">
            <div class="modal-content pago-modal" onclick="event.stopPropagation()">
                <span class="close" onclick="cerrarModalTarjeta()">&times;</span>
                <h2><i class="fas fa-credit-card"></i> Pago con Tarjeta</h2>
                
                <div class="tarjeta-container">
                    <div class="tarjeta-visual">
                        <div class="tarjeta-flip-container" id="tarjetaFlipContainer">
                            <div class="tarjeta-card tarjeta-frente">
                                <div class="tarjeta-chip"></div>
                                <div class="tarjeta-numero" id="tarjetaNumeroDisplay">•••• •••• •••• ••••</div>
                                <div class="tarjeta-info">
                                    <div class="tarjeta-titular">
                                        <small>TITULAR</small>
                                        <div id="tarjetaTitularDisplay">NOMBRE APELLIDO</div>
                                    </div>
                                    <div class="tarjeta-expira">
                                        <small>VENCE</small>
                                        <div id="tarjetaExpiraDisplay">MM/AA</div>
                                    </div>
                                </div>
                            </div>
                            <div class="tarjeta-card tarjeta-reverso">
                                <div class="tarjeta-banda"></div>
                                <div class="tarjeta-cvv-box">
                                    <div class="tarjeta-cvv-label">CVV</div>
                                    <div class="tarjeta-cvv-display" id="tarjetaCvvDisplay">•••</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <form id="formularioTarjeta">
                        <div class="form-group">
                            <label for="numeroTarjeta">
                                <i class="fas fa-credit-card"></i> Número de Tarjeta *
                            </label>
                            <input type="text" 
                                   id="numeroTarjeta" 
                                   name="numeroTarjeta" 
                                   placeholder="1234 5678 9012 3456"
                                   maxlength="19"
                                   required>
                        </div>
                        
                        <div class="form-group">
                            <label for="titularTarjeta">
                                <i class="fas fa-user"></i> Titular de la Tarjeta *
                            </label>
                            <input type="text" 
                                   id="titularTarjeta" 
                                   name="titularTarjeta" 
                                   placeholder="NOMBRE APELLIDO"
                                   maxlength="50"
                                   required>
                        </div>
                        
                        <div class="tarjeta-row">
                            <div class="form-group">
                                <label for="mesExpiracion">
                                    <i class="fas fa-calendar"></i> Mes *
                                </label>
                                <select id="mesExpiracion" name="mesExpiracion" required>
                                    <option value="">MM</option>
                                    <option value="01">01</option>
                                    <option value="02">02</option>
                                    <option value="03">03</option>
                                    <option value="04">04</option>
                                    <option value="05">05</option>
                                    <option value="06">06</option>
                                    <option value="07">07</option>
                                    <option value="08">08</option>
                                    <option value="09">09</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="anioExpiracion">
                                    <i class="fas fa-calendar-alt"></i> Año *
                                </label>
                                <select id="anioExpiracion" name="anioExpiracion" required>
                                    <option value="">AA</option>
                                    <option value="25">25</option>
                                    <option value="26">26</option>
                                    <option value="27">27</option>
                                    <option value="28">28</option>
                                    <option value="29">29</option>
                                    <option value="30">30</option>
                                    <option value="31">31</option>
                                    <option value="32">32</option>
                                    <option value="33">33</option>
                                    <option value="34">34</option>
                                    <option value="35">35</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="cvvTarjeta">
                                    <i class="fas fa-lock"></i> CVV *
                                </label>
                                <input type="text" 
                                       id="cvvTarjeta" 
                                       name="cvvTarjeta" 
                                       placeholder="123"
                                       maxlength="4"
                                       required>
                            </div>
                        </div>
                        
                        <div class="tarjeta-total">
                            <p>Total a pagar: <strong>${formatearPrecio(total)}</strong></p>
                        </div>
                        
                        <div class="tarjeta-botones">
                            <button type="button" onclick="cerrarModalTarjeta()" class="btn-cancelar">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button type="submit" class="btn-confirmar">
                                <i class="fas fa-check"></i> Pagar ${formatearPrecio(total)}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(modalTarjeta);
    window.pedidoActual = formData;
    
    // Formatear número de tarjeta mientras se escribe
    $('#numeroTarjeta').on('input', function() {
        var valor = $(this).val().replace(/\s/g, '');
        var valorFormateado = valor.match(/.{1,4}/g)?.join(' ') || valor;
        $(this).val(valorFormateado);
        
        // Actualizar vista de tarjeta
        var numeroDisplay = valorFormateado || '•••• •••• •••• ••••';
        $('#tarjetaNumeroDisplay').text(numeroDisplay);
    });
    
    // Solo números en tarjeta
    $('#numeroTarjeta').on('keypress', function(e) {
        if (e.which < 48 || e.which > 57) {
            e.preventDefault();
        }
    });
    
    // Actualizar titular en vista de tarjeta
    $('#titularTarjeta').on('input', function() {
        var valor = $(this).val().toUpperCase();
        $(this).val(valor);
        $('#tarjetaTitularDisplay').text(valor || 'NOMBRE APELLIDO');
    });
    
    // Solo letras en titular
    $('#titularTarjeta').on('keypress', function(e) {
        var char = String.fromCharCode(e.which);
        if (!/[a-zA-Z\s]/.test(char)) {
            e.preventDefault();
        }
    });
    
    // Actualizar fecha de expiración
    $('#mesExpiracion, #anioExpiracion').on('change', function() {
        var mes = $('#mesExpiracion').val();
        var anio = $('#anioExpiracion').val();
        var fecha = (mes && anio) ? mes + '/' + anio : 'MM/AA';
        $('#tarjetaExpiraDisplay').text(fecha);
    });
    
    // Solo números en CVV
    $('#cvvTarjeta').on('keypress', function(e) {
        if (e.which < 48 || e.which > 57) {
            e.preventDefault();
        }
    });
    
    // Voltear tarjeta al enfocar CVV
    $('#cvvTarjeta').on('focus', function() {
        $('#tarjetaFlipContainer').addClass('flip');
    });
    
    // Volver al frente cuando pierde el foco
    $('#cvvTarjeta').on('blur', function() {
        $('#tarjetaFlipContainer').removeClass('flip');
    });
    
    // Actualizar CVV en el reverso
    $('#cvvTarjeta').on('input', function() {
        var cvv = $(this).val();
        var cvvDisplay = '';
        if (cvv.length === 0) {
            cvvDisplay = '•••';
        } else {
            cvvDisplay = cvv;
        }
        $('#tarjetaCvvDisplay').text(cvvDisplay);
    });
    
    // Manejar envío del formulario
    $('#formularioTarjeta').on('submit', function(e) {
        e.preventDefault();
        procesarPagoTarjeta();
    });
}

function cerrarModalTarjeta() {
    $('#tarjetaModal').remove();
}

function procesarPagoTarjeta() {
    var datosTarjeta = {
        numero: $('#numeroTarjeta').val(),
        titular: $('#titularTarjeta').val(),
        mes: $('#mesExpiracion').val(),
        anio: $('#anioExpiracion').val(),
        cvv: $('#cvvTarjeta').val()
    };
    
    console.log('Pago con tarjeta:', datosTarjeta);
    console.log('Pedido:', window.pedidoActual);
    
    cerrarModalTarjeta();
    mostrarCargando(true);
    
    // Enviar datos al servidor para registrar la venta
    $.ajax({
        url: '../ajax/tienda.php?op=registrarVenta',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(window.pedidoActual),
        dataType: 'json',
        success: function(response) {
            console.log('Respuesta del servidor:', response);
            
            mostrarCargando(false);
            
            if (response.success) {
                vaciarCarrito(false);
                mostrarExitoLargo('¡Pago procesado exitosamente! Pedido #' + response.num_comprobante + ' confirmado. Recibirás un correo de confirmación.');
            } else {
                mostrarError('Error al procesar el pedido: ' + response.mensaje);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error en la petición:', error);
            mostrarCargando(false);
            mostrarError('Error al procesar el pedido. Por favor, intenta nuevamente.');
        }
    });
}

// Funciones de utilidad para mostrar mensajes
function mostrarCargando(mostrar) {
    if (mostrar) {
        $('#loadingMessage').show();
    } else {
        $('#loadingMessage').hide();
    }
}

function mostrarError(mensaje) {
    $('#errorMessage').text(mensaje).show();
    setTimeout(() => $('#errorMessage').hide(), 5000);
}

function mostrarExito(mensaje) {
    $('#successMessage').text(mensaje).show();
    setTimeout(() => $('#successMessage').hide(), 3000);
}

function mostrarExitoLargo(mensaje) {
    // Mensaje más largo con duración extendida
    $('#successMessage').html('<strong>' + mensaje + '</strong>').show();
    
    // Scroll hacia arriba para que se vea el mensaje
    $('html, body').animate({ scrollTop: 0 }, 500);
    
    // Duración de 7 segundos para mensajes largos
    setTimeout(() => $('#successMessage').hide(), 7000);
}

function ocultarMensajes() {
    $('#errorMessage').hide();
    $('#successMessage').hide();
}

// Event listeners
$(document).ready(function() {
    init();
    
    // Buscar al presionar Enter
    $('#searchInput').keypress(function(e) {
        if (e.which === 13) {
            buscarProductos();
        }
    });
    
    // Filtros en tiempo real
    $('#categoryFilter, #marcaFilter, #priceFilter, #sortFilter').change(function() {
        cargarProductos(1);
    });
});

// Funciones de compatibilidad con el HTML existente
function loadProducts(pagina) {
    cargarProductos(pagina);
}

function searchProducts() {
    buscarProductos();
}

function clearFilters() {
    limpiarFiltros();
}

function viewProduct(idarticulo) {
    verProducto(idarticulo);
}

function addToCart(event, idarticulo, nombre, precio) {
    agregarAlCarrito(event, idarticulo, nombre, precio);
}

function viewCart() {
    verCarrito();
}