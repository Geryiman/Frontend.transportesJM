import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/ViajesPanel.css';
import { FaClipboardList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function ViajesPanel() {
  const [viajes, setViajes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/viajes-detalle`)
      .then(res => setViajes(res.data))
      .catch(err => {
        console.error('❌ Error al cargar viajes:', err);
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

  const irADetalle = (id) => {
    window.open(`/admin/viaje/${id}`, '_blank');
  };

  return (
    <div className="viajes-panel-container">
      <h2><FaClipboardList /> Lista de viajes registrados</h2>

      {viajes.length === 0 ? (
        <p>No hay viajes registrados.</p>
      ) : (
        <div className="lista-viajes">
          {viajes.map((viaje) => (
            <div className="tarjeta-viaje" key={viaje.id} onClick={() => irADetalle(viaje.id)}>
              <h3>{viaje.origen} ➜ {viaje.destino}</h3>
              <p><strong>Fecha:</strong> {formatearFecha(viaje.fecha)}</p>
              <p><strong>Hora:</strong> {viaje.hora}</p>
              <p><strong>Precio:</strong> ${viaje.precio}</p>
              <p><strong>Conductor:</strong> {viaje.conductor || '—'}</p>
              <p><strong>Confirmados:</strong> {viaje.confirmados}</p>
              <p><strong>Pendientes:</strong> {viaje.pendientes}</p>
              <p><strong>Estado:</strong> {viaje.finalizado_en ? 'Finalizado' : 'Disponible'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
