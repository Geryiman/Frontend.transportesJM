import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ReservarViaje.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function ReservarViaje() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const navigate = useNavigate();

  if (!usuario) return <p style={{ padding: 20, color: 'black' }}>⚠️ Debes iniciar sesión para hacer una reserva.</p>;

  const [todosLosViajes, setTodosLosViajes] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [filtros, setFiltros] = useState({ origen: '', destino: '' });
  const [origenes, setOrigenes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
  const [asientosInfo, setAsientosInfo] = useState([]);
  const [ocupados, setOcupados] = useState([]);
  const [estado, setEstado] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const [reserva, setReserva] = useState({
    nombre_viajero: '',
    telefono_viajero: usuario?.telefono || '',
    sube_en_terminal: true,
    parada_extra: '',
    parada_bajada: ''
  });
  const [paradas, setParadas] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/viajes/disponibles`).then(res => {
      const viajesRaw = res.data;
      setTodosLosViajes(viajesRaw);
      setOrigenes([...new Set(viajesRaw.map(v => v.origen))]);
      setDestinos([...new Set(viajesRaw.map(v => v.destino))]);
    }).catch(() => toast.error('Error al obtener viajes disponibles'));

    axios.get(`${API_URL}/viajes/plantillas-parada`).then(res => {
      setParadas(res.data);
    }).catch(() => toast.error('Error al obtener paradas'));
  }, []);

  const buscarViajes = () => {
    const filtrados = todosLosViajes.filter(v =>
      (!filtros.origen || v.origen === filtros.origen) &&
      (!filtros.destino || v.destino === filtros.destino)
    );
    const unicos = Object.values(
      filtrados.reduce((acc, v) => {
        acc[v.id_viaje] = v;
        return acc;
      }, {})
    );
    setViajes(unicos);
    setEstado(unicos.length === 0 ? 'no_resultados' : '');
  };

  const seleccionarViaje = (viaje) => {
    setViajeSeleccionado(viaje);
    setEstado('cargando');
    setSeleccionados([]);

    axios.get(`${API_URL}/viajes/${viaje.id_viaje}/asientos`).then(res => {
      setAsientosInfo(res.data.estructuras);
      setOcupados(res.data.ocupados.map(o => `${o.id_unidad_viaje}-${String(o.asiento)}`));
      setEstado('');
    }).catch(() => {
      toast.error('❌ Error al cargar asientos disponibles');
      setEstado('');
    });
  };

  const toggleAsiento = (unidadId, numero) => {
    const clave = `${unidadId}-${numero}`;
    if (ocupados.includes(clave)) return;

    const yaSeleccionado = seleccionados.find(a => a.clave === clave);
    if (yaSeleccionado) {
      setSeleccionados(prev => prev.filter(a => a.clave !== clave));
    } else {
      if (seleccionados.length >= 6) {
        toast.warn('⚠️ No puedes seleccionar más de 6 asientos');
        return;
      }
      setSeleccionados(prev => [...prev, { clave, id_unidad_viaje: unidadId, asiento: numero }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstado('enviando');

    if (!reserva.nombre_viajero || seleccionados.length === 0) {
      setEstado('');
      return toast.warn('⚠️ Faltan datos de la reserva');
    }

    if (reserva.parada_bajada && reserva.parada_extra && reserva.parada_bajada === reserva.parada_extra) {
      setEstado('');
      return toast.warn('⚠️ La parada de bajada no puede ser igual a la de subida');
    }

    try {
      const asientosRes = await axios.get(`${API_URL}/viajes/${viajeSeleccionado.id_viaje}/asientos`);
      const actuales = asientosRes.data.ocupados.map(o => `${o.id_unidad_viaje}-${String(o.asiento)}`);
      const repetidos = seleccionados.filter(sel => actuales.includes(sel.clave));

      if (repetidos.length > 0) {
        setOcupados(actuales);
        toast.error('❌ Uno o más asientos ya fueron reservados. Se ha actualizado la lista.');
        setSeleccionados(sel => sel.filter(s => !actuales.includes(s.clave)));
        setEstado('');
        return;
      }

      for (const sel of seleccionados) {
        await axios.post(`${API_URL}/viajes/reservas`, {
          id_usuario: usuario.id,
          ...reserva,
          id_unidad_viaje: sel.id_unidad_viaje,
          asiento: sel.asiento
        });
      }

      toast.success('✅ Reserva enviada. El administrador la confirmará pronto.');
      setEstado('confirmado');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Error al reservar: ' + (err.response?.data?.error || 'Error desconocido'));
      setEstado('');
    }
  };

  return (
    <div className="reserva-container">
      <h2 style={{ color: 'black' }}>Reservar un Viaje</h2>

      {!viajeSeleccionado ? (
        <>
          <div className="form-busqueda">
            <label style={{ color: 'black' }}>Origen:</label>
            <select value={filtros.origen} onChange={e => setFiltros({ ...filtros, origen: e.target.value })}>
              <option value="">Selecciona origen</option>
              {origenes.map((origen, i) => <option key={i} value={origen}>{origen}</option>)}
            </select>

            <label style={{ color: 'black' }}>Destino:</label>
            <select value={filtros.destino} onChange={e => setFiltros({ ...filtros, destino: e.target.value })}>
              <option value="">Selecciona destino</option>
              {destinos.map((destino, i) => <option key={i} value={destino}>{destino}</option>)}
            </select>

            <button onClick={buscarViajes}>Buscar viajes</button>
          </div>

          {estado === 'no_resultados' && <p style={{ color: 'black' }}>No se encontraron viajes para esa búsqueda.</p>}

          <div className="lista-viajes">
            {viajes.map((v, i) => (
              <div key={i} className="viaje-card" onClick={() => seleccionarViaje(v)}>
                <h4>{v.origen} → {v.destino}</h4>
                <p><strong>Fecha:</strong> {new Date(v.fecha).toLocaleDateString()}</p>
                <p><strong>Hora:</strong> {v.hora}</p>
                <p><strong>Precio:</strong> ${v.precio}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setViajeSeleccionado(null)}>← Volver</button>
          <h3 style={{ color: 'black' }}>{viajeSeleccionado.origen} → {viajeSeleccionado.destino}</h3>

          <div className="info-viaje">
            <p><strong>Fecha:</strong> {new Date(viajeSeleccionado.fecha).toLocaleDateString()}</p>
            <p><strong>Hora:</strong> {viajeSeleccionado.hora}</p>
            <p><strong>Precio:</strong> ${viajeSeleccionado.precio}</p>
          </div>

          <form onSubmit={handleSubmit} className="form-reserva">
            <label style={{ color: 'black' }}>Nombre del pasajero:</label>
            <input
              type="text"
              value={reserva.nombre_viajero}
              onChange={e => setReserva({ ...reserva, nombre_viajero: e.target.value })}
              required
            />

            <label style={{ color: 'black' }}>Teléfono (opcional):</label>
            <input
              type="text"
              value={reserva.telefono_viajero}
              onChange={e => setReserva({ ...reserva, telefono_viajero: e.target.value })}
            />

            <label style={{ color: 'black' }}>Parada de bajada:</label>
            <select
              value={reserva.parada_bajada || ''}
              onChange={e => setReserva({ ...reserva, parada_bajada: e.target.value })}
            >
              <option value="">Selecciona una opción</option>
              {paradas.flatMap(p => {
                try {
                  const lista = Array.isArray(p.lista) ? p.lista : JSON.parse(p.lista);
                  return lista
                    .filter(nombre => nombre !== reserva.parada_extra)
                    .map((nombre, i) => (
                      <option key={`bajada-${p.id}-${i}`} value={nombre.toString()}>{nombre}</option>
                    ));
                } catch (error) {
                  return [];
                }
              })}
            </select>


            <label style={{ color: 'black' }}>
              <input
                type="checkbox"
                checked={!reserva.sube_en_terminal}
                onChange={e => setReserva({ ...reserva, sube_en_terminal: !e.target.checked })}
              />
              Sube en una parada diferente
            </label>

            {!reserva.sube_en_terminal && (
              <>
                <label style={{ color: 'black' }}>Parada de subida:</label>
                <select
                  value={reserva.parada_extra || ''}
                  onChange={e => setReserva({ ...reserva, parada_extra: e.target.value })}
                >
                  <option value="">Selecciona una opción</option>
                  {paradas.flatMap(p => {
                    try {
                      const lista = Array.isArray(p.lista) ? p.lista : JSON.parse(p.lista);
                      return lista
                        .filter(nombre => nombre !== reserva.parada_bajada)
                        .map((nombre, i) => (
                          <option key={`subida-${p.id}-${i}`} value={nombre.toString()}>{nombre}</option>
                        ));
                    } catch (error) {
                      return [];
                    }
                  })}
                </select>
              </>
            )}


            <div className="simbologia">
              <span><span className="cuadro disponible"></span> Disponible</span>
              <span><span className="cuadro ocupado"></span> Ocupado</span>
              <span><span className="cuadro seleccionado"></span> Seleccionado</span>
              <span><span className="cuadro conductor"></span> Conductor</span>
              <span><span className="cuadro pasillo"></span> Pasillo</span>
              <p className='maximo'>Solo se pueden seleccionar 6 asientos por formulario</p>
            </div>

            {[...new Set(asientosInfo.map(a => a.id_unidad))].sort().map((unidadId, indexUnidad) => {
              const asientosUnidad = asientosInfo.filter(a => a.id_unidad === unidadId);
              const maxCol = Math.max(...asientosUnidad.map(a => a.col));
              const maxRow = Math.max(...asientosUnidad.map(a => a.fila));

              return (
                <div key={unidadId}>
                  <h4 style={{ color: 'black' }}>Unidad #{indexUnidad + 1}</h4>
                  <div
                    className="unidades-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${maxCol}, 40px)`,
                      gridTemplateRows: `repeat(${maxRow}, 40px)`
                    }}
                  >
                    {asientosUnidad.map((asiento, index) => {
                      const clave = `${asiento.id_unidad}-${asiento.numero}`;
                      const ocupado = ocupados.includes(clave);
                      const seleccionado = seleccionados.find(sel => sel.clave === clave);

                      return (
                        <div
                          key={index}
                          className={`asiento ${ocupado ? 'ocupado' : ''} ${seleccionado ? 'seleccionado' : ''} ${asiento.tipo}`}
                          style={{ gridColumn: (maxCol - asiento.col + 1), gridRow: asiento.fila }}
                          onClick={() => asiento.tipo === 'asiento' && !ocupado && toggleAsiento(asiento.id_unidad, asiento.numero)}
                        >
                          {asiento.tipo === 'asiento' ? asiento.numero : asiento.tipo === 'pasillo' ? 'P' : 'C'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <button type="submit" disabled={estado === 'enviando'}>
              Confirmar Reserva
            </button>
            {estado === 'enviando' && <p style={{ color: 'black' }}>Procesando su reserva...</p>}
            {estado === 'confirmado' && <p style={{ color: 'green' }}>✅ Reserva realizada. El administrador confirmará su lugar.</p>}
          </form>
        </>
      )}
    </div>
  );
}
