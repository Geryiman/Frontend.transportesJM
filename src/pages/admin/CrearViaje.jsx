import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/CrearViaje.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function CrearViaje() {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [precio, setPrecio] = useState('');
  const [plantilla, setPlantilla] = useState('');
  const [numeroUnidades, setNumeroUnidades] = useState(1);
  const [paradaSubida, setParadaSubida] = useState('');
  const [paradaBajada, setParadaBajada] = useState('');
  const [conductor, setConductor] = useState('');
  const [plantillasUnidad, setPlantillasUnidad] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [plantillasRes, paradasRes, conductoresRes, lugaresRes] = await Promise.all([
        axios.get(`${API_URL}/viajes/plantillas-unidad`),
        axios.get(`${API_URL}/viajes/plantillas-parada`),
        axios.get(`${API_URL}/viajes/admins/conductores`),
        axios.get(`${API_URL}/paradas/lugares`)
      ]);
      setPlantillasUnidad(plantillasRes.data);
      setParadas(paradasRes.data);
      setConductores(conductoresRes.data);
      setLugares(lugaresRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensaje('Error al cargar datos. Verifica que el backend esté ejecutándose.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (origen === destino) {
      setMensaje('Origen y destino no pueden ser iguales');
      return;
    }

    if (numeroUnidades < 1) {
      setMensaje('Debe haber al menos 1 unidad');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/viajes/crear-viaje`, {
        origen,
        destino,
        fecha,
        hora,
        precio: parseFloat(precio),
        id_plantilla_unidad: parseInt(plantilla),
        numero_unidades: parseInt(numeroUnidades),
        id_parada_subida: paradaSubida || null,
        id_parada_bajada: paradaBajada || null,
        id_conductor: conductor || null
      });

      setMensaje(res.data.message || 'Viaje creado correctamente');
    } catch (error) {
      console.error(error);
      setMensaje('Error al crear el viaje');
    }
  };

  return (
    <div className="form-container">
      <h2>Crear nuevo viaje</h2>
      {mensaje && <p className="mensaje-error">{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <select value={origen} onChange={e => setOrigen(e.target.value)} required>
          <option value="">Selecciona origen</option>
          {lugares.map(l => (
            <option key={l.id} value={l.nombre}>{l.nombre}</option>
          ))}
        </select>

        <select value={destino} onChange={e => setDestino(e.target.value)} required>
          <option value="">Selecciona destino</option>
          {lugares.filter(l => l.nombre !== origen).map(l => (
            <option key={l.id} value={l.nombre}>{l.nombre}</option>
          ))}
        </select>

        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
        <input type="time" value={hora} onChange={e => setHora(e.target.value)} required />
        <input type="number" placeholder="Precio" value={precio} onChange={e => setPrecio(e.target.value)} required />

        <select value={plantilla} onChange={e => setPlantilla(e.target.value)} required>
          <option value="">Seleccionar plantilla de unidad</option>
          {plantillasUnidad.map(p => (
            <option key={p.id} value={p.id}>{p.nombre} ({p.tipo})</option>
          ))}
        </select>

        <input type="number" min={1} value={numeroUnidades} onChange={e => setNumeroUnidades(e.target.value)} required placeholder="Número de unidades" />

        <select value={paradaSubida} onChange={e => setParadaSubida(e.target.value)}>
          <option value="">Sin paradas de subida</option>
          {paradas.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        <select value={paradaBajada} onChange={e => setParadaBajada(e.target.value)}>
          <option value="">Sin paradas de bajada</option>
          {paradas.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        <select value={conductor} onChange={e => setConductor(e.target.value)}>
          <option value="">Seleccionar conductor</option>
          {conductores.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <button type="submit">Crear viaje</button>
      </form>
    </div>
  );
}
