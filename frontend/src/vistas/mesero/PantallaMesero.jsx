import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, Clock3, MapPin, RefreshCw, Store, UtensilsCrossed } from 'lucide-react';
import { supabase } from '../../sdk/supabaseClient';

const normalizar = (valor) => String(valor || '').toLowerCase().trim();

function tiempoDesde(fecha, ahora) {
  if (!fecha) return 'Tiempo no disponible';
  const segundos = Math.max(0, Math.floor((ahora - new Date(fecha).getTime()) / 1000));
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return minutos > 0 ? `${minutos} min ${resto} s` : `${resto} s`;
}

function leerItems(items) {
  if (Array.isArray(items)) return items;
  if (typeof items === 'string') {
    try { return JSON.parse(items); } catch { return [{ nombre: items, cantidad: 1 }]; }
  }
  return [];
}

export default function PantallaMesero() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizadoHace, setActualizadoHace] = useState(Date.now());
  const [procesando, setProcesando] = useState(null);
  const [error, setError] = useState('');

  const cargarOrdenes = async () => {
    setError('');
    try {
      const { data, error: consultaError } = await supabase
        .from('ordenes')
        .select('*')
        .ilike('estado', 'listo')
        .order('tiempo_fin', { ascending: true });
      if (consultaError) throw consultaError;
      setOrdenes(data || []);
      setActualizadoHace(Date.now());
    } catch (consultaError) {
      setError(`No se pudieron cargar las órdenes listas: ${consultaError.message}`);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarOrdenes();
    const timer = setInterval(() => setActualizadoHace(Date.now()), 1000);
    const canal = supabase
      .channel(`ordenes-mesero-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes' }, cargarOrdenes)
      .subscribe();
    return () => {
      clearInterval(timer);
      supabase.removeChannel(canal);
    };
  }, []);

  const entregarOrden = async (orden) => {
    setProcesando(orden.id);
    setError('');
    try {
      const { error: actualizacionError } = await supabase
        .from('ordenes')
        .update({ estado: 'entregado', tiempo_entrega: new Date().toISOString() })
        .eq('id', orden.id);
      if (actualizacionError) throw actualizacionError;
      setOrdenes((actuales) => actuales.filter((actual) => actual.id !== orden.id));
    } catch (actualizacionError) {
      setError(`No se pudo entregar la orden: ${actualizacionError.message}`);
    } finally {
      setProcesando(null);
    }
  };

  const total = useMemo(() => ordenes.length, [ordenes]);

  return (
    <main className="min-h-screen bg-[#07070F] text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2F6BFF]/30 pb-5">
          <div>
            <div className="flex items-center gap-2 text-[#35E0FF] text-xs font-bold uppercase tracking-wider"><Store className="w-4 h-4" /> Medusa Granizados</div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">Pedidos listos para entregar</h1>
            <p className="text-sm text-slate-400 mt-1">Llama al cliente por su nombre, confirma la mesa y entrega la orden.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-[#FF2E9A]/15 border border-[#FF2E9A]/30 text-[#FF2E9A] px-3 py-2 rounded-xl text-xs font-black">{total} {total === 1 ? 'pedido' : 'pedidos'} listos</span>
            <button onClick={cargarOrdenes} className="p-2.5 bg-[#0B1220] border border-[#2F6BFF]/30 rounded-xl text-[#35E0FF] hover:border-[#FF2E9A] cursor-pointer" title="Actualizar"><RefreshCw className="w-4 h-4" /></button>
          </div>
        </header>

        {error && <div className="bg-red-950/60 border border-red-500/40 text-red-200 rounded-xl px-4 py-3 text-sm">{error}</div>}

        {cargando ? <div className="py-20 text-center text-slate-400">Cargando pedidos listos...</div> : ordenes.length === 0 ? (
          <div className="py-24 text-center bg-[#0B1220]/60 border border-[#2F6BFF]/20 rounded-3xl"><CheckCircle2 className="w-12 h-12 mx-auto text-[#35E0FF] mb-3" /><p className="font-bold text-slate-300">No hay pedidos listos por entregar</p><p className="text-xs text-slate-500 mt-1">Cuando cocina marque una orden como lista, aparecerá aquí.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {ordenes.map((orden) => {
              const items = leerItems(orden.items);
              const mesa = orden.mesa || orden.numero_mesa || orden.mesa_id;
              const observaciones = orden.observaciones || orden.observacion || '';
              return <article key={orden.id} className="bg-[#0B1220] border-2 border-[#FF2E9A]/60 rounded-3xl p-5 shadow-[0_0_25px_rgba(255,46,154,0.12)] relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[#FF2E9A]" />
                <div className="flex items-start justify-between gap-3 pt-1"><div><span className="text-xs text-[#35E0FF] font-black">ORDEN #{orden.numero_orden || orden.id}</span><h2 className="text-xl font-black mt-1">{orden.cliente_nombre || orden.nombre_cliente || 'Cliente sin nombre'}</h2></div><span className="flex items-center gap-1 text-[#FF2E9A] text-xs font-bold"><Clock3 className="w-4 h-4" />{tiempoDesde(orden.tiempo_fin || orden.updated_at, actualizadoHace)}</span></div>
                <div className="flex flex-wrap gap-2 mt-4">{mesa ? <span className="bg-[#2F6BFF]/20 border border-[#2F6BFF]/40 text-[#35E0FF] rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-1"><UtensilsCrossed className="w-3.5 h-3.5" /> Mesa {mesa}</span> : <span className="bg-slate-700/50 text-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold">Para llevar</span>}{orden.tipo_servicio && <span className="text-xs text-slate-400 py-1">{orden.tipo_servicio}</span>}</div>
                <div className="mt-4 bg-[#07070F] border border-[#2F6BFF]/20 rounded-2xl p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Productos</p>{items.length ? <ul className="space-y-1.5">{items.map((item, index) => <li key={`${orden.id}-${index}`} className="text-sm font-bold flex justify-between gap-2"><span>{item.cantidad || 1}x {item.nombre || item.titulo || item.producto || 'Producto'}</span>{item.observacion && <span className="text-xs text-[#FF2E9A] font-normal italic">{item.observacion}</span>}</li>)}</ul> : <p className="text-sm text-slate-400">Sin detalle de productos</p>}</div>
                {observaciones && <div className="mt-3 flex gap-2 text-xs text-slate-300"><Bell className="w-4 h-4 text-[#FF2E9A] shrink-0" /><span><strong>Observaciones:</strong> {observaciones}</span></div>}
                {orden.direccion && <div className="mt-2 flex gap-2 text-xs text-slate-400"><MapPin className="w-4 h-4 text-[#35E0FF] shrink-0" />{orden.direccion}</div>}
                <button onClick={() => entregarOrden(orden)} disabled={procesando === orden.id} className="mt-5 w-full bg-[#FF2E9A] hover:bg-[#ff58b3] disabled:opacity-50 text-white rounded-xl py-3 font-black text-sm cursor-pointer flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" />{procesando === orden.id ? 'Guardando...' : 'Marcar como entregado'}</button>
              </article>;
            })}
          </div>
        )}
        <p className="text-center text-[11px] text-slate-600">Actualización en tiempo real activa · Última consulta: {new Date(actualizadoHace).toLocaleTimeString()}</p>
      </div>
    </main>
  );
}
