<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BUGS electronics</title>
    <!-- Estilos Gaming -->
    <link rel="stylesheet" href="../public2/gamer-styles.css?v=<?php echo time(); ?>">
    <!-- jQuery -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <!-- Font Awesome para iconos -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="gaming-bg">
    <div class="container">
        <header>
            <div class="header-content">
                <div class="logo">
                    <i class="fas fa-bug"></i> BUGS electronics
                </div>
                <div class="search-bar">
                    <input type="text" id="searchInput" class="search-input" placeholder="Buscar productos gaming...">
                    <button onclick="searchProducts()" class="btn btn-primary">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                </div>
            </div>
        </header>


        <div class="filters">
            <h3><i class="fas fa-filter"></i> Filtros de Búsqueda</h3>
            <div class="filter-group">
                <select id="categoryFilter" class="filter-select" onchange="loadProducts()">
                    <option value="">Todas las categorías</option>
                    <!-- Las categorías se cargan dinámicamente desde la base de datos -->
                </select>
                <select id="marcaFilter" class="filter-select" onchange="loadProducts()">
                    <option value="">Todas las marcas</option>
                    <!-- Las marcas se cargan dinámicamente desde la base de datos -->
                </select>
                <select id="priceFilter" class="filter-select" onchange="loadProducts()">
                    <option value="">Filtrar por Precios</option>
                    <option value="0-50000">$0 - $50,000</option>
                    <option value="50000-300000">$50,000 - $300,000</option>
                    <option value="300000-600000">$300,000 - $600,000</option>
                    <option value="600000-1500000">$600,000 - $1,500,000</option>
                    <option value="1500000-99999999">Más de $1,500,000</option>
                </select>
                <select id="sortFilter" class="filter-select" onchange="loadProducts()">
                    <option value="">Ordenar por</option>
                    <option value="name_asc">Nombre A-Z</option>
                    <option value="name_desc">Nombre Z-A</option>
                    <option value="price_asc">Precio menor a mayor</option>
                    <option value="price_desc">Precio mayor a menor</option>
                </select>
                <button onclick="clearFilters()" class="btn btn-success">
                    <i class="fas fa-times"></i> Limpiar filtros
                </button>
            </div>
        </div>

        <!-- Mensajes de estado -->
        <div id="loadingMessage" class="loading" style="display: none;">
            Cargando productos... ⏳
        </div>

        <div id="errorMessage" class="error-message" style="display: none;"></div>
        <div id="successMessage" class="success-message" style="display: none;"></div>

        <!-- Contenedor de productos - se llena dinámicamente -->
        <div id="productsContainer" class="products-grid">
            <!-- Los productos se cargan aquí dinámicamente -->
        </div>

        <!-- Paginación -->
        <div id="pagination" class="pagination">
            <!-- La paginación se genera dinámicamente -->
        </div>
    </div>

    <!-- Icono del carrito Gaming -->
    <div class="cart-icon" onclick="viewCart()">
        <i class="fas fa-shopping-cart"></i> Carrito <span id="cartCount" class="cart-count">0</span>
    </div>

    <!-- Footer Gaming -->
    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h3><i class="fas fa-bug"></i> BUGS electronics</h3>
                <p>Tu tienda de confianza en artículos electrónicos. Encuentra los mejores componentes, equipos y tecnología del mercado.</p>
            </div>
            <div class="footer-section">
                <h3><i class="fas fa-map-marker-alt"></i> Ubicación</h3>
                <p>Sáenz Peña, Chaco</p>
                <p>Argentina</p>
            </div>
            <div class="footer-section">
                <h3><i class="fas fa-envelope"></i> Contacto</h3>
                <p><a href="mailto:ssrdos@hotmail.com">ssrdos@hotmail.com</a></p>
                <p>Tel: +54 3644-692408</p>
            </div>
            <div class="footer-section">
                <h3><i class="fas fa-clock"></i> Horarios</h3>
                <p>Lunes a Viernes: 9:30 a 18hs</p>
                <p>Sábados: 9:30 a 14hs</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 BUGS electronics. Todos los derechos reservados. | Diseño inspirado en Universo Gamer</p>
        </div>
    </footer>

    <!-- Scripts -->
    <script type="text/javascript" src="scripts/tienda.js?v=<?php echo time(); ?>"></script>
    
    <!-- Script de Verificación y Carga de Marcas -->
    <script>
        console.log('🔍 indexTienda.php cargado');
        console.log('jQuery disponible:', typeof jQuery !== 'undefined');
        console.log('Función init disponible:', typeof init !== 'undefined');
        console.log('Función cargarMarcas disponible:', typeof cargarMarcas !== 'undefined');
        
        // Si cargarMarcas no existe, la creamos aquí directamente
        if (typeof cargarMarcas === 'undefined') {
            console.warn('⚠️ cargarMarcas no está definida, creándola ahora...');
            
            function cargarMarcas() {
                console.log('🔍 [INLINE] Iniciando carga de marcas...');
                $.ajax({
                    url: '../ajax/tienda.php?op=listarMarcas',
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        console.log('✓ [INLINE] Marcas recibidas:', data);
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
                            console.log('✓ [INLINE] Marcas cargadas correctamente en el select');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('✗ [INLINE] Error al cargar marcas:', error);
                        console.error('Status:', status);
                        console.error('Response:', xhr.responseText);
                    }
                });
            }
            
            // Ejecutar inmediatamente
            $(document).ready(function() {
                console.log('📄 Documento listo, ejecutando cargarMarcas...');
                cargarMarcas();
            });
        }
        
        // Forzar verificación después de 2 segundos
        setTimeout(function() {
            console.log('⏱️ Verificando select de marcas...');
            var marcaSelect = document.getElementById('marcaFilter');
            if (marcaSelect) {
                console.log('Select encontrado, opciones:', marcaSelect.options.length);
                for (var i = 0; i < marcaSelect.options.length; i++) {
                    console.log('  Opción ' + i + ':', marcaSelect.options[i].text);
                }
            } else {
                console.error('✗ Select #marcaFilter NO encontrado');
            }
        }, 3000);
    </script>
    
    <!-- Scripts Gaming adicionales -->
    <script>
        // Efectos de hover mejorados para tarjetas
        document.addEventListener('DOMContentLoaded', function() {
            // Agregar efectos de sonido (opcional)
            const buttons = document.querySelectorAll('.btn, .add-to-cart');
            buttons.forEach(button => {
                button.addEventListener('click', function() {
                    // Efecto visual al hacer clic
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
            });

            // Animación de contadores en características
            const observerOptions = {
                threshold: 0.5,
                rootMargin: '0px 0px -100px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'slideInUp 0.8s ease forwards';
                    }
                });
            }, observerOptions);

            // Observar todas las tarjetas de producto
            const productCards = document.querySelectorAll('.product-card');
            productCards.forEach(card => {
                observer.observe(card);
            });
        });

        // Función para mostrar notificación gaming
        function showGamingNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `gaming-notification ${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            // Agregar estilos para la notificación
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, var(--gamer-red), var(--gamer-blue));
                color: white;
                padding: 1rem 2rem;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(255, 0, 64, 0.3);
                z-index: 9999;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
            `;
            
            document.body.appendChild(notification);
            
            // Animar entrada
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Remover después de 3 segundos
            setTimeout(() => {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }

        // Función para agregar producto al carrito con efectos gaming
        function addToCartGaming(productId, productName) {
            // Aquí iría la lógica del carrito original
            showGamingNotification(`¡${productName} agregado al carrito!`);
            
            // Efecto de partículas (opcional)
            createParticleEffect();
        }

        // Efecto de partículas simple
        function createParticleEffect() {
            const particles = [];
            for (let i = 0; i < 10; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: var(--gamer-red);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9998;
                `;
                particle.style.left = Math.random() * window.innerWidth + 'px';
                particle.style.top = Math.random() * window.innerHeight + 'px';
                document.body.appendChild(particle);
                particles.push(particle);
                
                // Animar partícula
                setTimeout(() => {
                    particle.style.transform = 'scale(0)';
                    particle.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(particle);
                    }, 500);
                }, 100);
            }
        }
    </script>
</body>
</html>