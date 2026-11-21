// ============================================================================
// ARCHIVO: src/vistas/cliente/PantallaExito.jsx
// DESCRIPCIÓN: Pantalla de éxito y confirmación de orden para Medusa Granizados.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Hash, Package, ArrowRight, Sparkles } from 'lucide-react';

export default function PantallaExito({ datosOrden, alVolverInicio }) {
  const numeroOrden = datosOrden?.numero_orden || datosOrden?.numeroOrden || '101';
  const [segundosRestantes, setSegundosRestantes] = useState(15);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          alVolverInicio();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [alVolverInicio]);

  const obtenerTextoItems = () => {
    const rawItems = datosOrden?.productos || datosOrden?.items;

    if (!rawItems) return 'Sin productos especificados';

    if (typeof rawItems === 'string') {
      try {
        const parsed = JSON.parse(rawItems);
        if (Array.isArray(parsed)) {
          return parsed.map((i) => `${i.cantidad || 1}x ${i.nombre || 'Producto'}`).join(', ');
        }
      } catch (e) {
        return rawItems;
      }
      return rawItems;
    }

    if (Array.isArray(rawItems)) {
      return rawItems.map((i) => `${i.cantidad || 1}x ${i.nombre || 'Producto'}`).join(', ');
    }

    return 'Detalles de items no disponibles';
  };

  const textoItemsFormateado = obtenerTextoItems();
  const nombreCliente = datosOrden?.cliente || datosOrden?.cliente_nombre || 'Cliente';
  const tipoServicio = datosOrden?.modo || datosOrden?.tipo_servicio || 'No especificado';
  const metodoPago = datosOrden?.metodopago || datosOrden?.metodo_pago || 'Efectivo';
  const totalPagado = Number(datosOrden?.total || 0);

  return (
    <div className="min-h-screen bg-[#09090d] text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="max-w-lg w-full bg-[#111018] border border-pink-500/20 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative overflow-hidden my-auto">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-pink-600 via-fuchsia-500 to-pink-500" />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-pink-400 bg-pink-500/10 px-3 py-1.5 rounded-full border border-pink-500/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>PEDIDO REGISTRADO</span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-400 text-xs bg-[#09090d] px-3 py-1.5 rounded-full border border-neutral-800">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span>Reinicia en {segundosRestantes}s</span>
          </div>
        </div>

        <div className="space-y-1 text-center">
          <h2 className="text-xl md:text-2xl font-black text-white">
            ¡Gracias, {nombreCliente}!
          </h2>
          <p className="text-neutral-400 text-xs leading-relaxed px-2">
            Tu orden ha sido guardada con éxito en Medusa Granizados.
            <span className="text-pink-400 font-semibold block mt-1">
              "Cada granizado se prepara al momento con el sabor y la frescura de Medusa."
            </span>
          </p>
        </div>

        <div className="bg-pink-500/10 border border-pink-500/30 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-600 text-white rounded-xl flex items-center justify-center shrink-0 font-bold shadow-md shadow-pink-600/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-pink-400 uppercase tracking-wider">Estado de tu orden</h4>
            <p className="text-xs text-neutral-200 mt-0.5 leading-snug">
              Tu pedido quedó registrado y ya pasó a preparación y despacho.
            </p>
          </div>
        </div>

        <div className="bg-[#09090d] border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#15131f] rounded-xl flex items-center justify-center text-pink-400 border border-pink-500/20">
              <Hash className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">
                Número de Orden
              </span>
              <span className="text-xl font-black text-white">#{numeroOrden}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">
              Tiempo Estimado
            </span>
            <span className="text-sm font-bold text-pink-400">~15 min</span>
          </div>
        </div>

        <div className="bg-[#09090d] border border-neutral-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-300 border-b border-neutral-800 pb-2">
            <Package className="w-4 h-4 text-pink-500" />
            <span>Resumen del Ticket</span>
          </div>

          <div className="py-1">
            <p className="text-xs text-pink-300 font-medium leading-relaxed">
              {textoItemsFormateado}
            </p>
          </div>

          <div className="border-t border-neutral-800 pt-2 space-y-1 text-xs text-neutral-400">
            <div className="flex justify-between">
              <span>Tipo de servicio:</span>
              <span className="text-white font-semibold capitalize">{tipoServicio}</span>
            </div>
            <div className="flex justify-between">
              <span>Método de pago:</span>
              <span className="text-white font-semibold capitalize">{metodoPago}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-800/60 text-sm font-black">
              <span className="text-white">Total Pagado:</span>
              <span className="text-pink-400">$ {totalPagado.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        <button
          onClick={alVolverInicio}
          className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-500 text-white py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-pink-600/25 cursor-pointer active:scale-95 touch-manipulation"
        >
          <span>Hacer Nuevo Pedido Ahora</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <footer className="text-center text-xs text-neutral-500 py-4 mt-auto">
        Sistema Operado por <span className="font-semibold text-neutral-400">Vértizze</span> © 2026
      </footer>
    </div>
  );
}
