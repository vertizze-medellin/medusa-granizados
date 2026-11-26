// ============================================================================
// ARCHIVO: src/sdk/vertizzeApi.js
// DESCRIPCIÓN: SDK de conexión a Supabase optimizado para Medusa Granizados.
// ============================================================================

import { supabase } from './supabaseClient'

// URL limpia sin /rest/v1/
export { supabase }

// Catálogo Oficial de Medusa Granizados con precios y toppings exactos
const MENU_MEDUSA_OFICIAL = [
  { 
    id: 1, 
    nombre: 'Maracumango', 
    descripcion: 'Con licor, perlas explosivas de maracuyá, chileta de mango, gomitas, jeringa y vaso michelado.', 
    precio: 9000, 
    categoria: 'Con Licor',
    imagen: ''
  },
  { 
    id: 2, 
    nombre: 'Nube rosa', 
    descripcion: 'Con licor, perlas explosivas de blueberry, labios rojos, gomitas, jeringa y vaso michelado.', 
    precio: 9000, 
    categoria: 'Con Licor',
    imagen: ''
  },
  { 
    id: 3, 
    nombre: 'Mora azul', 
    descripcion: 'Con licor, perlas ice pink, brocha blue, gomitas, jeringa y vaso michelado con sal y azúcar.', 
    precio: 9000, 
    categoria: 'Con Licor',
    imagen: ''
  },
  { 
    id: 4, 
    nombre: 'Red fantasy', 
    descripcion: 'Con licor, perlas explosivas de chicle, labios rojos, gomitas, jeringa y vaso michelado.', 
    precio: 9000, 
    categoria: 'Con Licor',
    imagen: ''
  },
  { 
    id: 5, 
    nombre: 'Fresa bonbonbum', 
    descripcion: 'Con licor, perlas explosivas de blueberry, labios rojos, gomitas, jeringa y vaso michelado.', 
    precio: 9000, 
    categoria: 'Con Licor',
    imagen: ''
  },
  { 
    id: 6, 
    nombre: 'Candy', 
    descripcion: 'Con licor, perlas explosivas de cereza, labios rojos, gomitas, jeringa y vaso michelado.', 
    precio: 9000, 
    categoria: 'Con Licor',
    imagen: ''
  },
  { 
    id: 7, 
    nombre: 'Piña colada', 
    descripcion: 'Granizado cremoso con Piazza, masmelos y arequipe dentro del vaso.', 
    precio: 10000, 
    categoria: 'Cremosos',
    imagen: ''
  },
  { 
    id: 8, 
    nombre: 'Crema de café', 
    descripcion: 'Granizado cremoso con Piazza, chips de chocolate y chocmelos.', 
    precio: 10000, 
    categoria: 'Cremosos',
    imagen: ''
  },
  { 
    id: 9, 
    nombre: 'Quipitos', 
    descripcion: 'Granizado refrescante sin licor con jellys de fresa y quipitos.', 
    precio: 8000, 
    categoria: 'Sin Licor',
    imagen: ''
  }
];

export async function obtenerMenu() {
  try {
    const { data: productos, error } = await supabase.from('productos').select('*');
    if (error) throw error;
    if (productos && productos.length > 0) return productos;
  } catch (err) {
    console.warn("Usando catálogo local de respaldo:", err.message);
  }
  return MENU_MEDUSA_OFICIAL;
}

export async function crearOrden(orden) {
  try {
    const { data, error } = await supabase.from('ordenes').insert([orden]).select();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Orden simulada localmente:", orden);
    return [{ id: Date.now(), ...orden }];
  }
}

export async function asignarDomiciliarioAlCompletarCocina() { return null; }
export async function obtenerZonasCobertura() { return []; }

export function suscribirseAOrdenes(onNuevaOrden) {
  return supabase.channel('cambios-ordenes').subscribe();
}
