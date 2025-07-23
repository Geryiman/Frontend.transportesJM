import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../../styles/DetalleViaje.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function DetalleViaje() {
  const { id } = useParams();
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState('');

  const cargarViaje = () => {
    axios.get(`${API_URL}/viajes-detalle/${id}/detalle`)
      .then(res => {
        setViaje(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar viaje', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarViaje();
  }, [id]);

  const confirmarReservas = async (nombre_pasajero) => {
    try {
      await axios.post(`${API_URL}/reservas/confirmar-multiples`, {
        id_viaje: viaje.id_viaje || viaje.id,
        nombre_pasajero,
      });
      cargarViaje();
    } catch (err) {
      console.error('Error al confirmar reservas', err);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) return <p>Cargando detalles del viaje...</p>;
  if (!viaje) return <p>Error al cargar detalles.</p>;

  return (
    <div className="detalle-viaje">
      <h2>Viaje: {viaje.origen} → {viaje.destino}</h2>
      <p><strong>Fecha:</strong> {formatearFecha(viaje.fecha)} <strong>Hora:</strong> {viaje.hora}</p>
      <p><strong>Precio:</strong> ${viaje.precio}</p>

      {viaje.unidades.map((unidad, i) => (
        <div key={i} className="unidad">
          <h3>Unidad: {unidad.nombre_unidad} | Conductor: {unidad.conductor}</h3>

          <div className="plantilla">
            {renderPlantilla(unidad.plantilla.estructura, unidad.reservas, setTooltip)}
            {tooltip && <div className="tooltip-activo">{tooltip}</div>}
          </div>

          <div className="leyenda">
            <div className="leyenda-item"><div className="cuadro" style={{ backgroundColor: '#4caf50' }} /> Libre</div>
            <div className="leyenda-item"><div className="cuadro" style={{ backgroundColor: '#2196f3' }} /> Conductor</div>
            <div className="leyenda-item"><div className="cuadro" style={{ backgroundColor: '#e0e0e0' }} /> Pasillo</div>
            <div className="leyenda-item"><div className="cuadro" style={{ backgroundColor: '#ff9800' }} /> Reservado</div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="leyenda-item">
                <div className={`cuadro grupo-${i}`} /> Grupo {i + 1}
              </div>
            ))}
          </div>

          <h4>Pasajeros:</h4>
          <ul className="lista-pasajeros">
            {unidad.reservas
              .filter(r => r.estado === 'confirmada' || r.estado === 'pendiente')
              .map((r, idx) => (
                <li key={idx}>
                  <strong>{r.nombre_pasajero}</strong> — 
                  <span> Subida: {r.sube_en || 'Terminal'} / Bajada: {r.baja_en || 'Terminal'}</span> — 
                  <span> Asientos: {r.asientos.join(', ')}</span> — 
                  <span> Pago: {r.metodo_pago === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}</span> 
                  {r.metodo_pago === 'tarjeta' && r.pago_confirmado && (
                    <span className="badge badge-pagado">✔ Pagado</span>
                  )}
                  {r.estado === 'pendiente' && (
                    <>
                      <span className="badge badge-pendiente">Pendiente</span>
                      <button
                        className="btn-confirmar"
                        onClick={() => confirmarReservas(r.nombre_pasajero)}
                      >
                        Confirmar
                      </button>
                    </>
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function renderPlantilla(estructura, reservas, setTooltip) {
  const filas = Math.max(...estructura.map(e => e.fila));
  const columnas = Math.max(...estructura.map(e => e.col));
  const asientoMap = {};

  reservas
    .filter(r => r.estado === 'confirmada' || r.estado === 'pendiente')
    .forEach((r, i) => {
      r.asientos.forEach(asiento => {
        asientoMap[asiento] = { ...r, colorGrupo: `grupo-${i % 10}` };
      });
    });

  const handleClickTooltip = (tooltip) => {
    setTooltip(tooltip);
    setTimeout(() => setTooltip(''), 3000);
  };

  const grid = Array.from({ length: filas }, (_, row) =>
    Array.from({ length: columnas }, (_, col) => {
      const celda = estructura.find(c => c.fila === row + 1 && c.col === col + 1);
      if (!celda) return <div key={`${row}-${col}`} className="celda vacio" />;
      const clase = getClaseAsiento(celda, asientoMap);
      const tooltip = celda.tipo === 'asiento'
        ? (asientoMap[celda.numero]?.nombre_pasajero || 'Libre')
        : (celda.tipo === 'conductor' ? 'Conductor' : 'Pasillo');

      return (
        <div
          key={`${row}-${col}`}
          className={`celda ${clase}`}
          title={tooltip}
          onClick={() => handleClickTooltip(tooltip)}
        >
          {celda.numero}
        </div>
      );
    })
  );

  return (
    <div
      className="grid-plantilla"
      style={{ gridTemplateColumns: `repeat(${columnas}, 40px)` }}
    >
      {grid.flat()}
    </div>
  );
}

function getClaseAsiento(celda, asientoMap) {
  if (celda.tipo === 'pasillo') return 'pasillo';
  if (celda.tipo === 'conductor') return 'conductor';
  if (celda.tipo === 'asiento') {
    const data = asientoMap[celda.numero];
    if (data) {
      return `asiento ${data.estado} ${data.colorGrupo}`;
    }
    return 'asiento libre';
  }
  return 'vacio';
}
