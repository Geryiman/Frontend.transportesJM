import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/ListaViajes.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ViajesAdmin() {
  const [viajes, setViajes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/admin/viajes`)
      .then(res => setViajes(res.data))
      .catch(err => console.error('❌ Error cargando viajes', err));
  }, []);

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const irADetalle = (id) => {
   navigate(`/admin/viajes/${id}`);


  };

  return (
    <div className="contenedor-viajes">
      {viajes.map((viaje) => (
        <div
          key={viaje.id}
          className="card-viaje"
          onClick={() => irADetalle(viaje.id)}
        >
          <h3>{formatearFecha(viaje.fecha)} - {viaje.origen} ➞ {viaje.destino}</h3>
          <p><strong>Hora:</strong> {viaje.hora}</p>
          <p><strong>Unidades asignadas:</strong> {viaje.unidades.length}</p>
          <p><strong>Conductores:</strong> {
            viaje.unidades.length > 0
              ? viaje.unidades.map(u => u.nombre_conductor).join(', ')
              : 'Sin asignar'
          }</p>
          <p><strong>Estado:</strong> {viaje.estado}</p>
        </div>
      ))}
    </div>
  );
}
