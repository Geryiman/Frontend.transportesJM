import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/ViajesPanel.css';
import { FaClipboardList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function PanelConductor() {
  const [viajesHoy, setViajesHoy] = useState([]);
  const [viajesProximos, setViajesProximos] = useState([]);
  const [viajesPasados, setViajesPasados] = useState([]);
  const navigate = useNavigate();

  const adminData = JSON.parse(localStorage.getItem('adminData'));

  useEffect(() => {
    if (!adminData || adminData.rol !== 'conductor') return;

    axios.get(`${API_URL}/conductor/${adminData.id}/viajes`)
      .then(res => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Normaliza fecha

        const hoyLista = [];
        const proximosLista = [];
        const pasadosLista = [];

        res.data.forEach(viaje => {
          const fechaViaje = new Date(viaje.fecha);
          fechaViaje.setHours(0, 0, 0, 0);

          const diferenciaDias = (fechaViaje - hoy) / (1000 * 60 * 60 * 24); // en días

          if (diferenciaDias === 0) {
            hoyLista.push(viaje);
          } else if (diferenciaDias > 0) {
            proximosLista.push(viaje);
          } else if (diferenciaDias >= -3) {
            pasadosLista.push(viaje);
          }
        });

        setViajesHoy(hoyLista);
        setViajesProximos(proximosLista);
        setViajesPasados(pasadosLista);
      })
      .catch(err => {
        console.error('Error al cargar viajes del conductor:', err);
      });
  }, []);

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const irADetalle = (idViaje) => {
    navigate(`/admin/panel-conductor/viaje/${idViaje}`);
  };

  const renderViajes = (viajes, titulo, colorClase) => (
    viajes.length > 0 && (
      <div className={`seccion-viajes ${colorClase}`}>
        <h3>{titulo}</h3>
        <div className="lista-viajes">
          {viajes.map((viaje) => (
            <div
              className="tarjeta-viaje"
              key={viaje.id_viaje}
              onClick={() => irADetalle(viaje.id_viaje)}
            >
              <h4>{viaje.origen} ➜ {viaje.destino}</h4>
              <p><strong>Fecha:</strong> {formatearFecha(viaje.fecha)}</p>
              <p><strong>Hora:</strong> {viaje.hora}</p>
              <p><strong>Unidad:</strong> {viaje.nombre_plantilla}</p>
              <p><strong>Estado:</strong> {viaje.estado === 'disponible' ? '🟢 Disponible' : '🔴 Finalizado'}</p>
            </div>
          ))}
        </div>
      </div>
    )
  );

  return (
    <div className="viajes-panel-container">
      <h2><FaClipboardList /> Mis viajes asignados</h2>

      {viajesHoy.length === 0 && viajesProximos.length === 0 && viajesPasados.length === 0 ? (
        <p>No tienes viajes asignados.</p>
      ) : (
        <>
          {renderViajes(viajesHoy, '🔵 Viajes de hoy', 'hoy')}
          {renderViajes(viajesProximos, '🟢 Próximos viajes', 'proximos')}
          {renderViajes(viajesPasados, '🔴 Viajes recientes (últimos 3 días)', 'pasados')}
        </>
      )}
    </div>
  );
}
