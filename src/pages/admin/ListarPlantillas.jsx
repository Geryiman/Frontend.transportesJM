import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/plantillas.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function VerPlantilla() {
  const [plantillas, setPlantillas] = useState([]);
  const [estructuras, setEstructuras] = useState({});
  const [editandoId, setEditandoId] = useState(null);
  const [nombreTemporal, setNombreTemporal] = useState('');

  useEffect(() => {
    fetchPlantillas();
  }, []);

  const fetchPlantillas = async () => {
    try {
      const res = await axios.get(`${API_URL}/viajes/plantillas`);
      setPlantillas(res.data);
      res.data.forEach(p => fetchEstructura(p.id));
    } catch (err) {
      console.error('Error al cargar plantillas:', err);
    }
  };

  const fetchEstructura = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/viajes/plantillas/${id}/estructura`);
      setEstructuras(prev => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error('Error al cargar estructura:', err);
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Estás seguro de eliminar esta plantilla?');
    if (!confirmar) return;
    try {
      await axios.delete(`${API_URL}/viajes/plantillas/${id}`);
      fetchPlantillas();
    } catch (err) {
      console.error('Error al eliminar plantilla:', err);
    }
  };

  const handleDoubleClick = (id, nombre) => {
    setEditandoId(id);
    setNombreTemporal(nombre);
  };

  const handleGuardarNombre = async (id) => {
    try {
      await axios.put(`${API_URL}/viajes/plantillas/${id}`, { nombre: nombreTemporal });
      setEditandoId(null);
      fetchPlantillas();
    } catch (err) {
      console.error('Error al actualizar nombre:', err);
    }
  };

  const renderMiniMatriz = (estructura) => {
    if (!estructura.length) return <span>Cargando...</span>;
    const filas = Math.max(...estructura.map(e => e.fila)) + 1;
    const cols = Math.max(...estructura.map(e => e.col)) + 1;

    const matriz = Array.from({ length: filas }, () => Array.from({ length: cols }, () => null));

    estructura.forEach(({ fila, col, tipo }) => {
      matriz[fila][col] = tipo;
    });

    return (
      <div className="mini-matriz">
        {matriz.map((fila, i) => (
          <div key={i} className="mini-fila">
            {fila.map((tipo, j) => (
              <div key={j} className={`mini-celda ${tipo || 'vacia'}`} title={tipo} />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="plantillas-container">
      <h2>Plantillas de Unidad</h2>
      <div className="plantillas-grid">
        {plantillas.map((p) => (
          <div key={p.id} className="plantilla-card">
            {editandoId === p.id ? (
              <input
                type="text"
                value={nombreTemporal}
                onChange={(e) => setNombreTemporal(e.target.value)}
                onBlur={() => handleGuardarNombre(p.id)}
                autoFocus
              />
            ) : (
              <h3 onDoubleClick={() => handleDoubleClick(p.id, p.nombre)}>{p.nombre}</h3>
            )}
            <p>Tipo: {p.tipo}</p>
            <p>Asientos: {p.total_asientos}</p>
            {p.descripcion && <p className="descripcion">📝 {p.descripcion}</p>}
            <div className="preview-miniatura">
              {estructuras[p.id] ? renderMiniMatriz(estructuras[p.id]) : <span>Cargando...</span>}
            </div>
            <div className="botones-acciones">
              <button onClick={() => handleEliminar(p.id)}>🗑 Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}