import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/DetalleViaje.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function DetalleViaje() {
  const { id } = useParams();
  const [unidades, setUnidades] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/admin/viajes/${id}/detalle-completo`)
      .then(res => setUnidades(res.data))
      .catch(err => console.error('❌ Error al obtener detalle completo:', err));
  }, [id]);

  const renderPlantilla = (estructura, asientosConfirmados) => {
    const filas = Math.max(...estructura.map(c => c.fila));
    const columnas = Math.max(...estructura.map(c => c.col));

    const grid = Array.from({ length: filas }, () =>
      Array.from({ length: columnas }, () => null)
    );

    estructura.forEach(celda => {
      grid[celda.fila - 1][celda.col - 1] = celda;
    });

    return grid.map((fila, i) => (
      <div key={i} className="fila">
        {fila.map((celda, j) => {
          if (!celda) return <div key={j} className="celda vacia" />;

          let clase = `celda ${celda.tipo}`;
          let contenido = '';
          const reserva = celda.tipo === 'asiento'
            ? asientosConfirmados.find(r => r.asiento === celda.numero)
            : null;

          if (celda.tipo === 'asiento') {
            if (reserva) {
              clase += reserva.estado === 'confirmada' ? ' confirmado' : ' pendiente';
              contenido = celda.numero;
            } else {
              contenido = celda.numero;
            }
          } else if (celda.tipo === 'pasillo') {
            contenido = '🟨';
          } else if (celda.tipo === 'conductor') {
            contenido = '🧑‍✈️';
          }

          return (
            <div
              key={j}
              className={clase}
              title={reserva ? `${reserva.nombre_viajero} (${reserva.estado})` : ''}
            >
              {contenido}
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="detalle-viaje">
      <h2>🚌 Detalle del viaje ID #{id}</h2>
      <Link to="/admin/viajes" className="btn-volver">← Volver</Link>

      {unidades.map((unidad, index) => (
        <div key={index} className="unidad">
          <h3>Unidad #{unidad.numero_unidad} ({unidad.plantilla})</h3>

          <div className="plantilla">
            {renderPlantilla(unidad.estructura_asientos, unidad.asientos_confirmados)}
          </div>

          <h4>📋 Asientos confirmados/pendientes:</h4>
          {unidad.asientos_confirmados.length > 0 ? (
            <ul>
              {unidad.asientos_confirmados.map((r, i) => (
                <li key={i}>
                  {r.asiento}: {r.nombre_viajero} - {r.estado}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-asientos">Sin reservas registradas.</p>
          )}
        </div>
      ))}
    </div>
  );
}
