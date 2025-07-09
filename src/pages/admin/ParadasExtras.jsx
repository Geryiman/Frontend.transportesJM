import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/ParadasExtras.css';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

export default function ParadasExtras() {
  const [paradas, setParadas] = useState([]);
  const [nombrePlantilla, setNombrePlantilla] = useState('');
  const [nuevaParada, setNuevaParada] = useState('');
  const [listaActual, setListaActual] = useState([]);

  const [lugares, setLugares] = useState([]);
  const [nuevoLugar, setNuevoLugar] = useState('');

  const [mostrarParadas, setMostrarParadas] = useState(true);
  const [mostrarLugares, setMostrarLugares] = useState(true);

  useEffect(() => {
    obtenerParadas();
    obtenerLugares();
  }, []);

  const obtenerParadas = async () => {
    try {
      const res = await axios.get(`${API_URL}/paradas`);
      setParadas(res.data);
    } catch {
      toast.error('Error al obtener plantillas de paradas');
    }
  };

  const agregarParadaTemporal = () => {
    if (!nuevaParada.trim()) return toast.warn('Ingresa el nombre de la parada');
    setListaActual([...listaActual, nuevaParada.trim()]);
    setNuevaParada('');
  };

  const guardarPlantilla = async () => {
    if (!nombrePlantilla.trim() || listaActual.length === 0) return toast.warn('Completa el nombre y la lista');
    try {
      await axios.post(`${API_URL}/paradas`, {
        nombre: nombrePlantilla,
        lista: listaActual,
      });
      toast.success('Plantilla de paradas guardada');
      setNombrePlantilla('');
      setListaActual([]);
      obtenerParadas();
    } catch {
      toast.error('Error al guardar plantilla');
    }
  };

  const eliminarPlantilla = async (id) => {
    try {
      await axios.delete(`${API_URL}/paradas/${id}`);
      toast.success('Plantilla eliminada');
      obtenerParadas();
    } catch {
      toast.error('Error al eliminar plantilla');
    }
  };

  const obtenerLugares = async () => {
    try {
      const res = await axios.get(`${API_URL}/paradas/lugares`);
      setLugares(res.data);
    } catch {
      toast.error('Error al obtener lugares');
    }
  };

  const agregarLugar = async () => {
    if (!nuevoLugar.trim()) return toast.warn('Ingresa el nombre del lugar');
    try {
      await axios.post(`${API_URL}/paradas/lugares`, { nombre: nuevoLugar.trim() });
      toast.success('Lugar agregado');
      setNuevoLugar('');
      obtenerLugares();
    } catch {
      toast.error('Error al agregar lugar');
    }
  };

  const eliminarLugar = async (id) => {
    try {
      await axios.delete(`${API_URL}/paradas/lugares/${id}`);
      toast.success('Lugar eliminado');
      obtenerLugares();
    } catch {
      toast.error('Error al eliminar lugar');
    }
  };

  return (
    <div className="paradas-container">
      <h2>📍 Gestión de Paradas y Lugares</h2>

      <div className="seccion">
        <h3 onClick={() => setMostrarParadas(!mostrarParadas)} className="seccion-titulo">
          📋 Plantillas de Paradas {mostrarParadas ? '▲' : '▼'}
        </h3>
        {mostrarParadas && (
          <>
            <div className="form-agregar">
              <input
                type="text"
                placeholder="Nombre de la plantilla"
                value={nombrePlantilla}
                onChange={(e) => setNombrePlantilla(e.target.value)}
              />
              <div className="lista-temporal">
                <input
                  type="text"
                  placeholder="Agregar parada"
                  value={nuevaParada}
                  onChange={(e) => setNuevaParada(e.target.value)}
                />
                <button onClick={agregarParadaTemporal}>Añadir</button>
              </div>
              <ul>
                {listaActual.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
              <button onClick={guardarPlantilla}>Guardar Plantilla</button>
            </div>

            <ul className="lista-paradas">
              {paradas.map((p) => (
                <li key={p.id}>
                  <strong>{p.nombre}</strong>: {p.lista?.join(', ')}
                  <button className="eliminar" onClick={() => eliminarPlantilla(p.id)}>🗑</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="seccion">
        <h3 onClick={() => setMostrarLugares(!mostrarLugares)} className="seccion-titulo">
          🗺 Lugares principales (Origen / Destino) {mostrarLugares ? '▲' : '▼'}
        </h3>
        {mostrarLugares && (
          <>
            <div className="form-agregar">
              <input
                type="text"
                placeholder="Nuevo lugar"
                value={nuevoLugar}
                onChange={(e) => setNuevoLugar(e.target.value)}
              />
              <button onClick={agregarLugar}>Agregar</button>
            </div>

            <ul className="lista-paradas">
              {lugares.map((lugar) => (
                <li key={lugar.id}>
                  {lugar.nombre}
                  <button className="eliminar" onClick={() => eliminarLugar(lugar.id)}>🗑</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
