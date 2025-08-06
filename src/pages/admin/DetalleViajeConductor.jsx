import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/DetalleViajeConductor.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function DetalleViajeConductor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState(null);
  const [estructura, setEstructura] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [celdas, setCeldas] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/conductor/viaje/${id}/detalle`)
      .then(res => {
        const { viaje, estructura, reservas } = res.data;
        setViaje(viaje);
        setEstructura(estructura);
        setReservas(reservas);
        construirMatriz(estructura, reservas);
      })
      .catch(err => console.error('❌ Error al cargar el viaje:', err));
  }, [id]);

  const construirMatriz = (estructura, reservas) => {
    const maxFila = Math.max(...estructura.map(e => e.fila));
    const maxCol = Math.max(...estructura.map(e => e.col));
    const matriz = Array.from({ length: maxFila }, () => Array(maxCol).fill(null));

    estructura.forEach(celda => {
      matriz[celda.fila - 1][celda.col - 1] = { ...celda };
    });

    reservas.forEach(r => {
      const celda = estructura.find(c => c.numero === r.asiento);
      if (celda && r.estado === 'confirmada') {
        celda.reserva = r;
      }
    });

    setCeldas(matriz);
  };

  const getGrupoClass = (grupo) => `grupo-${(grupo - 1) % 10}`;

  // Agrupar reservas confirmadas por grupo
  const reservasAgrupadas = reservas
    .filter(r => r.estado === 'confirmada')
    .reduce((grupos, r) => {
      if (!grupos[r.grupo]) {
        grupos[r.grupo] = { grupo: r.grupo, nombre: r.nombre_viajero, metodo_pago: r.metodo_pago, asientos: [] };
      }
      grupos[r.grupo].asientos.push(r.asiento);
      return grupos;
    }, {});

const irACuentas = () => {
  if (!id) {
    console.warn("⚠️ El ID del viaje no está disponible desde useParams.");
    return;
  }
  navigate(`/admin/cuentas-viaje-conductor/${id}`);
};


  return (
    <div className="detalle-viaje">
      <h2> Detalle del viaje</h2>

      {viaje ? (
        <>
          <p><strong>Origen:</strong> {viaje.origen}</p>
          <p><strong>Destino:</strong> {viaje.destino}</p>
          <p><strong>Fecha:</strong> {new Date(viaje.fecha).toLocaleDateString('es-MX')}</p>
          <p><strong>Hora:</strong> {viaje.hora}</p>
          <p><strong>Unidad:</strong> {viaje.nombre_plantilla}</p>

          <div className="grid-plantilla">
            {celdas.map((fila, i) => (
              <div key={i} className="fila">
                {fila.map((celda, j) => {
                  if (!celda) return <div key={j} className="celda vacio" />;

                  let clase = `celda ${celda.tipo}`;
                  if (celda.tipo === 'asiento') {
                    const r = reservas.find(r => r.estado === 'confirmada' && r.asiento === celda.numero);
                    if (r) {
                      clase += ` confirmada ${getGrupoClass(r.grupo)}`;
                    } else {
                      clase += ' libre';
                    }
                  }

                  return (
                    <div key={j} className={clase}>
                      {celda.numero}
                      {celda.reserva && (
                        <div className="tooltip-text">
                          <strong>Grupo {celda.reserva.grupo}</strong><br />
                          <span className="pago-pequeño">Pago: {celda.reserva.metodo_pago}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <h3>🧾 Pasajeros confirmados</h3>
          <table className="tabla-pasajeros">
            <thead>
              <tr>
                <th>Asientos</th>
                <th>Nombre</th>
                <th>Grupo</th>
                <th>Método de pago</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(reservasAgrupadas).map((grupo, i) => (
                <tr key={i} className={getGrupoClass(grupo.grupo)}>
                  <td>{grupo.asientos.join(', ')}</td>
                  <td>{grupo.nombre}</td>
                  <td><strong>Grupo {grupo.grupo}</strong></td>
                  <td className="pago-pequeño">{grupo.metodo_pago}</td>
                </tr>
              ))}
            </tbody>
          </table>

       {/* <button className="btn-cuentas" onClick={irACuentas}>
  Ir a cuentas del viaje
</button> */}

        </>
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
}
