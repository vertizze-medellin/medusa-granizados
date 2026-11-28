// ============================================================================
// ARCHIVO: src/vistas/cliente/PantallaInicio.jsx
// DESCRIPCIÓN: Pantalla principal con identidad visual Medusa Granizados.
// ============================================================================

import React from 'react';
import { CupSoda, ShoppingBag, Zap } from 'lucide-react';
import logoMedusa from '../../../Logo medusa.jpeg';

export default function PantallaInicio({ alSeleccionarModo }) {
  return (
    <div className="h-screen w-screen bg-[#07070F] text-white flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none font-sans">
      
      {/* Encabezado */}
      <header className="text-center shrink-0 pt-2">
        <h2 className="text-[#35E0FF] font-bold tracking-[0.2em] text-xs sm:text-sm uppercase">
          ¡Bienvenidos!
        </h2>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-wider mt-1 uppercase text-white">
          MEDUSA <span className="text-[#FF2E9A]">GRANIZADOS</span>
        </h1>
      </header>

      {/* Contenido Principal */}
      <main className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 w-full max-w-4xl mx-auto my-auto px-2">
        
        {/* Logo / Espacio visual */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-[#0B1220] border-2 border-[#2F6BFF] flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(47,107,255,0.3)] shrink-0">
          <img src={logoMedusa} alt="Logo Medusa Granizados" className="w-full h-full object-contain p-2" />
        </div>

        <div className="space-y-2 max-w-lg px-2">
          <span className="inline-flex items-center gap-1.5 bg-[#FF2E9A]/15 text-[#FF2E9A] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#FF2E9A]/30 shadow-[0_0_10px_rgba(255,46,154,0.2)]">
            <Zap className="w-3.5 h-3.5" /> Sabor intenso y fresco
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase">
            Armemos tu granizado para que lo disfrutes al instante
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            Elige cómo quieres vivir la experiencia hoy.
          </p>
        </div>

        {/* 2 Opciones de Servicio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl pt-2">
          
          {/* Para parchar aquí */}
          <button 
            onClick={() => alSeleccionarModo('para_servir')}
            className="group relative flex flex-col items-center justify-center p-5 sm:p-6 bg-[#0B1220] border-2 border-[#2F6BFF] rounded-3xl hover:border-[#FF2E9A] hover:shadow-[0_0_20px_rgba(255,46,154,0.4)] transition-all duration-300 active:scale-95 cursor-pointer touch-manipulation"
          >
            <div className="p-3.5 bg-[#07070F] rounded-2xl mb-3 text-[#2F6BFF] group-hover:text-[#FF2E9A] group-hover:scale-110 transition-all duration-300 shadow-md border border-[#2F6BFF]/30">
              <CupSoda className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} />
            </div>
            <span className="font-extrabold text-base sm:text-lg text-white tracking-wide">PARA PARCHAR AQUÍ</span>
            <span className="text-xs text-slate-400 mt-1 font-medium">Disfruta en el establecimiento</span>
          </button>

          {/* Para llevar a casa */}
          <button 
            onClick={() => alSeleccionarModo('para_recoger')}
            className="group relative flex flex-col items-center justify-center p-5 sm:p-6 bg-[#0B1220] border-2 border-[#2F6BFF] rounded-3xl hover:border-[#FF2E9A] hover:shadow-[0_0_20px_rgba(255,46,154,0.4)] transition-all duration-300 active:scale-95 cursor-pointer touch-manipulation"
          >
            <div className="p-3.5 bg-[#07070F] rounded-2xl mb-3 text-[#2F6BFF] group-hover:text-[#FF2E9A] group-hover:scale-110 transition-all duration-300 shadow-md border border-[#2F6BFF]/30">
              <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} />
            </div>
            <span className="font-extrabold text-base sm:text-lg text-white tracking-wide">PARA LLEVAR A CASA</span>
            <span className="text-xs text-slate-400 mt-1 font-medium">Pide y retira en caja</span>
          </button>

        </div>

      </main>

      {/* Pie de página */}
      <footer className="text-center text-[11px] sm:text-xs text-slate-500 shrink-0 py-2">
        Sistema Operado por <span className="font-semibold text-slate-300">Vértizze</span> · Medusa Granizados © 2026
      </footer>

    </div>
  );
}
