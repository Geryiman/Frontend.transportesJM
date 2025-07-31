import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/ReservarViaje.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ReservarViaje() {
  const [todosLosViajes, setTodosLosViajes] = useState([]);
  const [filtros, setFiltros] = useState({ origen: '', destino: '' });
  const [origenes, setOrigenes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [viajes, setViajes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/viajes/disponibles`)
      .then(res => {
        const datos = res.data;
        setTodosLosViajes(datos);
        setOrigenes([...new Set(datos.map(v => v.origen))]);
        setDestinos([...new Set(datos.map(v => v.destino))]);
      })
      .catch(() => toast.error("Error al obtener viajes disponibles"));
  }, []);

  const buscarViajes = () => {
    const filtrados = todosLosViajes.filter(v =>
      (!filtros.origen || v.origen === filtros.origen) &&
      (!filtros.destino || v.destino === filtros.destino)
    );
    setViajes(Object.values(filtrados.reduce((acc, v) => {
      acc[v.id_viaje] = v;
      return acc;
    }, {})));
  };

  const seleccionarViaje = (viaje) => {
    navigate(`/reservar/${viaje.id_viaje}/asientos`, { state: { viaje } });
  };

  return (
    <div className="reservar-viaje-container">
      <h2>Reservar un Viaje</h2>

      <div className="filtros">
        <select value={filtros.origen} onChange={e => setFiltros({ ...filtros, origen: e.target.value })}>
          <option value="">Selecciona origen</option>
          {origenes.map((o, i) => <option key={i} value={o}>{o}</option>)}
        </select>

        <select value={filtros.destino} onChange={e => setFiltros({ ...filtros, destino: e.target.value })}>
          <option value="">Selecciona destino</option>
          {destinos.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>

        <button onClick={buscarViajes}>Buscar</button>
      </div>

      <div className="lista-viajes">
        {viajes.map((v, i) => (
          <div key={i} className="card-viaje" onClick={() => seleccionarViaje(v)}>
            <h4>{v.origen} → {v.destino}</h4>
            <p><strong>Fecha:</strong> {new Date(v.fecha).toLocaleDateString()}</p>
            <p><strong>Hora:</strong> {v.hora}</p>
            <p><strong>Precio:</strong> ${v.precio}</p>
            <button>Seleccionar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
