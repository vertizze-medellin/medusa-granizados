import React, { useState } from 'react';
import { AlertCircle, ArrowRight, ChefHat, ShieldCheck, UserRound } from 'lucide-react';
import { supabase } from '../../sdk/supabaseClient';

/** Acceso separado para administración y cocina. */
export default function Login({ alIniciarSesion }) {
  const [modo, setModo] = useState('seleccion');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const volver = () => {
    setModo('seleccion');
    setUsuario('');
    setPassword('');
    setError('');
  };

  const iniciarSesion = async (event, modulo) => {
    event.preventDefault();
    setCargando(true);
    setError('');
    try {
      let data = null;
      const consultaCorreo = await supabase.from('usuarios').select('*').eq('correo', usuario.trim().toLowerCase()).maybeSingle();
      if (!consultaCorreo.error && consultaCorreo.data) data = consultaCorreo.data;
      if (!data) {
        const consultaUsuario = await supabase.from('usuarios').select('*').eq('usuario', usuario.trim()).maybeSingle();
        if (!consultaUsuario.error && consultaUsuario.data) data = consultaUsuario.data;
      }
      if (data && (String(data.clave_acceso ?? data.password ?? data.clave ?? '') !== password.trim() || data.activo === false)) data = null;
      if (!data) {
        const legado = await supabase.from('usuarios_admin').select('*').eq('usuario', usuario.trim()).eq('password', password.trim()).maybeSingle();
        data = legado.data;
      }
      if (!data) throw new Error('Usuario o contraseña incorrectos, o el usuario está inactivo.');
      const rol = String(data.rol || 'administrador').toLowerCase().trim();
      if (modulo === 'cocina' && !['cocina', 'administrador'].includes(rol)) {
        throw new Error('Este usuario no tiene permisos para acceder a cocina.');
      }
      if (modulo === 'mesero' && !['mesero', 'administrador'].includes(rol)) {
        throw new Error('Este usuario no tiene permisos para acceder a meseros.');
      }
      const rolFinal = modulo !== 'admin' && rol === 'administrador' ? modulo : rol;
      sessionStorage.setItem('vertizze_sesion', JSON.stringify({ ...data, rol: rolFinal }));
      sessionStorage.setItem('rol_vertizze', rolFinal);
      alIniciarSesion(rolFinal);
    } catch (loginError) {
      setError(loginError.message || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  const formulario = modo === 'admin' || modo === 'cocina' || modo === 'mesero';
  const esCocina = modo === 'cocina';
  const esMesero = modo === 'mesero';
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="text-center space-y-2 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-[#2F6BFF]/15 text-[#35E0FF] border border-[#2F6BFF]/40">
            {esCocina ? <ChefHat className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-black">Medusa Granizados</h1>
          <p className="text-xs text-neutral-400">Selecciona el módulo al que deseas ingresar</p>
        </div>
        {!formulario ? (
          <div className="space-y-4">
            <button onClick={() => setModo('admin')} className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 p-4 rounded-2xl flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-[#35E0FF]" /><span className="text-left"><strong className="block">Administrador</strong><small className="text-neutral-400">Órdenes, productos, clientes y pagos</small></span></span><ArrowRight className="w-5 h-5 text-[#FF2E9A]" />
            </button>
            <button onClick={() => setModo('cocina')} className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 p-4 rounded-2xl flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-3"><ChefHat className="w-5 h-5 text-[#35E0FF]" /><span className="text-left"><strong className="block">Cocina (KDS)</strong><small className="text-neutral-400">Cola de pedidos en tiempo real</small></span></span><ArrowRight className="w-5 h-5 text-[#FF2E9A]" />
            </button>
            <button onClick={() => setModo('mesero')} className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 p-4 rounded-2xl flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-3"><UserRound className="w-5 h-5 text-[#35E0FF]" /><span className="text-left"><strong className="block">Meseros</strong><small className="text-neutral-400">Pedidos listos para entregar</small></span></span><ArrowRight className="w-5 h-5 text-[#FF2E9A]" />
            </button>
          </div>
        ) : (
          <form onSubmit={(event) => iniciarSesion(event, modo)} className="space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-sm font-bold uppercase tracking-wider text-[#35E0FF]">{esCocina ? 'Acceso a cocina (KDS)' : esMesero ? 'Acceso de meseros' : 'Acceso administrador'}</h2><button type="button" onClick={volver} className="text-xs text-neutral-400 underline cursor-pointer">Volver</button></div>
            {error && <div className="bg-red-950/80 border border-red-500/40 text-red-200 p-3 rounded-xl text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
            <label className="block text-xs font-bold text-neutral-300">Usuario<input required value={usuario} onChange={(event) => setUsuario(event.target.value)} className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white" /></label>
            <label className="block text-xs font-bold text-neutral-300">Contraseña / PIN<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white" /></label>
            <button type="submit" disabled={cargando} className="w-full font-black py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer bg-[#FF2E9A] hover:bg-[#FF2E9A]/80 text-white shadow-[0_0_15px_rgba(255,46,154,0.35)]">{cargando ? 'Verificando...' : 'Ingresar'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

