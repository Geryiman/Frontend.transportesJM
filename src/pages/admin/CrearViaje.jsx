import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/CrearViaje.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function CrearViaje() {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [precio, setPrecio] = useState('450'); // ← PRECIO POR DEFECTO
  const [numeroUnidades, setNumeroUnidades] = useState(1);
  const [paradaSubida, setParadaSubida] = useState('');
  const [paradaBajada, setParadaBajada] = useState('');
  const [plantillasUnidad, setPlantillasUnidad] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [unidades, setUnidades] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const nuevasUnidades = Array.from({ length: numeroUnidades }, (_, i) => unidades[i] || { id_plantilla: '', id_conductor: '' });
    setUnidades(nuevasUnidades);
  }, [numeroUnidades]);

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

  const handleUnidadChange = (index, field, value) => {
    const nuevas = [...unidades];
    nuevas[index][field] = value;
    setUnidades(nuevas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (origen === destino) {
      return setMensaje('❌ Origen y destino no pueden ser iguales');
    }

    if (numeroUnidades < 1 || unidades.some(u => !u.id_plantilla || !u.id_conductor)) {
      return setMensaje('❌ Completa plantilla y conductor para todas las unidades');
    }

    const unidadesConNumero = unidades.map((u, index) => ({
      ...u,
      numero_unidad: index + 1 // ← SE AGREGA CAMPO OBLIGATORIO
    }));

    try {
      const res = await axios.post(`${API_URL}/viajes/crear-viaje`, {
        origen,
        destino,
        fecha,
        hora,
        precio: parseFloat(precio),
        id_parada_subida: paradaSubida || null,
        id_parada_bajada: paradaBajada || null,
        unidades: unidadesConNumero
      });
      setMensaje(res.data.message || '✅ Viaje creado correctamente');
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al crear el viaje');
    }
  };

  const plantillasUsadas = unidades.map(u => u.id_plantilla);
  const conductoresUsados = unidades.map(u => u.id_conductor);

  return (
    <div className="form-container">
      <h2>🚌 Crear nuevo viaje</h2>
      {mensaje && <p className="mensaje-error">{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <div className="campo">
          <label>Origen:</label>
          <select value={origen} onChange={e => setOrigen(e.target.value)} required>
            <option value="">Selecciona origen</option>
            {lugares.map(l => (
              <option key={l.id} value={l.nombre}>{l.nombre}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Destino:</label>
          <select value={destino} onChange={e => setDestino(e.target.value)} required>
            <option value="">Selecciona destino</option>
            {lugares.filter(l => l.nombre !== origen).map(l => (
              <option key={l.id} value={l.nombre}>{l.nombre}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Fecha:</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
        </div>

        <div className="campo">
          <label>Hora:</label>
          <input type="time" value={hora} onChange={e => setHora(e.target.value)} required />
        </div>

        <div className="campo">
          <label>Precio:</label>
          <input
            type="number"
            placeholder="Precio"
            value={precio}
            onChange={e => setPrecio(e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label>Unidades:</label>
          <input
            type="number"
            min={1}
            value={numeroUnidades}
            onChange={e => setNumeroUnidades(parseInt(e.target.value) || 1)}
            required
          />
        </div>

        {unidades.map((unidad, i) => (
          <div key={i} className="unidad-box">
            <h4>Unidad #{i + 1}</h4>
            <select
              value={unidad.id_plantilla}
              onChange={e => handleUnidadChange(i, 'id_plantilla', e.target.value)}
              required
            >
              <option value="">Seleccionar plantilla</option>
              {plantillasUnidad.filter(p => !plantillasUsadas.includes(String(p.id)) || String(p.id) === unidad.id_plantilla).map(p => (
                <option key={p.id} value={p.id}>{p.nombre} ({p.tipo})</option>
              ))}
            </select>
            <select
              value={unidad.id_conductor}
              onChange={e => handleUnidadChange(i, 'id_conductor', e.target.value)}
              required
            >
              <option value="">Seleccionar conductor</option>
              {conductores.filter(c => !conductoresUsados.includes(String(c.id)) || String(c.id) === unidad.id_conductor).map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        ))}

        <div className="campo">
          <label>Paradas extra (subida):</label>
          <select value={paradaSubida} onChange={e => setParadaSubida(e.target.value)}>
            <option value="">Sin paradas</option>
            {paradas.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Paradas extra (bajada):</label>
          <select value={paradaBajada} onChange={e => setParadaBajada(e.target.value)}>
            <option value="">Sin paradas</option>
            {paradas.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <button type="submit">Crear viaje</button>
      </form>
    </div>
  );
}
