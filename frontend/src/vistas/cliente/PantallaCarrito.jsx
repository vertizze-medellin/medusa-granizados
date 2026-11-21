// ============================================================================
// ARCHIVO: src/vistas/cliente/PantallaCarrito.jsx
// DESCRIPCIÓN: Pantalla del carrito adaptada a la identidad visual de Medusa Granizados.
// ============================================================================

import React from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  CupSoda
} from 'lucide-react';

export default function PantallaCarrito({ 
  carrito, 
  modoPedido, 
  alVolverAlMenu, 
  alActualizarCantidad, 
  alActualizarObservacion,
  alEliminarItem, 
  alIrAlCheckout 
}) {

  const formatearPrecio = (valor) => {
    return `$ ${(valor || 0).toLocaleString('es-CO')}`;
  };

  const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  // Función para obtener texto e icono según el modo de pedido seleccionado
  const obtenerInfoServicio = () => {
    switch (modoPedido) {
      case 'para_servir':
        return { texto: 'Para parchar aquí', Icono: CupSoda };
      case 'para_recoger':
        return { texto: 'Para llevar a casa', Icono: ShoppingBag };
      default:
        return { texto: 'Para parchar aquí', Icono: CupSoda };
    }
  };

  const { texto: textoServicio, Icono: IconoServicio } = obtenerInfoServicio();

  return (
    <div className="min-h-screen bg-[#07070F] text-white flex flex-col justify-between select-none pb-12 font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[#07070F]/95 backdrop-blur-md border-b border-[#2F6BFF]/20 px-4 sm:px-6 py-4 shadow-[0_4px_20px_rgba(47,107,255,0.15)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          <button 
            onClick={alVolverAlMenu}
            className="flex items-center gap-2 text-slate-300 hover:text-[#35E0FF] bg-[#0B1220] hover:bg-[#0B1220]/80 px-3 sm:px-4 py-2 rounded-xl border border-[#2F6BFF]/30 transition-all cursor-pointer text-xs sm:text-sm font-bold touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Seguir Comprando</span>
          </button>

          <div className="text-center">
            <h1 className="text-base sm:text-lg font-black tracking-wider text-white uppercase drop-shadow-[0_0_10px_rgba(47,107,255,0.5)]">
              TU <span className="text-[#FF2E9A]">CARRITO</span>
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#2F6BFF]/15 border border-[#2F6BFF]/40 px-3 py-1.5 rounded-xl text-[#35E0FF] text-xs font-bold">
            <IconoServicio className="w-3.5 h-3.5" />
            <span>{textoServicio}</span>
          </div>

        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        
        {carrito.length === 0 ? (
          <div className="text-center py-24 bg-[#0B1220]/40 rounded-3xl border border-[#2F6BFF]/20 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 bg-[#0B1220] rounded-full flex items-center justify-center border border-[#2F6BFF]/30 text-[#35E0FF]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Tu carrito está vacío</h3>
              <p className="text-slate-400 text-sm mt-1">Aún no has agregado ningún granizado.</p>
            </div>
            <button
              onClick={alVolverAlMenu}
              className="mt-4 bg-[#FF2E9A] hover:bg-[#FF2E9A]/80 text-white px-6 py-3 rounded-2xl font-extrabold text-sm transition-all cursor-pointer shadow-[0_0_15px_rgba(255,46,154,0.5)] touch-manipulation"
            >
              Ver el Menú
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Listado de Ítems */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg sm:text-xl font-black tracking-tight uppercase mb-4">
                Vasos seleccionados ({totalItems})
              </h2>

              {carrito.map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#0B1220] border border-[#2F6BFF]/30 rounded-2xl p-4 flex flex-col gap-3 shadow-xl"
                >
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="w-14 h-14 bg-[#07070F] rounded-xl overflow-hidden border border-[#2F6BFF]/20 shrink-0">
                      {item.imagen ? (
                        <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#35E0FF]">
                          <CupSoda className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-white truncate">{item.nombre}</h4>
                      {item.tamano_nombre && (
                        <span className="text-xs text-[#35E0FF] font-bold block">Tamaño: {item.tamano_nombre}</span>
                      )}
                      <span className="text-xs text-slate-400 block mt-0.5 font-medium">{formatearPrecio(item.precio)} c/u</span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 bg-[#07070F] border border-[#2F6BFF]/30 rounded-xl p-1">
                      <button 
                        onClick={() => alActualizarCantidad(item.id, item.cantidad - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-[#0B1220] hover:bg-[#2F6BFF]/20 text-slate-300 rounded-lg transition-colors cursor-pointer touch-manipulation"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-black text-white">{item.cantidad}</span>
                      <button 
                        onClick={() => alActualizarCantidad(item.id, item.cantidad + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-[#0B1220] hover:bg-[#2F6BFF]/20 text-[#35E0FF] rounded-lg transition-colors cursor-pointer touch-manipulation"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-[#35E0FF] block">
                        {formatearPrecio(item.precio * item.cantidad)}
                      </span>
                      <button 
                        onClick={() => alEliminarItem(item.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors mt-1 inline-block cursor-pointer touch-manipulation"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Input de observaciones opcionales */}
                  <div className="pt-2 border-t border-[#2F6BFF]/20">
                    <input 
                      type="text"
                      placeholder="¿Alguna observación? (Ej: menos hielo...)"
                      value={item.observacion || ''}
                      onChange={(e) => alActualizarObservacion(item.id, e.target.value)}
                      className="w-full bg-[#07070F] border border-[#2F6BFF]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2E9A] transition-colors"
                    />
                  </div>

                </div>
              ))}
            </div>

            {/* Resumen de Totales */}
            <div className="bg-[#0B1220] border border-[#2F6BFF]/30 rounded-3xl p-6 h-fit space-y-6 shadow-xl">
              <h3 className="text-lg font-black uppercase tracking-wide border-b border-[#2F6BFF]/20 pb-4">
                Resumen de la Orden
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">{formatearPrecio(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Modalidad</span>
                  <span className="text-[#35E0FF] font-bold">{textoServicio}</span>
                </div>
                <div className="border-t border-[#2F6BFF]/20 pt-3 flex justify-between text-base font-black">
                  <span className="text-white">Total a Pagar</span>
                  <span className="text-[#35E0FF] text-xl">{formatearPrecio(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={alIrAlCheckout}
                className="w-full flex items-center justify-center gap-2 bg-[#2F6BFF] hover:bg-[#2F6BFF]/80 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-[0_0_20px_rgba(47,107,255,0.5)] cursor-pointer active:scale-95 touch-manipulation"
              >
                <span>Proceder al Pago</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER / MARCA DE AGUA */}
      <footer className="text-center text-xs text-slate-500 py-4 mt-auto">
        Sistema Operado por <span className="font-semibold text-slate-300">Vértizze</span> · Medusa Granizados © 2026
      </footer>

    </div>
  );
}