// ============================================================================
// ARCHIVO: src/vistas/cliente/PantallaMenu.jsx
// DESCRIPCIÓN: Selección interactiva de estilo (Con/Sin licor/Cremoso) y tamaño (8, 12, 16 oz).
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { obtenerMenu } from '../../sdk/vertizzeApi';
import { 
  CupSoda, 
  ShoppingBag, 
  ArrowLeft, 
  Search, 
  Plus, 
  ShoppingCart,
  Sparkles,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Wine,
  Droplets
} from 'lucide-react';

function TarjetaImagen({ src, alt }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0B1220] text-slate-500 gap-2">
        <ImageIcon className="w-8 h-8 text-slate-600" />
        <span className="text-[10px] text-slate-400 font-medium">Sin imagen</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      onError={() => setError(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
  );
}

const capitalizarTexto = (texto) => {
  if (!texto) return '';
  const str = String(texto).trim();
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const parsearObjetoSeguro = (valor) => {
  if (!valor) return null;
  if (typeof valor === 'object') return valor;
  if (typeof valor === 'string') {
    try {
      return JSON.parse(valor);
    } catch {
      return null;
    }
  }
  return null;
};

// Tarifas base de vasos según estilo
const TARIFAS_ESTILO = {
  con_licor: {
    id: 'con_licor',
    nombre: 'Con licor',
    tamanos: [
      { id: '8oz', nombre: '8 Onzas', precio: 9000 },
      { id: '12oz', nombre: '12 Onzas', precio: 11000 },
      { id: '16oz', nombre: '16 Onzas', precio: 13000 }
    ]
  },
  cremoso: {
    id: 'cremoso',
    nombre: 'Cremoso',
    tamanos: [
      { id: '8oz', nombre: '8 Onzas', precio: 10000 },
      { id: '12oz', nombre: '12 Onzas', precio: 12000 },
      { id: '16oz', nombre: '16 Onzas', precio: 14000 }
    ]
  },
  sin_licor: {
    id: 'sin_licor',
    nombre: 'Sin licor',
    tamanos: [
      { id: '8oz', nombre: '8 Onzas', precio: 8000 },
      { id: '12oz', nombre: '12 Onzas', precio: 10000 },
      { id: '16oz', nombre: '16 Onzas', precio: 12000 }
    ]
  }
};

export default function PantallaMenu({ modoPedido, alVolverInicio, alIrAlCarrito, carrito, alAgregarAlCarrito }) {
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [productosMenu, setProductosMenu] = useState([]);
  const [categoriasMenu, setCategoriasMenu] = useState([{ id: 'todos', nombre: 'Todo el Menú', icono: Sparkles }]);
  const [cargando, setCargando] = useState(true);

  // Estados del modal interactivo
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [estiloElegido, setEstiloElegido] = useState('con_licor');
  const [tamanoElegido, setTamanoElegido] = useState(null);
  const [observacionItem, setObservacionItem] = useState('');

  const scrollContainerRef = useRef(null);

  const desplazarCategorias = (direccion) => {
    if (scrollContainerRef.current) {
      const valorScroll = direccion === 'izquierda' ? -250 : 250;
      scrollContainerRef.current.scrollBy({ left: valorScroll, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    async function cargarMenuDesdeBD() {
      try {
        setCargando(true);
        const datos = await obtenerMenu();
        const listaProductos = Array.isArray(datos) ? datos : (datos?.productos || []);

        const disponibles = listaProductos.filter(
          p => p.disponible === undefined || p.disponible === null || Boolean(p.disponible)
        );

        setProductosMenu(disponibles);

        const categoriasUnicas = Array.from(
          new Set(disponibles.map(p => p.categoria || p.categoria_nombre).filter(Boolean))
        );

        const categoriasFormateadas = [
          { id: 'todos', nombre: 'Todo el Menú', icono: Sparkles },
          ...categoriasUnicas.map(cat => ({
            id: String(cat).toLowerCase().replace(/\s+/g, '_'),
            nombre: capitalizarTexto(cat),
            icono: CupSoda
          }))
        ];

        setCategoriasMenu(categoriasFormateadas);
      } catch (error) {
        console.error("Error al cargar el menú desde BD:", error);
        setProductosMenu([]);
        setCategoriasMenu([{ id: 'todos', nombre: 'Todo el Menú', icono: Sparkles }]);
      } finally {
        setCargando(false);
      }
    }
    cargarMenuDesdeBD();
  }, []);

  const detectarEstiloInicial = (producto) => {
    const cat = String(producto?.categoria || producto?.categoria_nombre || '').toLowerCase();
    if (cat.includes('cremos')) return 'cremoso';
    if (cat.includes('sin licor') || cat.includes('sin_licor')) return 'sin_licor';
    return 'con_licor';
  };

  // Estilos disponibles según la categoría del producto (si es Cremoso ofrece Cremoso y Sin licor; si no, Con licor y Sin licor)
  const obtenerEstilosDisponibles = (producto) => {
    const cat = String(producto?.categoria || producto?.categoria_nombre || '').toLowerCase();
    if (cat.includes('cremos')) {
      return [TARIFAS_ESTILO.cremoso, TARIFAS_ESTILO.sin_licor];
    }
    return [TARIFAS_ESTILO.con_licor, TARIFAS_ESTILO.sin_licor];
  };

  // Obtiene los tamaños (8, 12, 16 oz) para el estilo elegido, respetando precios guardados en BD si existen
  const obtenerTamanosConPrecios = (producto, estiloId) => {
    const baseEstilo = TARIFAS_ESTILO[estiloId] || TARIFAS_ESTILO.con_licor;
    const preciosBD = parsearObjetoSeguro(producto?.precios_tamano);

    return baseEstilo.tamanos.map((tam) => {
      // Si el producto trae precios específicos por estilo y tamaño en BD: { con_licor: { "8oz": 9000 } }
      const precioPorEstiloBD = preciosBD?.[estiloId]?.[tam.id];
      // Si trae precios planos por tamaño en BD: { "8oz": 9000 }
      const precioPlanoBD = preciosBD?.[tam.id];

      let precioFinal = tam.precio;
      if (precioPorEstiloBD !== undefined && precioPorEstiloBD !== null && precioPorEstiloBD !== '') {
        precioFinal = Number(precioPorEstiloBD);
      } else if (precioPlanoBD !== undefined && precioPlanoBD !== null && precioPlanoBD !== '') {
        precioFinal = Number(precioPlanoBD);
      }

      return {
        ...tam,
        precio: precioFinal
      };
    });
  };

  const abrirModalProducto = (producto) => {
    const estiloInicial = detectarEstiloInicial(producto);
    const tamanos = obtenerTamanosConPrecios(producto, estiloInicial);
    setProductoSeleccionado(producto);
    setEstiloElegido(estiloInicial);
    setTamanoElegido(tamanos[0] || null);
    setObservacionItem('');
  };

  const cambiarEstilo = (nuevoEstiloId) => {
    setEstiloElegido(nuevoEstiloId);
    const tamanosActualizados = obtenerTamanosConPrecios(productoSeleccionado, nuevoEstiloId);
    const tamañoActualId = tamanoElegido?.id || '8oz';
    const coincidente = tamanosActualizados.find(t => t.id === tamañoActualId) || tamanosActualizados[0];
    setTamanoElegido(coincidente);
  };

  const agregarAlCarritoDesdeModal = () => {
    if (!productoSeleccionado || !tamanoElegido) return;

    const infoEstilo = TARIFAS_ESTILO[estiloElegido] || TARIFAS_ESTILO.con_licor;
    const categoriaBase = productoSeleccionado.categoria || productoSeleccionado.categoria_nombre || 'Granizado';

    const itemFinal = {
      id: `${productoSeleccionado.id}-${estiloElegido}-${tamanoElegido.id}-${Date.now()}`,
      producto_id: productoSeleccionado.id,
      nombre: productoSeleccionado.nombre,
      imagen: productoSeleccionado.imagen,
      precio: Number(tamanoElegido.precio || 0),
      cantidad: 1,
      estilo_id: infoEstilo.id,
      estilo_nombre: infoEstilo.nombre,
      tamano_id: tamanoElegido.id,
      tamano_nombre: tamanoElegido.nombre,
      sabor_nombre: productoSeleccionado.nombre,
      categoria_nombre: `${categoriaBase} · ${infoEstilo.nombre}`,
      toppings_lista: productoSeleccionado.descripcion,
      observacion: observacionItem
    };

    alAgregarAlCarrito(itemFinal);
    setProductoSeleccionado(null);
  };

  const obtenerPrecioDesdeCard = (producto) => {
    if (producto?.precio !== undefined && producto?.precio !== null && Number(producto.precio) > 0) {
      return Number(producto.precio);
    }
    const estiloInicial = detectarEstiloInicial(producto);
    const tamanos = obtenerTamanosConPrecios(producto, estiloInicial);
    return tamanos[0]?.precio || 0;
  };

  const productosFiltrados = productosMenu.filter(producto => {
    const catRaw = producto.categoria || producto.categoria_nombre || '';
    const catProducto = String(catRaw).toLowerCase().replace(/\s+/g, '_');
    const coincideCategoria = categoriaActiva === 'todos' || catProducto === categoriaActiva;

    const nombreProd = producto.nombre || '';
    const descProd = producto.descripcion || '';
    const coincideBusqueda =
      nombreProd.toLowerCase().includes(busqueda.toLowerCase()) ||
      descProd.toLowerCase().includes(busqueda.toLowerCase());

    return coincideCategoria && coincideBusqueda;
  });

  const cantidadTotalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const precioTotalAcumulado = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const formatearPrecio = (valor) => {
    return `$ ${(Number(valor) || 0).toLocaleString('es-CO')}`;
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#07070F] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#2F6BFF] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">Cargando menú de Medusa Granizados...</p>
      </div>
    );
  }

  const estilosDisponibles = productoSeleccionado ? obtenerEstilosDisponibles(productoSeleccionado) : [];
  const tamanosDisponibles = productoSeleccionado ? obtenerTamanosConPrecios(productoSeleccionado, estiloElegido) : [];

  return (
    <div className="min-h-screen bg-[#07070F] text-white flex flex-col justify-between select-none pb-28 font-sans">
       
      {/* HEADER FIJO */}
      <header className="sticky top-0 z-30 bg-[#07070F]/95 backdrop-blur-md border-b border-[#2F6BFF]/20 px-4 sm:px-6 py-4 shadow-[0_4px_20px_rgba(47,107,255,0.15)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={alVolverInicio}
            className="flex items-center gap-2 text-slate-300 hover:text-[#35E0FF] bg-[#0B1220] hover:bg-[#0B1220]/80 px-3 sm:px-4 py-2 rounded-xl border border-[#2F6BFF]/30 transition-all cursor-pointer text-xs sm:text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>

          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-black tracking-wider text-white uppercase drop-shadow-[0_0_10px_rgba(47,107,255,0.5)]">
              MEDUSA <span className="text-[#FF2E9A]">GRANIZADOS</span>
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#2F6BFF]/15 border border-[#2F6BFF]/40 px-3 py-1.5 rounded-xl text-[#35E0FF] text-xs font-bold">
            {modoPedido === 'para_servir' && <><CupSoda className="w-3.5 h-3.5" /><span>Para parchar aquí</span></>}
            {modoPedido === 'para_recoger' && <><ShoppingBag className="w-3.5 h-3.5" /><span>Para llevar a casa</span></>}
          </div>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
         
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase">Menú de Granizados</h2>
            <p className="text-slate-400 text-sm">
              Elige tu granizado, selecciona con o sin licor y el tamaño del vaso
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text"
              placeholder="Buscar sabor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#2F6BFF]/30 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2E9A] transition-colors"
            />
          </div>
        </div>

        {/* Categorías */}
        {categoriasMenu.length > 1 && (
          <div className="flex items-center justify-between gap-2">
            <div ref={scrollContainerRef} className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none w-full scroll-smooth">
              {categoriasMenu.map((cat) => {
                const IconoCat = cat.icono || CupSoda;
                const estaActiva = categoriaActiva === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaActiva(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                      estaActiva 
                        ? 'bg-[#FF2E9A] text-white border-[#FF2E9A] shadow-[0_0_15px_rgba(255,46,154,0.4)]' 
                        : 'bg-[#0B1220] text-slate-300 border-[#2F6BFF]/30 hover:border-[#2F6BFF] hover:text-white'
                    }`}
                  >
                    <IconoCat className={`w-4 h-4 ${estaActiva ? 'text-white' : 'text-[#35E0FF]'}`} />
                    <span>{cat.nombre}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-1 shrink-0 pl-2">
              <button onClick={() => desplazarCategorias('izquierda')} className="p-2.5 bg-[#0B1220] hover:bg-[#2F6BFF]/20 text-slate-300 hover:text-[#35E0FF] rounded-xl border border-[#2F6BFF]/30 transition-all cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => desplazarCategorias('derecha')} className="p-2.5 bg-[#0B1220] hover:bg-[#2F6BFF]/20 text-slate-300 hover:text-[#35E0FF] rounded-xl border border-[#2F6BFF]/30 transition-all cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Cuadrícula de Productos */}
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-[#0B1220]/40 rounded-3xl border border-[#2F6BFF]/20 space-y-2">
            <p className="text-slate-300 text-base font-bold">No hay productos registrados en la base de datos.</p>
            <p className="text-slate-500 text-xs">Crea tus productos desde el panel administrativo o en Supabase para mostrarlos aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((producto) => {
              const categoriaMostrar = producto.categoria || producto.categoria_nombre || 'Granizado';
              const precioMostrar = obtenerPrecioDesdeCard(producto);

              return (
                <div 
                  key={producto.id}
                  className="group relative bg-[#0B1220] border border-[#2F6BFF]/30 hover:border-[#2F6BFF] rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xl overflow-hidden"
                >
                  <div>
                    <div className="w-full h-40 bg-[#07070F] rounded-2xl mb-4 overflow-hidden relative border border-[#2F6BFF]/20">
                      <TarjetaImagen src={producto.imagen} alt={producto.nombre} />
                    </div>

                    <span className="text-[10px] uppercase font-bold text-[#35E0FF] tracking-wider block mb-1">
                      {categoriaMostrar}
                    </span>
                    <h3 className="font-extrabold text-lg text-white group-hover:text-[#35E0FF] transition-colors">
                      {producto.nombre}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-3 leading-relaxed font-medium">
                      {producto.descripcion}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2F6BFF]/20">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Desde</span>
                      <span className="text-lg font-black text-[#35E0FF]">{formatearPrecio(precioMostrar)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirModalProducto(producto)}
                      className="flex items-center gap-1.5 bg-[#2F6BFF] hover:bg-[#FF2E9A] text-white px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all duration-300 cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(47,107,255,0.4)]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Personalizar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* MODAL INTERACTIVO: ESTILO (CON/SIN LICOR/CREMOSO) + TAMAÑO (8, 12, 16 OZ) */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B1220] border-2 border-[#2F6BFF] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-[0_0_30px_rgba(47,107,255,0.4)] my-8">
            
            <div className="flex items-center justify-between border-b border-[#2F6BFF]/20 pb-4">
              <div>
                <span className="text-xs text-[#35E0FF] font-bold uppercase tracking-wider">
                  {productoSeleccionado.categoria || productoSeleccionado.categoria_nombre || 'Granizado'}
                </span>
                <h3 className="text-xl font-black text-white">{productoSeleccionado.nombre}</h3>
              </div>
              <button 
                onClick={() => setProductoSeleccionado(null)}
                className="p-2 bg-[#07070F] text-slate-400 hover:text-white rounded-xl border border-[#2F6BFF]/30 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              
              {/* Toppings / Descripción */}
              {productoSeleccionado.descripcion && (
                <div className="bg-[#07070F] p-3.5 rounded-2xl border border-[#2F6BFF]/20">
                  <span className="text-xs font-bold text-[#FF2E9A] uppercase tracking-wide block mb-1">
                    Incluye:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {productoSeleccionado.descripcion}
                  </p>
                </div>
              )}

              {/* Paso 1: Elegir Con licor / Sin licor / Cremoso */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-2">
                  1. ¿Cómo lo prefieres?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {estilosDisponibles.map((estilo) => {
                    const activo = estiloElegido === estilo.id;
                    const esConLicor = estilo.id === 'con_licor';
                    return (
                      <button
                        key={estilo.id}
                        type="button"
                        onClick={() => cambiarEstilo(estilo.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          activo
                            ? 'bg-[#FF2E9A]/20 border-[#FF2E9A] text-white shadow-[0_0_12px_rgba(255,46,154,0.3)]'
                            : 'bg-[#07070F] border-[#2F6BFF]/20 hover:border-[#2F6BFF]/60 text-slate-300'
                        }`}
                      >
                        <span className="font-extrabold text-xs">{estilo.nombre}</span>
                        {esConLicor ? (
                          <Wine className={`w-4 h-4 ${activo ? 'text-[#FF2E9A]' : 'text-[#35E0FF]'}`} />
                        ) : (
                          <Droplets className={`w-4 h-4 ${activo ? 'text-[#FF2E9A]' : 'text-[#35E0FF]'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paso 2: Elegir tamaño del vaso (8, 12 y 16 onzas) */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-2">
                  2. Selecciona el tamaño del vaso:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {tamanosDisponibles.map((tam) => {
                    const seleccionado = tamanoElegido?.id === tam.id;
                    return (
                      <button
                        key={tam.id}
                        type="button"
                        onClick={() => setTamanoElegido(tam)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                          seleccionado
                            ? 'bg-[#2F6BFF]/25 border-[#2F6BFF] shadow-[0_0_12px_rgba(47,107,255,0.35)]'
                            : 'bg-[#07070F] border-[#2F6BFF]/20 hover:border-[#2F6BFF]/60 text-slate-400'
                        }`}
                      >
                        <span className="font-bold text-xs text-white">{tam.nombre}</span>
                        <span className="text-sm font-black text-[#35E0FF] mt-1">{formatearPrecio(tam.precio)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Observación adicional */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-1">
                  Notas u observaciones especiales:
                </label>
                <input 
                  type="text"
                  placeholder="Ej: Menos hielo, vaso michelado..."
                  value={observacionItem}
                  onChange={(e) => setObservacionItem(e.target.value)}
                  className="w-full bg-[#07070F] border border-[#2F6BFF]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2E9A]"
                />
              </div>

            </div>

            {/* Total e Ingreso al carrito */}
            <div className="border-t border-[#2F6BFF]/20 pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {TARIFAS_ESTILO[estiloElegido]?.nombre} · {tamanoElegido?.nombre}
                </span>
                <span className="text-xl font-black text-[#35E0FF]">{formatearPrecio(tamanoElegido?.precio || 0)}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProductoSeleccionado(null)}
                  className="px-4 py-2.5 bg-[#07070F] hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-[#2F6BFF]/30 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={agregarAlCarritoDesdeModal}
                  className="px-5 py-2.5 bg-[#FF2E9A] hover:bg-[#FF2E9A]/80 text-white font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(255,46,154,0.5)] cursor-pointer active:scale-95"
                >
                  Añadir al Carrito
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER / MARCA DE AGUA */}
      <footer className="text-center text-xs text-slate-500 py-6 mt-auto">
        Sistema Operado por <span className="font-semibold text-slate-300">Vértizze</span> · Medusa Granizados © 2026
      </footer>

      {/* FOOTER FLOTANTE DE CARRITO */}
      {cantidadTotalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-4 bg-[#07070F]/95 backdrop-blur-xl border-t border-[#2F6BFF]/30 shadow-[0_-4px_20px_rgba(47,107,255,0.2)]">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FF2E9A] text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(255,46,154,0.5)]">
                {cantidadTotalItems}
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-bold">Total del pedido</span>
                <span className="text-lg font-black text-[#35E0FF]">{formatearPrecio(precioTotalAcumulado)}</span>
              </div>
            </div>

            <button
              onClick={alIrAlCarrito}
              className="flex items-center gap-2.5 bg-[#2F6BFF] hover:bg-[#2F6BFF]/80 text-white px-6 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(47,107,255,0.5)]"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Ver Carrito / Pagar</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}