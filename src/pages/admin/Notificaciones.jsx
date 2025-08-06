import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/Notificaciones.css';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

export default function Notificaciones() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [estructuraMapas, setEstructuraMapas] = useState({});
  const [filtro, setFiltro] = useState('viaje');
  const [estado, setEstado] = useState('pendiente');
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    obtenerSolicitudes();
  }, [filtro, estado, busqueda, fechaDesde, fechaHasta]);

  const obtenerSolicitudes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const params = new URLSearchParams();
      if (estado) params.append('estado', estado);
      if (busqueda) params.append('busqueda', busqueda);
      if (fechaDesde && fechaHasta) {
        params.append('fechaDesde', fechaDesde);
        params.append('fechaHasta', fechaHasta);
      }

      const res = await axios.get(`${API_URL}/admin/reservas/filtrar?${params.toString()}`, config);
      const agrupadas = agruparSolicitudes(res.data);
      setSolicitudes(agrupadas);
    } catch {
      toast.error('Error al cargar las solicitudes');
    }
  };

  const agruparSolicitudes = (data) => {
    const agrupado = {};
    data.forEach(r => {
      const key = filtro === 'usuario'
        ? `${r.id_usuario}-${r.id_unidad_viaje}`
        : `${r.origen}-${r.destino}-${r.fecha}-${r.hora}-${r.id_unidad_viaje}`;
      if (!agrupado[key]) agrupado[key] = [];
      agrupado[key].push(r);
    });
    return Object.values(agrupado);
  };

  const generarMapaAsientos = (grupo) => {
    const unidadId = grupo[0].id_unidad_viaje;
    const estructura = estructuraMapas[unidadId];
    if (!estructura) return null;

    const maxFila = Math.max(...estructura.map(a => a.fila));
    const maxCol = Math.max(...estructura.map(a => a.col));

    const mapa = [];
    for (let fila = 1; fila <= maxFila; fila++) {
      const filaAsientos = [];
      for (let col = 1; col <= maxCol; col++) {
        const asiento = estructura.find(a => a.fila === fila && a.col === col);
        const seleccionado = asiento && grupo.find(g => g.asiento == asiento.numero);
        filaAsientos.push(
          <div
            key={`${fila}-${col}`}
            className={`asiento-mapa ${seleccionado ? 'seleccionado' : ''}`}
          >
            {asiento?.numero || ''}
          </div>
        );
      }
      mapa.push(<div key={fila} className="fila-mapa">{filaAsientos}</div>);
    }

    return (
      <div className="mini-mapa">
        {mapa}
        <div className="simbologia-mini">
          <span><span className="cuadro-simbologia seleccionado"></span>Seleccionado</span>
          <span><span className="cuadro-simbologia libre"></span>Libre</span>
        </div>
      </div>
    );
  };

  const cargarEstructura = async (unidadId) => {
    if (estructuraMapas[unidadId]) return;
    try {
      const res = await axios.get(`${API_URL}/viajes/${unidadId}/asientos`);
      setEstructuraMapas(prev => ({ ...prev, [unidadId]: res.data.estructuras }));
    } catch {
      toast.error(' Error al obtener mapa de asientos');
    }
  };

  const aceptarReserva = async (grupo) => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      for (const r of grupo) {
        await axios.put(`${API_URL}/admin/reservas/${r.id}/confirmar`, null, config);
      }
      toast.success(' Reservas confirmadas');
      obtenerSolicitudes();
    } catch {
      toast.error(' Error al confirmar reservas');
    }
  };

  const rechazarReserva = async (grupo) => {
  try {
    const token = localStorage.getItem('adminToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    for (const r of grupo) {
      await axios.delete(`${API_URL}/admin/reservas/${r.id}/rechazar`, config);
    }

    toast.success('Reservas rechazadas');
    obtenerSolicitudes();
  } catch (err) {
    console.error(err);
    toast.error('Error al rechazar reservas');
  }
};


  return (
    <div className="notificaciones-container">
      <h2>Solicitudes de Reservas</h2>

      <div className="filtros">
        <label>Filtrar por:</label>
        <select value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="viaje">Por Viaje</option>
          <option value="usuario">Por Usuario</option>
        </select>

        <label>Estado:</label>
        <select value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="">-- Todos --</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="rechazada">Rechazada</option>
        </select>

        <label>Buscar nombre o teléfono:</label>
        <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..." />

        <label>Fecha desde:</label>
        <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />

        <label>Fecha hasta:</label>
        <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
      </div>

      <div className="lista-solicitudes">
        {solicitudes.map((grupo, idx) => (
          <div key={idx} className="solicitud-card" onMouseEnter={() => cargarEstructura(grupo[0].id_unidad_viaje)}>
            <p><strong>{grupo.length}</strong> solicitó asiento(s)</p>
            <p><strong>Nombre:</strong> {grupo[0].nombre_usuario}</p>
            <p><strong>Teléfono:</strong> {grupo[0].telefono || 'No especificado'}</p>
            <p><strong>Viaje:</strong> {grupo[0].origen} → {grupo[0].destino}</p>
            <p><strong>Fecha:</strong> {new Date(grupo[0].fecha).toLocaleDateString()} <strong>| Hora:</strong> {grupo[0].hora}</p>
            <div className="asientos">
              {grupo.map((r, i) => (
                <span key={i} className="asiento-label">{r.asiento}</span>
              ))}
            </div>

            {grupo[0].estado === 'pendiente' && (
              <div className="acciones-reserva">
                <button className="btn-confirmar" onClick={() => aceptarReserva(grupo)}>Aceptar</button>
                <button className="btn-rechazar" onClick={() => rechazarReserva(grupo)}>Rechazar</button>
              </div>
            )}

            {generarMapaAsientos(grupo)}
          </div>
        ))}
      </div>
    </div>
  );
}
