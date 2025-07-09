import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/MisViajes.css'; // Asegúrate de tener este archivo CSS
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

export default function MisViajes() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const [viajesFuturos, setViajesFuturos] = useState([]);
  const [viajesPasados, setViajesPasados] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    obtenerViajes();
  }, [estadoFiltro, fechaDesde, fechaHasta]);

  const obtenerViajes = async () => {
    try {
const res = await axios.get(`${API_URL}/auth/reservas/${usuario.id}`, {
  params: { estado, desde, hasta }
});
      const ahora = new Date();
      const futuros = [];
      const pasados = [];

      res.data.reservas.forEach(viaje => {
        const [h, m] = viaje.hora.split(':');
        const fechaViaje = new Date(viaje.fecha);
        fechaViaje.setHours(Number(h));
        fechaViaje.setMinutes(Number(m));
        fechaViaje.setSeconds(0);
        fechaViaje.setMilliseconds(0);

        const fechaStr = viaje.fecha.slice(0, 10); // yyyy-mm-dd

        const pasaEstado = !estadoFiltro || viaje.estado === estadoFiltro;
        const pasaDesde = !fechaDesde || fechaStr >= fechaDesde;
        const pasaHasta = !fechaHasta || fechaStr <= fechaHasta;

        if (pasaEstado && pasaDesde && pasaHasta) {
          if (fechaViaje >= ahora) {
            futuros.push(viaje);
          } else {
            pasados.push(viaje);
          }
        }
      });

      // Ordenar por fecha y hora ascendente
      const ordenar = (a, b) => {
        const d1 = new Date(`${a.fecha}T${a.hora}`);
        const d2 = new Date(`${b.fecha}T${b.hora}`);
        return d1 - d2;
      };

      setViajesFuturos(futuros.sort(ordenar));
      setViajesPasados(pasados.sort(ordenar));
    } catch {
      toast.error('❌ Error al cargar los viajes');
    }
  };

  const renderViaje = (viaje, index, esFuturo) => (
    <div key={index} className={`viaje-card ${esFuturo ? 'futuro' : 'pasado'}`}>
      <p><strong>Origen:</strong> {viaje.origen}</p>
      <p><strong>Destino:</strong> {viaje.destino}</p>
      <p><strong>Fecha:</strong> {new Date(viaje.fecha).toLocaleDateString()} <strong>| Hora:</strong> {viaje.hora}</p>
      <p><strong>Asiento:</strong> {viaje.asiento}</p>
      <p><strong>Estado:</strong> {
        viaje.estado === 'confirmada'
          ? '✅ Confirmado'
          : viaje.estado === 'rechazada'
            ? '❌ Rechazado'
            : '⏳ Pendiente'
      }</p>
    </div>
  );

  return (
    <div className="notificaciones-container">
      <h2>🚌 Mis Viajes</h2>

      <div className="filtros">
        <label>Estado:</label>
        <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
          <option value="">-- Todos --</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="rechazada">Rechazada</option>
        </select>

        <label>Desde:</label>
        <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />

        <label>Hasta:</label>
        <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
      </div>

      <h3>🚀 Viajes Próximos</h3>
      <div className="lista-solicitudes">
        {viajesFuturos.length === 0 ? <p>No hay viajes próximos.</p> : viajesFuturos.map((v, i) => renderViaje(v, i, true))}
      </div>

      <h3>📁 Historial de Viajes</h3>
      <div className="lista-solicitudes">
        {viajesPasados.length === 0 ? <p>No hay viajes pasados.</p> : viajesPasados.map((v, i) => renderViaje(v, i, false))}
      </div>
    </div>
  );
}
