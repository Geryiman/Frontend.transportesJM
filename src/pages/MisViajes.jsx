import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/MisViajes.css';
import { toast } from 'react-toastify';
import NavbarPrivado from '../components/NavbarPrivado';

const API_URL = import.meta.env.VITE_API_URL;

export default function MisViajes() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const [reservas, setReservas] = useState([]);
  const [estructuraMapas, setEstructuraMapas] = useState({});
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [hoveredUnidadId, setHoveredUnidadId] = useState(null);


  useEffect(() => {
    obtenerReservas();
  }, [estadoFiltro, fechaDesde, fechaHasta, busqueda]);

  const obtenerReservas = async () => {
    try {
      const params = new URLSearchParams();
      if (estadoFiltro) params.append('estado', estadoFiltro);
      if (fechaDesde && fechaHasta) {
        params.append('desde', fechaDesde);
        params.append('hasta', fechaHasta);
      }

      const res = await axios.get(`${API_URL}/auth/reservas/${usuario.id}?${params.toString()}`);

      const filtradas = res.data.filter(v =>
        !busqueda ||
        v.origen.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.destino.toLowerCase().includes(busqueda.toLowerCase()) ||
        (v.telefono && v.telefono.includes(busqueda))
      );

      const agrupadas = agruparPorViaje(filtradas);
      setReservas(agrupadas);
    } catch {
      toast.error('❌ Error al obtener tus reservas');
    }
  };

  const agruparPorViaje = (lista) => {
    const map = {};
    lista.forEach(r => {
      const key = `${r.origen}-${r.destino}-${r.fecha}-${r.hora}-${r.id_unidad_viaje}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return Object.values(map);
  };

  const cargarEstructura = async (unidadId) => {
    if (estructuraMapas[unidadId]) return;
    try {
      const res = await axios.get(`${API_URL}/viajes/${unidadId}/asientos`);
      setEstructuraMapas(prev => ({ ...prev, [unidadId]: res.data.estructuras }));
    } catch {
      toast.error('❌ Error al cargar el mapa de asientos');
    }
  };

  const generarMapaAsientos = (grupo) => {
    const unidadId = grupo[0].id_unidad_viaje;
    if (hoveredUnidadId !== unidadId) return null;

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
          <div key={`${fila}-${col}`} className={`asiento-mapa ${seleccionado ? 'seleccionado' : ''}`}>
            {asiento?.numero || ''}
          </div>
        );
      }
      mapa.push(<div key={fila} className="fila-mapa">{filaAsientos}</div>);
    }

    return <div className="mini-mapa">{mapa}</div>;
  };


  return (
    <>
      <NavbarPrivado />
      <div className="notificaciones-container">
        <h2>🚌 Mis Reservaciones</h2>

        <div className="filtros">
          <label>Estado:</label>
          <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
            <option value="">-- Todos --</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="rechazada">Rechazada</option>
          </select>

          <label>Buscar por origen, destino o teléfono:</label>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar..."
          />

          <label>Desde:</label>
          <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />

          <label>Hasta:</label>
          <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
        </div>

        {reservas.map((grupo, idx) => (
          <div
            key={idx}
            className="solicitud-card"
            onMouseEnter={() => {
              setHoveredUnidadId(grupo[0].id_unidad_viaje);
              cargarEstructura(grupo[0].id_unidad_viaje);
            }}
            onMouseLeave={() => setHoveredUnidadId(null)}
          >

            <p><strong>{grupo.length}</strong> asiento(s)</p>
            <p><strong>Origen:</strong> {grupo[0].origen} → <strong>Destino:</strong> {grupo[0].destino}</p>
            <p><strong>Fecha:</strong> {new Date(grupo[0].fecha).toLocaleDateString()} <strong>| Hora:</strong> {grupo[0].hora}</p>
            <p><strong>Estado:</strong> {
              grupo[0].estado === 'confirmada' ? '✅ Confirmado'
                : grupo[0].estado === 'rechazada' ? '❌ Rechazado'
                  : '⏳ Pendiente'
            }</p>

            <div className="asientos">
              {grupo.map((r, i) => (
                <span key={i} className="asiento-label">{r.asiento}</span>
              ))}
            </div>

            {generarMapaAsientos(grupo)}
          </div>
        ))}
      </div>
    </>
  );
}
