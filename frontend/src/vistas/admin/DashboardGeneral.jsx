// ============================================================================
// ARCHIVO: src/vistas/admin/DashboardGeneral.jsx
// DESCRIPCIÓN: Panel con Control de pagos, Clientes, Órdenes, Productos y Usuarios.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Menu, X, ClipboardList, Utensils, LogOut, Store, ExternalLink,
  Plus, Calendar, Edit3, Trash2, Image as ImageIcon, CheckCircle, Printer, CreditCard, Search, Users, Phone, MapPin, ChevronLeft, ChevronRight, Key, ShieldCheck, Lock
} from 'lucide-react';
import { supabase } from '../../sdk/vertizzeApi';

export default function DashboardGeneral({ rolInicial = 'administrador', onCerrarSesion }) {
  const sesionGuardada = JSON.parse(sessionStorage.getItem('vertizze_sesion') || 'null');
  const rolEfectivo = (sesionGuardada?.rol || rolInicial || 'administrador').toLowerCase();

  const [menuColapsado, setMenuColapsado] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [rolUsuario, setRolUsuario] = useState(rolEfectivo);
  const [vistaActual, setVistaActual] = useState('ordenes');

  const [cargandoInicial, setCargandoInicial] = useState(true);

  // Estados de Órdenes
  const [ordenes, setOrdenes] = useState([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(true);
  const [busquedaOrden, setBusquedaOrden] = useState('');
  const [filtroEstadoOrden, setFiltroEstadoOrden] = useState('todos');
  const [filtroFechaInicioOrden, setFiltroFechaInicioOrden] = useState('');
  const [filtroFechaFinOrden, setFiltroFechaFinOrden] = useState('');
  const [paginaActualOrdenes, setPaginaActualOrdenes] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [modalOrdenAbierto, setModalOrdenAbierto] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [itemsEditables, setItemsEditables] = useState([]);
  const [busquedaProductoModal, setBusquedaProductoModal] = useState('');
  const [observacionesEditables, setObservacionesEditables] = useState('');

  // Estados de Clientes
  const [clientes, setClientes] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);
  const [modoEdicionCliente, setModoEdicionCliente] = useState(false);
  const [paginaActualClientes, setPaginaActualClientes] = useState(1);
  const [registrosPorPaginaClientes, setRegistrosPorPaginaClientes] = useState(10);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [clienteSeleccionadoHistorial, setClienteSeleccionadoHistorial] = useState(null);
  const [formTelefonoCliente, setFormTelefonoCliente] = useState('');
  const [formNombreCliente, setFormNombreCliente] = useState('');
  const [formDireccionCliente, setFormDireccionCliente] = useState('');
  const [formObsCliente, setFormObsCliente] = useState('');

  // Estados de Productos (Menú)
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargandoMenu, setCargandoMenu] = useState(true);
  const [busquedaMenu, setBusquedaMenu] = useState('');
  const [modalMenuAbierto, setModalMenuAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoActualId, setProductoActualId] = useState(null);
  const [formNombre, setFormNombre] = useState('');
  const [formCategoriaId, setFormCategoriaId] = useState('1');
  const [formPrecio, setFormPrecio] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formImagen, setFormImagen] = useState('');
  const [formImagenArchivo, setFormImagenArchivo] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // Estados de Usuarios (Control de Acceso)
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [filtroRolUsuario, setFiltroRolUsuario] = useState('todos');
  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);
  const [modoEdicionUsuario, setModoEdicionUsuario] = useState(false);
  const [usuarioActualId, setUsuarioActualId] = useState(null);
  const [formNombreUsuario, setFormNombreUsuario] = useState('');
  const [formCorreoUsuario, setFormCorreoUsuario] = useState('');
  const [formTelefonoUsuario, setFormTelefonoUsuario] = useState('');
  const [formRolUsuario, setFormRolUsuario] = useState('cajero');
  const [formActivoUsuario, setFormActivoUsuario] = useState(true);
  const [formClaveUsuario, setFormClaveUsuario] = useState('');

  // Estados de Cobertura y Zonas
  const [coberturaZonas, setCoberturaZonas] = useState([]);

  // Estado para ticket de impresión
  const [ordenImprimiendo, setOrdenImprimiendo] = useState(null);

  const obtenerItemsMenu = () => {
    return [
      { id: 'pagos', label: 'Control de pagos', icon: CreditCard },
      { id: 'clientes', label: 'Gestión de clientes', icon: Users },
      { id: 'ordenes', label: 'Gestión de órdenes', icon: ClipboardList },
      { id: 'productos', label: 'Productos', icon: Utensils },
      { id: 'usuarios', label: 'Usuarios y acceso', icon: ShieldCheck },
      { id: 'meseros', label: 'Meseros (CRUD)', icon: Users }
    ];
  };

  const capitalizarTexto = (texto) => {
    if (!texto) return '';
    const str = String(texto).trim();
    if (str === '') return '';
    return str.split(' ').map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()).join(' ');
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) return '';
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return '';
    return valor.toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const limpiarTelefono = (tel) => {
    if (!tel) return 'N/A';
    let limpio = String(tel).trim();
    if (limpio.startsWith('+57')) {
      limpio = limpio.replace('+57', '');
    } else if (limpio.startsWith('57') && limpio.length > 10) {
      limpio = limpio.replace('57', '');
    }
    limpio = limpio.replace(/\D/g, ''); 
    return limpio.trim() !== '' ? limpio : 'N/A';
  };

  const formatearDireccion = (dir) => {
    if (dir === null || dir === undefined) return 'N/A';
    const dStr = String(dir).trim();
    const dLower = dStr.toLowerCase();
    
    if (dLower === '' || dLower === 'no especificada' || dLower.includes('mesa') || /^\d+$/.test(dStr)) {
      return 'N/A';
    }
    return capitalizarTexto(dStr);
  };

  const formatearItems = (itemsRaw) => {
    if (!itemsRaw) return 'Sin detalle';
    let items = itemsRaw;
    if (typeof itemsRaw === 'string') {
      try {
        items = JSON.parse(itemsRaw);
      } catch (e) {
        return capitalizarTexto(itemsRaw);
      }
    }
    if (Array.isArray(items)) {
      return items.map(item => {
        const cantidad = item.cantidad || item.stock || 1;
        const nombre = item.nombre || item.producto || item.descripcion || '';
        const nombreCapitalizado = capitalizarTexto(nombre) || 'Artículo';
        const precioItem = item.precio ? ` ($ ${Number(item.precio).toLocaleString()})` : '';
        let texto = `â€¢ ${cantidad}x ${nombreCapitalizado}${precioItem}`;
        if (item.observacion) {
          texto += `\n  â”” Nota: ${item.observacion}`;
        }
        return texto;
      }).join('\n');
    }
    return String(itemsRaw);
  };

  const sincronizarClientesDesdeOrdenes = async (listaOrdenes) => {
    try {
      for (const ord of listaOrdenes) {
        const telOrd = limpiarTelefono(ord.cliente_telefono || ord.telefono);
        const nomOrd = ord.cliente_nombre || ord.nombre_cliente;

        if (telOrd && telOrd !== 'N/A' && nomOrd && nomOrd.toLowerCase() !== 'cliente general') {
          const { data: existeCli } = await supabase
            .from('clientes')
            .select('telefono')
            .eq('telefono', telOrd)
            .maybeSingle();

          const dirFormateada = formatearDireccion(ord.ubicacion_detalle || ord.direccion || ord.cliente_direccion);

          if (!existeCli) {
            await supabase.from('clientes').insert([{
              telefono: telOrd,
              nombre: capitalizarTexto(nomOrd),
              direccion: dirFormateada,
              observaciones: ord.observaciones || 'Registrado automáticamente desde Órdenes'
            }]);
          } else {
            await supabase.from('clientes')
              .update({ direccion: dirFormateada })
              .eq('telefono', telOrd);
          }
        }
      }
    } catch (err) {
      console.error("Error sincronizando clientes:", err.message);
    }
  };

  useEffect(() => {
    setRolUsuario(rolEfectivo);
  }, [rolEfectivo]);

  useEffect(() => {
    const sesion = sessionStorage.getItem('vertizze_sesion');
    if (!sesion && !rolInicial) {
      if (typeof onCerrarSesion === 'function') {
        onCerrarSesion();
      } else {
        window.location.href = '/login';
      }
      return;
    }

    cargarDatosBD();

    const timerSeguridad = setTimeout(() => {
      setCargandoInicial(false);
      setCargandoOrdenes(false);
      setCargandoClientes(false);
      setCargandoMenu(false);
      setCargandoUsuarios(false);
    }, 5000);
    const respaldoActualizacion = setInterval(cargarDatosBD, 10000);

    const canalRealtime = supabase
      .channel('cambios-vertizze-db')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ordenes' },
        async (payload) => {
          if (payload.eventType === 'UPDATE') {
            setOrdenes(prevOrdenes => 
              prevOrdenes.map(ord => ord.id === payload.new.id ? { ...ord, ...payload.new } : ord)
            );
          } else if (payload.eventType === 'INSERT') {
            setOrdenes(prevOrdenes => [payload.new, ...prevOrdenes]);
            await sincronizarClientesDesdeOrdenes([payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setOrdenes(prevOrdenes => prevOrdenes.filter(ord => ord.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'productos' },
        () => { cargarDatosBD(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clientes' },
        () => { cargarDatosBD(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'usuarios' },
        () => { cargarDatosBD(); }
      )
      .subscribe();

    return () => {
      clearTimeout(timerSeguridad);
      clearInterval(respaldoActualizacion);
      supabase.removeChannel(canalRealtime);
    };
  }, []);

  const cargarDatosBD = async () => {
    try {
      const [resProductos, resCategorias, resOrdenes, resClientes, resZonas, resUsuarios] = await Promise.all([
        supabase.from('productos').select('*').order('id', { ascending: true }),
        supabase.from('categorias').select('*').order('id', { ascending: true }),
        supabase.from('ordenes').select('*').order('id', { ascending: false }),
        supabase.from('clientes').select('*').order('creado_en', { ascending: false }),
        supabase.from('cobertura_zonas').select('*').order('id', { ascending: true }),
        supabase.from('usuarios').select('*').order('id', { ascending: true })
      ]);

      setProductos(resProductos.data || []);
      setCategorias(resCategorias.data || []);
      setOrdenes(resOrdenes.data || []);
      // Repara clientes que pudieron quedar pendientes si Realtime estaba desactivado.
      if (resOrdenes.data?.length) await sincronizarClientesDesdeOrdenes(resOrdenes.data);
      setClientes(resClientes.data || []);
      setCoberturaZonas(resZonas.data || []);
      if (!resUsuarios.error) {
        setUsuarios(resUsuarios.data || []);
      }

      if (resCategorias.data && resCategorias.data.length > 0) {
        setFormCategoriaId(String(resCategorias.data[0].id));
      }
    } catch (error) {
      console.error("Error general al cargar datos de la BD:", error.message);
    } finally {
      setCargandoMenu(false);
      setCargandoOrdenes(false);
      setCargandoClientes(false);
      setCargandoUsuarios(false);
      setCargandoInicial(false);
    }
  };

  // --- FUNCIONES MÓDULO USUARIOS (CONTROL DE ACCESO) ---
  const abrirModalCrearUsuario = () => {
    setModoEdicionUsuario(false);
    setUsuarioActualId(null);
    setFormNombreUsuario('');
    setFormCorreoUsuario('');
    setFormTelefonoUsuario('');
    setFormRolUsuario('cajero');
    setFormActivoUsuario(true);
    setFormClaveUsuario('');
    setModalUsuarioAbierto(true);
  };

  const abrirModalEditarUsuario = (usr) => {
    setModoEdicionUsuario(true);
    setUsuarioActualId(usr.id);
    setFormNombreUsuario(usr.nombre || '');
    setFormCorreoUsuario(usr.correo || usr.email || '');
    setFormTelefonoUsuario(limpiarTelefono(usr.telefono) === 'N/A' ? '' : limpiarTelefono(usr.telefono));
    setFormRolUsuario((usr.rol || 'cajero').toLowerCase());
    setFormActivoUsuario(usr.activo !== false);
    setFormClaveUsuario('');
    setModalUsuarioAbierto(true);
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    if (!formNombreUsuario.trim() || !formCorreoUsuario.trim()) {
      alert('El nombre y el correo son obligatorios.');
      return;
    }

    const payload = {
      nombre: capitalizarTexto(formNombreUsuario),
      correo: formCorreoUsuario.trim().toLowerCase(),
      telefono: limpiarTelefono(formTelefonoUsuario) === 'N/A' ? null : limpiarTelefono(formTelefonoUsuario),
      rol: formRolUsuario,
      activo: Boolean(formActivoUsuario)
    };

    if (formClaveUsuario.trim() !== '') {
      payload.clave_acceso = formClaveUsuario.trim();
    }

    try {
      if (modoEdicionUsuario && usuarioActualId) {
        const { error } = await supabase
          .from('usuarios')
          .update(payload)
          .eq('id', usuarioActualId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('usuarios')
          .insert([payload]);

        if (error) throw error;
      }

      setModalUsuarioAbierto(false);
      await cargarDatosBD();
    } catch (error) {
      console.error("Error al guardar usuario:", error.message);
      alert("No se pudo guardar el usuario: " + error.message);
    }
  };

  const alternarAccesoUsuario = async (usr) => {
    const nuevoEstado = !(usr.activo !== false);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: nuevoEstado })
        .eq('id', usr.id);

      if (error) throw error;
      setUsuarios(prev => prev.map(item => item.id === usr.id ? { ...item, activo: nuevoEstado } : item));
    } catch (error) {
      console.error("Error al cambiar acceso del usuario:", error.message);
      alert("No se pudo actualizar el acceso: " + error.message);
    }
  };

  const eliminarUsuario = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario y revocar su acceso?')) {
      try {
        const { error } = await supabase.from('usuarios').delete().eq('id', id);
        if (error) throw error;
        await cargarDatosBD();
      } catch (error) {
        console.error("Error al eliminar usuario:", error.message);
        alert("No se pudo eliminar el usuario: " + error.message);
      }
    }
  };

  // --- FUNCIONES MÓDULO CLIENTES ---
  const abrirModalCrearCliente = () => {
    setModoEdicionCliente(false);
    setFormTelefonoCliente('');
    setFormNombreCliente('');
    setFormDireccionCliente('');
    setFormObsCliente('');
    setModalClienteAbierto(true);
  };

  const abrirModalEditarCliente = (cli) => {
    setModoEdicionCliente(true);
    setFormTelefonoCliente(limpiarTelefono(cli.telefono));
    setFormNombreCliente(cli.nombre || '');
    setFormDireccionCliente(cli.direccion || '');
    setFormObsCliente(cli.observaciones || '');
    setModalClienteAbierto(true);
  };

  const abrirModalHistorialCliente = (cli) => {
    setClienteSeleccionadoHistorial(cli);
    setModalHistorialAbierto(true);
  };

  const guardarCliente = async (e) => {
    e.preventDefault();
    const telLimpio = limpiarTelefono(formTelefonoCliente);
    if (!telLimpio || telLimpio === 'N/A' || !formNombreCliente) {
      alert('El teléfono válido y el nombre son obligatorios.');
      return;
    }

    const nombreCap = capitalizarTexto(formNombreCliente);
    const dirFormateada = formatearDireccion(formDireccionCliente);

    try {
      if (modoEdicionCliente) {
        const { error } = await supabase
          .from('clientes')
          .update({
            nombre: nombreCap,
            direccion: dirFormateada,
            observaciones: formObsCliente
          })
          .eq('telefono', telLimpio);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([{
            telefono: telLimpio,
            nombre: nombreCap,
            direccion: dirFormateada,
            observaciones: formObsCliente
          }]);

        if (error) throw error;
      }

      setModalClienteAbierto(false);
      cargarDatosBD();
    } catch (error) {
      console.error("Error al guardar cliente:", error.message);
      alert("Hubo un error al guardar el cliente.");
    }
  };

  const eliminarCliente = async (telefono) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        const { error } = await supabase.from('clientes').delete().eq('telefono', telefono);
        if (error) throw error;
        cargarDatosBD();
      } catch (error) {
        console.error("Error al eliminar cliente:", error.message);
        alert("No se pudo eliminar el registro.");
      }
    }
  };

  // --- FUNCIONES MÓDULO PRODUCTOS ---
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setProductoActualId(null);
    setFormNombre('');
    if (categorias.length > 0) {
      setFormCategoriaId(String(categorias[0].id));
    }
    setFormPrecio('');
    setFormDescripcion('');
    setFormImagen('');
    setFormImagenArchivo(null);
    setModalMenuAbierto(true);
  };

  const abrirModalEditar = (prod) => {
    setModoEdicion(true);
    setProductoActualId(prod.id);
    setFormNombre(prod.nombre);
    setFormCategoriaId(String(prod.categoria_id || (categorias[0] ? categorias[0].id : 1)));
    setFormPrecio(prod.precio);
    setFormDescripcion(prod.descripcion || '');
    setFormImagen(prod.imagen || '');
    setFormImagenArchivo(null);
    setModalMenuAbierto(true);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    if (!formNombre || !formPrecio) {
      alert('Por favor completa al menos el nombre y el precio.');
      return;
    }

    const catIdNum = Number(formCategoriaId);
    let imgUrlFinal = formImagen;

    try {
      setSubiendoImagen(true);

      if (formImagenArchivo) {
        const nombreArchivo = `${Date.now()}_${formImagenArchivo.name.replace(/\s+/g, '_')}`;
        
        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(nombreArchivo, formImagenArchivo);

        if (uploadError) {
          const reader = new FileReader();
          imgUrlFinal = await new Promise((resolve) => {
            reader.onload = (uploadEvent) => resolve(uploadEvent.target.result);
            reader.readAsDataURL(formImagenArchivo);
          });
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('productos')
            .getPublicUrl(nombreArchivo);
          
          imgUrlFinal = publicUrlData.publicUrl;
        }
      }

      const datosProducto = {
        nombre: formNombre,
        categoria_id: catIdNum,
        precio: Number(formPrecio),
        descripcion: formDescripcion,
        imagen: imgUrlFinal && imgUrlFinal.trim() !== '' ? imgUrlFinal : null
      };

      if (modoEdicion && productoActualId) {
        const { data, error } = await supabase
          .from('productos')
          .update(datosProducto)
          .eq('id', productoActualId)
          .select();

        if (error) throw error;

        if (!data || data.length === 0) {
          throw new Error("No se pudo actualizar el producto.");
        }
      } else {
        datosProducto.disponible = true;
        const { error } = await supabase
          .from('productos')
          .insert([datosProducto]);

        if (error) throw error;
      }

      setModalMenuAbierto(false);
      await cargarDatosBD();
      alert(modoEdicion ? '¡Producto modificado con éxito!' : '¡Producto creado con éxito!');
    } catch (error) {
      console.error("Error al guardar el producto:", error.message);
      alert("Hubo un error al guardar el producto: " + error.message);
    } finally {
      setSubiendoImagen(false);
    }
  };

  const cambiarDisponibilidad = async (id, estadoActual) => {
    try {
      const { error } = await supabase.from('productos').update({ disponible: !estadoActual }).eq('id', id);
      if (error) throw error;
      cargarDatosBD();
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const eliminarProducto = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        const { error } = await supabase.from('productos').delete().eq('id', id);
        if (error) throw error;
        cargarDatosBD();
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  };

  // --- FUNCIONES MÓDULO ÓRDENES ---
  const cambiarEstadoOrden = async (id, nuevoEstado) => {
    const ordenActual = ordenes.find(o => o.id === id);
    if (ordenActual) {
      const estadoDb = (ordenActual.estado || '').toLowerCase().trim();
      if (['listo', 'entregado', 'cancelado'].includes(estadoDb)) {
        alert('Esta orden ya se encuentra en estado Listo/Entregado y está bloqueada contra modificaciones.');
        return;
      }
    }

    setOrdenes(prevOrdenes => 
      prevOrdenes.map(ord => ord.id === id ? { ...ord, estado: nuevoEstado } : ord)
    );

    try {
      const { error } = await supabase.from('ordenes').update(nuevoEstado.toLowerCase().trim() === 'cancelado' ? { estado: 'Cancelado', estado_pago: 'Anulado' } : { estado: nuevoEstado }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error al actualizar estado en BD:", error.message);
      cargarDatosBD();
    }
  };

  const registrarPagoOrden = async (id, nuevoEstadoPago, nuevoMetodoPago) => {
    setOrdenes(prevOrdenes => 
      prevOrdenes.map(ord => ord.id === id ? { ...ord, estado_pago: nuevoEstadoPago, metodo_pago: nuevoMetodoPago } : ord)
    );

    try {
      const { error } = await supabase.from('ordenes').update({ estado_pago: nuevoEstadoPago, metodo_pago: nuevoMetodoPago }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error al registrar pago:", error.message);
      cargarDatosBD();
    }
  };

  const abrirDetalleOrden = (o) => {
    setOrdenSeleccionada(o);
    setObservacionesEditables(o.observaciones || o.nota || '');
    setBusquedaProductoModal('');
    
    let itemsParsed = [];
    if (o.items) {
      if (typeof o.items === 'string') {
        try {
          itemsParsed = JSON.parse(o.items);
        } catch (e) {
          itemsParsed = [{ nombre: o.items, cantidad: 1, precio: o.subtotal || 0 }];
        }
      } else if (Array.isArray(o.items)) {
        itemsParsed = [...o.items];
      }
    }
    setItemsEditables(itemsParsed);
    setModalOrdenAbierto(true);
  };

  const agregarItemAOrdenModal = (producto) => {
    setItemsEditables(prev => {
      const existe = prev.find(i => i.id === producto.id || i.nombre === producto.nombre);
      if (existe) {
        return prev.map(i => (i.id === producto.id || i.nombre === producto.nombre) ? { ...i, cantidad: (i.cantidad || 1) + 1 } : i);
      } else {
        return [...prev, { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1, observacion: '' }];
      }
    });
  };

  const actualizarCantidadItemModal = (index, delta) => {
    setItemsEditables(prev => {
      const nuevo = [...prev];
      const nuevaCant = (nuevo[index].cantidad || 1) + delta;
      if (nuevaCant <= 0) {
        nuevo.splice(index, 1);
      } else {
        nuevo[index].cantidad = nuevaCant;
      }
      return nuevo;
    });
  };

  const actualizarNotaItemModal = (index, nota) => {
    setItemsEditables(prev => {
      const nuevo = [...prev];
      nuevo[index].observacion = nota;
      return nuevo;
    });
  };

  const guardarCambiosOrdenModal = async () => {
    if (!ordenSeleccionada) return;

    const nuevoSubtotal = itemsEditables.reduce((acc, curr) => acc + (Number(curr.precio || 0) * Number(curr.cantidad || 1)), 0);

    const datosActualizacion = {
      items: itemsEditables,
      subtotal: nuevoSubtotal,
      total: nuevoSubtotal,
      observaciones: observacionesEditables
    };

    try {
      const { error } = await supabase
        .from('ordenes')
        .update(datosActualizacion)
        .eq('id', ordenSeleccionada.id);

      if (error) throw error;

      alert('¡Orden modificada con éxito!');
      setModalOrdenAbierto(false);
      cargarDatosBD();
    } catch (error) {
      console.error("Error al actualizar la orden:", error.message);
      alert("Hubo un error al guardar los cambios: " + error.message);
    }
  };

  const obtenerNombreCategoria = (catId) => {
    const encontrada = categorias.find(c => c.id === catId);
    return encontrada ? encontrada.nombre : 'General';
  };

  const imprimirTicket = (orden) => {
    setOrdenImprimiendo(orden);
    setTimeout(() => { window.print(); }, 200);
  };

  const itemsFactura = (orden) => {
    if (!orden?.items) return [];
    if (Array.isArray(orden.items)) return orden.items;
    try { return JSON.parse(orden.items); } catch { return [{ nombre: orden.items, cantidad: 1 }]; }
  };

  const calcularCostoDomicilio = (o) => {
    const tipoServicio = (o.tipo_servicio || '').toLowerCase();
    if (tipoServicio.includes('domicilio')) {
      const ubicacion = (o.ubicacion_detalle || o.direccion || '').toLowerCase();
      const zonaMatch = coberturaZonas.find(z => z.activo && ubicacion.includes(z.barrio_zona.toLowerCase()));
      if (zonaMatch) {
        return Number(zonaMatch.precio_domicilio || 0);
      }
      return 5000;
    }
    return 0;
  };

  const renderizarModulo = () => {
    switch (vistaActual) {
      case 'usuarios':
      case 'meseros': {
        const usuariosFiltrados = usuarios.filter(u => {
          const busq = busquedaUsuario.toLowerCase().trim();
          const correo = (u.correo || u.email || '').toLowerCase();
          const nombre = (u.nombre || '').toLowerCase();
          const rol = (u.rol || 'cajero').toLowerCase();

          const matchBusqueda = busq === '' || nombre.includes(busq) || correo.includes(busq);
          const rolFiltro = vistaActual === 'meseros' ? 'mesero' : filtroRolUsuario;
          const matchRol = rolFiltro === 'todos' || rol === rolFiltro;

          return matchBusqueda && matchRol;
        });

        return (
          <div className="space-y-3 max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
              <div>
                <h2 className="text-base md:text-lg font-black text-white">Gestión de usuarios y acceso</h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">Controla roles, permisos de ingreso y estado activo/bloqueado de tu equipo.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-52">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Buscar nombre o correo..." 
                    value={busquedaUsuario} 
                    onChange={(e) => setBusquedaUsuario(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={filtroRolUsuario}
                  onChange={(e) => setFiltroRolUsuario(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="administrador">Administrador</option>
                  <option value="cajero">Cajero</option>
                  <option value="cocina">Cocina / KDS</option>
                  <option value="mesero">Mesero</option>
                </select>

                <button onClick={abrirModalCrearUsuario} className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Nuevo Usuario
                </button>
              </div>
            </div>

            {cargandoUsuarios ? (
              <div className="py-20 text-center text-neutral-500 text-xs">Cargando usuarios...</div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center space-y-2 shadow-lg">
                <div className="w-9 h-9 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-xs font-bold text-white">No hay usuarios registrados</h3>
                <p className="text-[11px] text-neutral-400">Crea el primer usuario para asignar rol y habilitar su acceso.</p>
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 shadow-lg">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
                        <th className="pb-2.5">Usuario</th>
                        <th className="pb-2.5">Correo de Acceso</th>
                        <th className="pb-2.5">Teléfono</th>
                        <th className="pb-2.5">Rol</th>
                        <th className="pb-2.5">Acceso</th>
                        <th className="pb-2.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {usuariosFiltrados.map(u => {
                        const estaActivo = u.activo !== false;
                        const correoMostrar = u.correo || u.email || 'Sin correo';
                        return (
                          <tr key={u.id} className="hover:bg-neutral-800/40">
                            <td className="py-2.5 font-bold text-white">{capitalizarTexto(u.nombre) || 'Sin nombre'}</td>
                            <td className="py-2.5 text-neutral-300">{correoMostrar}</td>
                            <td className="py-2.5 text-neutral-400">{limpiarTelefono(u.telefono)}</td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-[10px] font-bold uppercase">
                                {u.rol || 'cajero'}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <button
                                onClick={() => alternarAccesoUsuario(u)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all ${
                                  estaActivo
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                                }`}
                                title="Clic para cambiar acceso"
                              >
                                {estaActivo ? <Key className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                {estaActivo ? 'Acceso Activo' : 'Bloqueado'}
                              </button>
                            </td>
                            <td className="py-2.5 text-right space-x-1">
                              <button onClick={() => abrirModalEditarUsuario(u)} className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg cursor-pointer inline-block" title="Editar usuario y rol">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => eliminarUsuario(u.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer inline-block" title="Eliminar usuario">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {modalUsuarioAbierto && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-4 space-y-3 shadow-2xl relative">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                    <h3 className="text-xs font-black text-white">
                      {modoEdicionUsuario ? 'Editar Usuario y Acceso' : 'Crear Nuevo Usuario'}
                    </h3>
                    <button onClick={() => setModalUsuarioAbierto(false)} className="p-1 bg-neutral-950 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={guardarUsuario} className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Nombre Completo *</label>
                      <input 
                        type="text" required value={formNombreUsuario} 
                        onChange={(e) => setFormNombreUsuario(e.target.value)} 
                        placeholder="Ej. Ana Gómez"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500" 
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Correo Electrónico *</label>
                      <input 
                        type="email" required value={formCorreoUsuario} 
                        onChange={(e) => setFormCorreoUsuario(e.target.value)} 
                        placeholder="usuario@vertizze.com"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Rol en el Sistema *</label>
                        <select 
                          value={formRolUsuario} 
                          onChange={(e) => setFormRolUsuario(e.target.value)} 
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="administrador">Administrador</option>
                          <option value="cajero">Cajero</option>
                          <option value="cocina">Cocina / KDS</option>
                          <option value="mesero">Mesero</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Teléfono</label>
                        <input 
                          type="text" value={formTelefonoUsuario} 
                          onChange={(e) => setFormTelefonoUsuario(e.target.value)} 
                          placeholder="3000000000"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                        {modoEdicionUsuario ? 'Nueva Clave / PIN de Acceso (opcional)' : 'Clave / PIN de Acceso'}
                      </label>
                      <input 
                        type="password" value={formClaveUsuario} 
                        onChange={(e) => setFormClaveUsuario(e.target.value)} 
                        placeholder={modoEdicionUsuario ? 'Dejar vacío para mantener actual' : 'Asignar clave inicial'}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500" 
                      />
                    </div>

                    <div className="flex items-center justify-between bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2">
                      <div>
                        <span className="text-xs font-bold text-white block">Permitir acceso al sistema</span>
                        <span className="text-[10px] text-neutral-400">Si se desactiva, el usuario queda bloqueado.</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formActivoUsuario} 
                        onChange={(e) => setFormActivoUsuario(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="pt-2 flex gap-2.5">
                      <button type="button" onClick={() => setModalUsuarioAbierto(false)} className="w-1/2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 rounded-xl text-xs cursor-pointer">
                        Cancelar
                      </button>
                      <button type="submit" className="w-1/2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 cursor-pointer">
                        {modoEdicionUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'pagos': {
        const ordenesPendientesPago = ordenes.filter(o => {
          const estadoPago = o.estado_pago ? o.estado_pago.toLowerCase().trim() : '';
          const estadoPedido = String(o.estado || '').toLowerCase().trim();
          return estadoPago !== 'pagado' && estadoPedido !== 'cancelado';
        });

        return (
          <div className="space-y-3 max-w-full overflow-hidden">
            <div>
              <h2 className="text-base md:text-lg font-black text-white">Control de pagos</h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">Pedidos pendientes o sin pago confirmado para auditoría y cobro.</p>
            </div>
            {cargandoOrdenes ? (
              <div className="py-20 text-center text-neutral-500 text-xs">Cargando órdenes pendientes de pago...</div>
            ) : ordenesPendientesPago.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center space-y-2 shadow-lg">
                <div className="w-9 h-9 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-xs font-bold text-white">¡Excelente! No hay pedidos pendientes de pago</h3>
                <p className="text-[11px] text-neutral-400">Todas las órdenes registradas cuentan con su pago confirmado o aprobado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {ordenesPendientesPago.map(o => {
                  const esDomicilio = (o.tipo_servicio || '').toLowerCase().includes('domicilio');
                  const costoDom = esDomicilio ? calcularCostoDomicilio(o) : 0;
                  const subtotalBase = Number(o.subtotal || o.total || 0);
                  const totalConDomicilio = subtotalBase + costoDom;
                  const estadoCocina = capitalizarTexto(o.estado || 'Pendiente');

                  return (
                    <div key={o.id} className="bg-neutral-900 border border-amber-500/40 rounded-xl p-3 flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-lg">
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-[10px] font-bold uppercase">Orden #{o.numero_orden}</span>
                          <h3 className="text-xs font-bold text-white mt-1">{capitalizarTexto(o.cliente_nombre) || 'Cliente General'}</h3>
                          <span className="text-[10px] text-neutral-400 block">
                            {capitalizarTexto(o.tipo_servicio) || 'Local'} â€¢ Cocina: <strong className="text-amber-400">{estadoCocina}</strong>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-400 font-semibold block">Total a Pagar</span>
                          <p className="text-sm font-black text-white">$ {totalConDomicilio.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 space-y-1">
                        <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block">Desglose de Cobro:</span>
                        <div className="text-[11px] text-neutral-300 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Subtotal ítems:</span>
                            <span className="font-semibold">$ {subtotalBase.toLocaleString()}</span>
                          </div>
                          {esDomicilio && (
                            <div className="flex justify-between text-amber-300">
                              <span>+ Costo Domicilio:</span>
                              <span className="font-semibold">$ {costoDom.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-neutral-800">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-neutral-400 block mb-0.5">Método de Pago:</label>
                            <select 
                              value={o.metodo_pago || 'Efectivo'}
                              onChange={(e) => registrarPagoOrden(o.id, o.estado_pago || 'Por Pagar', e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-1 text-[11px] text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                              <option value="Efectivo">Efectivo</option>
                              <option value="Transferencia">Transferencia</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-neutral-400 block mb-0.5">Confirmar Pago:</label>
                            <button
                              onClick={() => registrarPagoOrden(o.id, 'Pagado', o.metodo_pago || 'Efectivo')}
                              className="w-full py-1 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20"
                            >
                              <span>Confirmar</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-0.5 text-[10px]">
                          <span className="text-neutral-500 font-mono">Ref: #{o.numero_orden || o.id}</span>
                          <button onClick={() => imprimirTicket(o)} className="text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer">
                            <Printer className="w-3 h-3" /> Factura
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      case 'clientes': {
        const clientesUnicos = Array.from(new Map(clientes.map(c => [limpiarTelefono(c.telefono), c])).values());
        const clientesFiltrados = clientesUnicos.filter(c => {
          const busq = busquedaCliente.toLowerCase();
          const telLimpio = limpiarTelefono(c.telefono).toLowerCase();
          return (
            (c.nombre && c.nombre.toLowerCase().includes(busq)) ||
            telLimpio.includes(busq) ||
            (c.direccion && c.direccion.toLowerCase().includes(busq))
          );
        });

        const totalRegistrosCli = clientesFiltrados.length;
        const totalPaginasCli = Math.ceil(totalRegistrosCli / registrosPorPaginaClientes) || 1;
        const indiceUltimoCli = paginaActualClientes * registrosPorPaginaClientes;
        const indicePrimerCli = indiceUltimoCli - registrosPorPaginaClientes;
        const clientesPaginados = clientesFiltrados.slice(indicePrimerCli, indiceUltimoCli);

        const cambiarPaginaCli = (nuevaPag) => {
          if (nuevaPag >= 1 && nuevaPag <= totalPaginasCli) {
            setPaginaActualClientes(nuevaPag);
          }
        };

        const ordenesClienteHistorial = clienteSeleccionadoHistorial ? ordenes.filter(o => {
          const telOrd = limpiarTelefono(o.cliente_telefono || o.telefono);
          const telCli = limpiarTelefono(clienteSeleccionadoHistorial.telefono);
          return telOrd !== 'N/A' && telOrd === telCli;
        }) : [];

        const totalGastadoHistorial = ordenesClienteHistorial.reduce((acc, curr) => acc + Number(curr.subtotal || curr.total || 0), 0);
        const metodosPagoUsados = [...new Set(ordenesClienteHistorial.map(o => capitalizarTexto(o.metodo_pago) || 'Efectivo'))];
        const direccionesUsadas = [...new Set(ordenesClienteHistorial.map(o => formatearDireccion(o.direccion || o.cliente_direccion)).filter(d => d !== 'N/A'))];

        return (
          <div className="space-y-3 max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
              <div>
                <h2 className="text-base md:text-lg font-black text-white">Gestión de clientes</h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">Sincronización en tiempo real con datos de órdenes e identificación por teléfono.</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre o teléfono..."
                    value={busquedaCliente}
                    onChange={(e) => { setBusquedaCliente(e.target.value); setPaginaActualClientes(1); }}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button onClick={abrirModalCrearCliente} className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Nuevo Cliente
                </button>
              </div>
            </div>

            {cargandoClientes ? (
              <div className="py-20 text-center text-neutral-500 text-xs">Cargando clientes en tiempo real...</div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center space-y-2 shadow-lg">
                <div className="w-9 h-9 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                  <Users className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-xs font-bold text-white">No se encontraron clientes</h3>
                <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">Los clientes se insertan automáticamente a medida que ingresan nuevas órdenes.</p>
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-3 shadow-lg">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
                        <th className="pb-2.5">Teléfono (Número Único)</th>
                        <th className="pb-2.5">Primer Nombre / Registrado</th>
                        <th className="pb-2.5">Dirección / Ubicación</th>
                        <th className="pb-2.5">Observaciones</th>
                        <th className="pb-2.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {clientesPaginados.map(c => {
                        const telFormateado = limpiarTelefono(c.telefono);
                        const direccionFormateada = formatearDireccion(c.direccion);
                        const nombreFormateado = capitalizarTexto(c.nombre) || 'Sin nombre';
                        const visitas = ordenes.filter((orden) => limpiarTelefono(orden.cliente_telefono || orden.telefono) === telFormateado).length;
                        
                        return (
                          <tr key={c.telefono} className="hover:bg-neutral-800/40">
                            <td className="py-2.5 font-bold text-amber-400 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-neutral-400" />
                              {telFormateado}
                            </td>
                            <td className="py-2.5 text-white font-semibold">{nombreFormateado}<span className="block text-[10px] text-amber-400 font-normal">{visitas} {visitas === 1 ? 'visita' : 'visitas'}</span></td>
                            <td className="py-2.5 text-neutral-300">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                                <span className={`truncate max-w-xs ${direccionFormateada === 'N/A' ? 'text-neutral-500 italic' : ''}`}>
                                  {direccionFormateada}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 text-neutral-400 truncate max-w-xs">{capitalizarTexto(c.observaciones) || 'Ninguna'}</td>
                            <td className="py-2.5 text-right space-x-1">
                              <button onClick={() => abrirModalHistorialCliente(c)} className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-all cursor-pointer inline-block" title="Ver Historial y Direcciones">
                                <ClipboardList className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => abrirModalEditarCliente(c)} className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-all cursor-pointer inline-block" title="Editar">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => eliminarCliente(c.telefono)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer inline-block" title="Eliminar">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center pt-2 border-t border-neutral-800 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span>Mostrando del <strong>{totalRegistrosCli > 0 ? indicePrimerCli + 1 : 0}</strong> al <strong>{Math.min(indiceUltimoCli, totalRegistrosCli)}</strong> de <strong>{totalRegistrosCli}</strong> clientes</span>
                    <select 
                      value={registrosPorPaginaClientes}
                      onChange={(e) => { setRegistrosPorPaginaClientes(Number(e.target.value)); setPaginaActualClientes(1); }}
                      className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-0.5 text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer ml-1 text-[11px]"
                    >
                      <option value="5">5 por pág</option>
                      <option value="10">10 por pág</option>
                      <option value="20">20 por pág</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => cambiarPaginaCli(paginaActualClientes - 1)}
                      disabled={paginaActualClientes === 1}
                      className="p-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2.5 py-0.5 bg-neutral-950 border border-neutral-800 rounded-lg font-bold text-amber-400 text-[11px]">
                      {paginaActualClientes} / {totalPaginasCli}
                    </span>
                    <button 
                      onClick={() => cambiarPaginaCli(paginaActualClientes + 1)}
                      disabled={paginaActualClientes === totalPaginasCli}
                      className="p-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalClienteAbierto && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-4 space-y-3 shadow-2xl relative">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                    <h3 className="text-xs font-black text-white">
                      {modoEdicionCliente ? 'Modificar Información de Cliente' : 'Crear Nuevo Cliente'}
                    </h3>
                    <button onClick={() => setModalClienteAbierto(false)} className="p-1 bg-neutral-950 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={guardarCliente} className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Teléfono / WhatsApp (Número Único) *</label>
                      <input 
                        type="text" required placeholder="3001234567" 
                        value={formTelefonoCliente} 
                        onChange={(e) => setFormTelefonoCliente(e.target.value)}
                        disabled={modoEdicionCliente}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Primer Nombre *</label>
                      <input 
                        type="text" required placeholder="Ej. Carlos" 
                        value={formNombreCliente} 
                        onChange={(e) => setFormNombreCliente(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Dirección</label>
                      <input 
                        type="text" placeholder="Ej. Calle 50 # 45-20 o N/A" 
                        value={formDireccionCliente} 
                        onChange={(e) => setFormDireccionCliente(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Observaciones / Notas</label>
                      <textarea 
                        rows="2" placeholder="Preferencias..." 
                        value={formObsCliente} 
                        onChange={(e) => setFormObsCliente(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    <div className="pt-2 flex gap-2.5">
                      <button type="button" onClick={() => setModalClienteAbierto(false)} className="w-1/2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 rounded-xl text-xs cursor-pointer">
                        Cancelar
                      </button>
                      <button type="submit" className="w-1/2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 cursor-pointer">
                        {modoEdicionCliente ? 'Guardar Cambios' : 'Crear Cliente'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {modalHistorialAbierto && clienteSeleccionadoHistorial && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 overflow-y-auto">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-3xl w-full p-4 space-y-3 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                    <div>
                      <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Historial:</span> 
                        <span className="text-amber-400">{capitalizarTexto(clienteSeleccionadoHistorial.nombre) || 'Cliente'}</span>
                      </h3>
                      <p className="text-[10px] text-neutral-400">Teléfono: {limpiarTelefono(clienteSeleccionadoHistorial.telefono)}</p>
                    </div>
                    <button onClick={() => setModalHistorialAbierto(false)} className="p-1 bg-neutral-950 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase">Total Órdenes</span>
                      <p className="text-base font-black text-amber-400 mt-1">{ordenesClienteHistorial.length} pedidos</p>
                    </div>
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase">Inversión Acumulada</span>
                      <p className="text-base font-black text-white mt-1">$ {totalGastadoHistorial.toLocaleString()}</p>
                    </div>
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase">Formas de Pago</span>
                      <p className="text-xs font-bold text-emerald-400 mt-1 truncate">{metodosPagoUsados.join(', ') || 'Efectivo'}</p>
                    </div>
                  </div>

                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-1.5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Direcciones Guardadas</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {direccionesUsadas.length === 0 ? (
                        <span className="text-xs text-neutral-500 italic">No hay direcciones registradas.</span>
                      ) : (
                        direccionesUsadas.map((dir, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500" /> {dir}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex justify-end">
                    <button type="button" onClick={() => setModalHistorialAbierto(false)} className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-4 py-2 rounded-xl text-xs cursor-pointer shadow-lg shadow-amber-500/20">
                      Cerrar Historial
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'ordenes': {
        const ordenesFiltradas = ordenes.filter(o => {
          const matchBusqueda = busquedaOrden === '' || 
            (o.cliente_nombre && o.cliente_nombre.toLowerCase().includes(busquedaOrden.toLowerCase())) ||
            String(o.numero_orden).toLowerCase().includes(busquedaOrden.toLowerCase()) ||
            String(o.id).includes(busquedaOrden);

          const estadoActual = o.estado ? o.estado.toLowerCase().trim() : 'pendiente';
          const matchEstado = filtroEstadoOrden === 'todos' || estadoActual === filtroEstadoOrden.toLowerCase();

          const fechaCreacion = o.creado_en ? o.creado_en.split('T')[0] : '';
          const matchFechaInicio = !filtroFechaInicioOrden || fechaCreacion >= filtroFechaInicioOrden;
          const matchFechaFin = !filtroFechaFinOrden || fechaCreacion <= filtroFechaFinOrden;

          return matchBusqueda && matchEstado && matchFechaInicio && matchFechaFin;
        });

        const totalRegistros = ordenesFiltradas.length;
        const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina) || 1;
        const indiceUltimoRegistro = paginaActualOrdenes * registrosPorPagina;
        const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
        const ordenesPaginadas = ordenesFiltradas.slice(indicePrimerRegistro, indiceUltimoRegistro);

        const cambiarPagina = (nuevaPagina) => {
          if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) setPaginaActualOrdenes(nuevaPagina);
        };

        const productosFiltradosModal = productos.filter(p => 
          p.nombre.toLowerCase().includes(busquedaProductoModal.toLowerCase()) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(busquedaProductoModal.toLowerCase()))
        );

        const filtrarHoy = () => {
          const hoyStr = new Date().toISOString().split('T')[0];
          setFiltroFechaInicioOrden(hoyStr);
          setFiltroFechaFinOrden(hoyStr);
          setPaginaActualOrdenes(1);
        };

        const calcularTotalConDomicilio = (o) => {
          const subtotalBase = Number(o.subtotal || o.total || 0);
          const tipoServicio = (o.tipo_servicio || '').toLowerCase();
          
          if (tipoServicio.includes('domicilio')) {
            const ubicacion = (o.ubicacion_detalle || o.direccion || '').toLowerCase();
            if (ubicacion.includes('sabaneta') || ubicacion.includes('envigado')) {
              return subtotalBase + 8000;
            } else if (ubicacion.includes('poblado')) {
              return subtotalBase + 7000;
            } else if (ubicacion.includes('laureles')) {
              return subtotalBase + 6000;
            } else if (ubicacion.includes('bello')) {
              return subtotalBase + 5000;
            } else if (ubicacion.includes('centro')) {
              return subtotalBase + 4000;
            } else {
              return subtotalBase + 5000;
            }
          }
          return subtotalBase;
        };

        return (
          <div className="space-y-3 max-w-full overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2.5">
              <div>
                <h2 className="text-base md:text-lg font-black text-white">Gestión de órdenes</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Buscar cliente o N°..."
                    value={busquedaOrden}
                    onChange={(e) => { setBusquedaOrden(e.target.value); setPaginaActualOrdenes(1); }}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1">
                  <button 
                    onClick={filtrarHoy}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] font-black rounded-lg transition-all cursor-pointer shrink-0"
                  >
                    Hoy
                  </button>
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
                  <div className="flex items-center gap-1">
                    <input type="date" value={filtroFechaInicioOrden} onChange={(e) => { setFiltroFechaInicioOrden(e.target.value); setPaginaActualOrdenes(1); }} className="bg-transparent text-[11px] text-white font-bold focus:outline-none cursor-pointer" />
                    <span className="text-neutral-500 text-[10px]">-</span>
                    <input type="date" value={filtroFechaFinOrden} onChange={(e) => { setFiltroFechaFinOrden(e.target.value); setPaginaActualOrdenes(1); }} className="bg-transparent text-[11px] text-white font-bold focus:outline-none cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'todos', label: 'Todas' },
                { id: 'pendiente', label: 'Pendiente' },
                { id: 'en proceso', label: 'En Proceso' },
                { id: 'listo', label: 'Listo' },
                { id: 'entregado', label: 'Entregado' },
                { id: 'cancelado', label: 'Cancelado' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => { setFiltroEstadoOrden(f.id); setPaginaActualOrdenes(1); }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filtroEstadoOrden === f.id ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20' : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {cargandoOrdenes ? (
              <div className="py-20 text-center text-neutral-500 text-xs">Cargando órdenes...</div>
            ) : ordenesFiltradas.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center space-y-2 shadow-lg">
                <div className="w-9 h-9 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                  <ClipboardList className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-xs font-bold text-white">No se encontraron órdenes</h3>
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-2.5 shadow-lg">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs min-w-[750px]">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
                        <th className="pb-2.5">ID / N° Orden</th>
                        <th className="pb-2.5">Tipo Servicio</th>
                        <th className="pb-2.5">Cliente</th>
                        <th className="pb-2.5">Ítems / Detalle</th>
                        <th className="pb-2.5">Total</th>
                        <th className="pb-2.5">Estado Pago</th>
                        <th className="pb-2.5">Estado Pedido</th>
                        <th className="pb-2.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {ordenesPaginadas.map(o => {
                        const estadoPagoRaw = (o.estado_pago || 'Por Pagar').toLowerCase();
                        const esPagado = estadoPagoRaw.includes('pagado');
                        const estadoPedidoRaw = (o.estado || 'Pendiente').toLowerCase().trim();
                        const estaBloqueado = estadoPedidoRaw === 'listo' || estadoPedidoRaw === 'entregado';
                        const totalFinalCalculado = calcularTotalConDomicilio(o);

                        return (
                          <tr key={o.id} className="hover:bg-neutral-800/40">
                            <td className="py-2.5 font-bold text-white">#{o.id} <span className="text-amber-400 font-normal">({o.numero_orden})</span></td>
                            <td className="py-2.5"><span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-md text-[10px] font-bold uppercase">{capitalizarTexto(o.tipo_servicio) || 'Local'}</span></td>
                            <td className="py-2.5 text-white font-semibold">{capitalizarTexto(o.cliente_nombre) || 'Cliente General'}</td>
                            <td className="py-2.5 text-neutral-300 max-w-xs whitespace-pre-line leading-relaxed">
                              {formatearItems(o.items)}
                              {((o.tipo_servicio || '').toLowerCase().includes('domicilio')) && (
                                <span className="block text-amber-400 font-semibold mt-0.5">
                                  â€¢ Domicilio: $ {calcularCostoDomicilio(o).toLocaleString()}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 text-white font-bold">$ {Number(totalFinalCalculado).toLocaleString()}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${esPagado ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                                {esPagado ? 'Pagado' : 'Por Pagar'} ({capitalizarTexto(o.metodo_pago) || 'Efectivo'})
                              </span>
                            </td>
                            <td className="py-2.5">
                              {estaBloqueado ? (
                                <div className="space-y-1">
                                  <span className={`px-2 py-1 rounded-lg text-[11px] font-bold inline-block ${estadoPedidoRaw === 'listo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                    {capitalizarTexto(o.estado)}
                                  </span>
                                  {estadoPedidoRaw === 'entregado' && o.tiempo_entrega && (
                                    <span className="block text-[10px] text-neutral-400">
                                      Entregado: {formatearFechaHora(o.tiempo_entrega)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <select 
                                  value={o.estado || 'Pendiente'}
                                  onChange={(e) => cambiarEstadoOrden(o.id, e.target.value)}
                                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-[11px] text-amber-400 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                                >
                                  <option value="Pendiente">Pendiente</option>
                                  <option value="En Proceso">En Proceso</option>
                                  <option value="Listo">Listo</option>
                                  <option value="Entregado">Entregado</option>
                                  <option value="Cancelado">Cancelado</option>
                                </select>
                              )}
                            </td>
                            <td className="py-2.5 text-right space-x-1">
                              <button onClick={() => abrirDetalleOrden(o)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1 text-[11px]">
                                <Edit3 className="w-3 h-3 text-amber-400" /> Ver/Editar
                              </button>
                              <button onClick={() => imprimirTicket(o)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1 text-[11px]">
                                <Printer className="w-3 h-3 text-amber-400" /> Factura
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center pt-2 border-t border-neutral-800 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span>Mostrando del <strong>{totalRegistros > 0 ? indicePrimerRegistro + 1 : 0}</strong> al <strong>{Math.min(indiceUltimoRegistro, totalRegistros)}</strong> de <strong>{totalRegistros}</strong> órdenes</span>
                    <select value={registrosPorPagina} onChange={(e) => { setRegistrosPorPagina(Number(e.target.value)); setPaginaActualOrdenes(1); }} className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-0.5 text-white font-bold focus:outline-none text-[11px]">
                      <option value="5">5 por pág</option>
                      <option value="10">10 por pág</option>
                      <option value="20">20 por pág</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => cambiarPagina(paginaActualOrdenes - 1)} disabled={paginaActualOrdenes === 1} className="p-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 disabled:opacity-40 cursor-pointer">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2.5 py-0.5 bg-neutral-950 border border-neutral-800 rounded-lg font-bold text-amber-400 text-[11px]">{paginaActualOrdenes} / {totalPaginas}</span>
                    <button onClick={() => cambiarPagina(paginaActualOrdenes + 1)} disabled={paginaActualOrdenes === totalPaginas} className="p-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 disabled:opacity-40 cursor-pointer">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {modalOrdenAbierto && ordenSeleccionada && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 overflow-y-auto">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-4 space-y-3 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Editar Orden #{ordenSeleccionada.numero_orden} (ID: {ordenSeleccionada.id})
                      </h3>
                      <p className="text-[10px] text-neutral-400">Cliente: {capitalizarTexto(ordenSeleccionada.cliente_nombre) || 'Cliente General'}</p>
                    </div>
                    <button onClick={() => setModalOrdenAbierto(false)} className="p-1 bg-neutral-950 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Artículos en el Pedido</h4>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {itemsEditables.length === 0 ? (
                          <p className="text-xs text-neutral-500 italic py-2">No hay artículos en la orden.</p>
                        ) : (
                          itemsEditables.map((item, idx) => (
                            <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-white truncate max-w-[140px]">{capitalizarTexto(item.nombre)}</span>
                                <span className="text-amber-400 font-bold">$ {Number((item.precio || 0) * (item.cantidad || 1)).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                                  <button onClick={() => actualizarCantidadItemModal(idx, -1)} className="text-neutral-400 hover:text-white font-black px-1 cursor-pointer">-</button>
                                  <span className="text-xs font-bold text-white">{item.cantidad || 1}</span>
                                  <button onClick={() => actualizarCantidadItemModal(idx, 1)} className="text-neutral-400 hover:text-white font-black px-1 cursor-pointer">+</button>
                                </div>
                                <input 
                                  type="text" 
                                  placeholder="Nota/Observación ítem..." 
                                  value={item.observacion || ''}
                                  onChange={(e) => actualizarNotaItemModal(idx, e.target.value)}
                                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs">
                        <span className="font-bold text-neutral-400">Total Calculado:</span>
                        <span className="font-black text-white">$ {itemsEditables.reduce((acc, curr) => acc + (Number(curr.precio || 0) * Number(curr.cantidad || 1)), 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Añadir más artículos</h4>
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text" 
                            placeholder="Buscador sencillo de menú..." 
                            value={busquedaProductoModal}
                            onChange={(e) => setBusquedaProductoModal(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                          />
                        </div>
                        <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                          {productosFiltradosModal.map(p => (
                            <div key={p.id} className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-2 flex justify-between items-center hover:border-amber-500/50 transition-all">
                              <div>
                                <p className="text-xs font-bold text-white truncate max-w-[150px]">{capitalizarTexto(p.nombre)}</p>
                                <span className="text-[10px] text-amber-400 font-semibold">$ {Number(p.precio).toLocaleString()}</span>
                              </div>
                              <button onClick={() => agregarItemAOrdenModal(p)} className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-lg text-[10px] cursor-pointer shadow">
                                + Añadir
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-300 block">Modificar Observaciones Generales</label>
                        <textarea 
                          rows="2" 
                          value={observacionesEditables}
                          onChange={(e) => setObservacionesEditables(e.target.value)}
                          placeholder="Notas generales de la orden..."
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex justify-end gap-2">
                    <button type="button" onClick={() => setModalOrdenAbierto(false)} className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-3 py-2 rounded-xl text-xs cursor-pointer">
                      Cancelar
                    </button>
                    <button type="button" onClick={guardarCambiosOrdenModal} className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-4 py-2 rounded-xl text-xs cursor-pointer shadow-lg shadow-amber-500/25">
                      Guardar y Notificar a Cocina
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'productos': {
        const productosFiltrados = productos.filter(p => {
          const busq = busquedaMenu.toLowerCase();
          return p.nombre.toLowerCase().includes(busq) || (p.descripcion && p.descripcion.toLowerCase().includes(busq));
        });

        return (
          <div className="space-y-3 max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
              <div>
                <h2 className="text-base md:text-lg font-black text-white">Productos</h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">Gestión completa del catálogo, precios, categorías y disponibilidad.</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Buscar producto..." 
                    value={busquedaMenu} 
                    onChange={(e) => setBusquedaMenu(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button onClick={abrirModalCrear} className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Nuevo Producto
                </button>
              </div>
            </div>

            {cargandoMenu ? (
              <div className="py-20 text-center text-neutral-500 text-xs">Cargando productos...</div>
            ) : productosFiltrados.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center space-y-2 shadow-lg">
                <div className="w-9 h-9 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                  <Utensils className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-xs font-bold text-white">No se encontraron productos</h3>
                <p className="text-[11px] text-neutral-400">Intenta con otro término de búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
                {productosFiltrados.map(p => (
                  <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-lg">
                    <div className="flex gap-2.5">
                      <div className="w-14 h-14 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {p.imagen ? (
                          <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-neutral-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">{obtenerNombreCategoria(p.categoria_id)}</span>
                        <h3 className="text-xs font-bold text-white truncate mt-0.5">{capitalizarTexto(p.nombre)}</h3>
                        <p className="text-sm font-black text-white mt-1">$ {Number(p.precio).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-2">{capitalizarTexto(p.descripcion) || 'Sin descripción'}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                      <button onClick={() => cambiarDisponibilidad(p.id, p.disponible)} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${p.disponible ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                        {p.disponible ? 'Disponible' : 'Agotado'}
                      </button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => abrirModalEditar(p)} className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg cursor-pointer" title="Editar">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => eliminarProducto(p.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {modalMenuAbierto && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-4 space-y-3 shadow-2xl relative">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                    <h3 className="text-xs font-black text-white">{modoEdicion ? 'Editar Producto' : 'Crear Nuevo Producto'}</h3>
                    <button onClick={() => setModalMenuAbierto(false)} className="p-1 bg-neutral-950 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={guardarProducto} className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Nombre *</label>
                      <input type="text" required value={formNombre} onChange={(e) => setFormNombre(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Categoría *</label>
                        <select value={formCategoriaId} onChange={(e) => setFormCategoriaId(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer">
                          {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Precio *</label>
                        <input type="number" required value={formPrecio} onChange={(e) => setFormPrecio(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Descripción</label>
                      <textarea rows="2" value={formDescripcion} onChange={(e) => setFormDescripcion(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-300 block mb-1">Imagen del Producto (Desde tu Equipo)</label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 bg-neutral-950 border border-neutral-800 hover:border-amber-500 rounded-xl px-3 py-2 text-xs text-neutral-300 font-bold cursor-pointer transition-all">
                          <ImageIcon className="w-4 h-4 text-amber-500" />
                          <span className="truncate">{formImagenArchivo ? formImagenArchivo.name : (formImagen ? 'Imagen actual cargada' : 'Seleccionar archivo...')}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setFormImagenArchivo(e.target.files[0]);
                              }
                            }} 
                            className="hidden" 
                          />
                        </label>
                        {formImagen && !formImagenArchivo && (
                          <div className="w-9 h-9 rounded-xl overflow-hidden border border-neutral-800 shrink-0">
                            <img src={formImagen} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 flex gap-2.5">
                      <button type="button" onClick={() => setModalMenuAbierto(false)} className="w-1/2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 rounded-xl text-xs cursor-pointer">Cancelar</button>
                      <button type="submit" disabled={subiendoImagen} className="w-1/2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50">
                        {subiendoImagen ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return <div className="text-white text-xs">Selecciona un módulo válido.</div>;
    }
  };

  return (
    <div className="medusa-admin-theme min-h-screen bg-neutral-950 text-white flex flex-col font-sans select-none">
      {cargandoInicial && (
        <div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-neutral-300">Cargando Vértizze Dashboard...</p>
        </div>
      )}

      {ordenImprimiendo && (
        <div className="hidden print:block fixed inset-0 bg-white text-black text-sm p-4 z-[9999] font-mono">
          <div className="relative z-10 max-w-[80mm] mx-auto text-center">
            <h1 className="text-xl font-black uppercase">Factura - Medusa Granizados</h1>
            <p className="text-xs font-bold">Orden #{ordenImprimiendo.numero_orden || ordenImprimiendo.id}</p>
            <p className="text-xs">{new Date().toLocaleString()}</p>
            <div className="border-t border-black mt-2 pt-2 text-left">
              {itemsFactura(ordenImprimiendo).map((item, index) => <p key={index}>{item.cantidad || 1} x {item.nombre || item.titulo || 'Producto'} — $ {Number(item.precio || 0).toLocaleString()}</p>)}
              <p className="border-t border-black mt-2 pt-2 text-right font-black">TOTAL: $ {Number(ordenImprimiendo.total || ordenImprimiendo.subtotal || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <header className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuMovilAbierto(!menuMovilAbierto)} className="p-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-300 hover:text-white md:hidden cursor-pointer">
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-neutral-950 font-black text-xs shadow-lg shadow-amber-500/20">
              V
            </div>
            <div>
              <h1 className="text-xs font-black tracking-wider text-white">VÉRTIZZE ADMIN</h1>
              <p className="text-[10px] text-neutral-400">Rol activo: {rolUsuario}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs text-neutral-300">
            <Store className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold">Sede: Principal</span>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-all cursor-pointer" title="Actualizar Datos">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`hidden md:flex flex-col bg-neutral-900 border-r border-neutral-800 transition-all duration-300 ${menuColapsado ? 'w-16' : 'w-56'} p-3 space-y-4`}>
          <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
            {!menuColapsado && <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Navegación</span>}
            <button onClick={() => setMenuColapsado(!menuColapsado)} className="p-1 bg-neutral-950 rounded-lg text-neutral-400 hover:text-white cursor-pointer mx-auto">
              <Menu className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1 flex-1">
            {obtenerItemsMenu().map(item => {
              const Icono = item.icon;
              const activo = vistaActual === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setVistaActual(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activo ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'}`}
                  title={item.label}
                >
                  <Icono className="w-4 h-4 shrink-0" />
                  {!menuColapsado && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-neutral-800">
            <button 
              onClick={() => {
                if (typeof onCerrarSesion === 'function') {
                  onCerrarSesion();
                } else {
                  sessionStorage.clear();
                  window.location.href = '/login';
                }
              }} 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!menuColapsado && <span>Cerrar Sesión</span>}
            </button>
          </div>
        </aside>

        {menuMovilAbierto && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden flex">
            <div className="w-64 bg-neutral-900 border-r border-neutral-800 p-4 flex flex-col space-y-4 shadow-2xl">
              <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
                <span className="text-xs font-black uppercase text-white">Menú Principal</span>
                <button onClick={() => setMenuMovilAbierto(false)} className="p-1 bg-neutral-950 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="space-y-1.5 flex-1">
                {obtenerItemsMenu().map(item => {
                  const Icono = item.icon;
                  const activo = vistaActual === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setVistaActual(item.id); setMenuMovilAbierto(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activo ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'}`}
                    >
                      <Icono className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex-1" onClick={() => setMenuMovilAbierto(false)}></div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-neutral-950">
          {renderizarModulo()}
        </main>
      </div>
    </div>
  );
}




