import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/SeleccionarAsientos.css';
const API_URL = import.meta.env.VITE_API_URL;

export default function SeleccionarAsientos() {
  const { id_viaje } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const viaje = location.state?.viaje;
  const [asientosInfo, setAsientosInfo] = useState([]);
  const [ocupados, setOcupados] = useState([]);
  const [confirmados, setConfirmados] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [paradas, setParadas] = useState([]);
  const [estado, setEstado] = useState('');
  const [reserva, setReserva] = useState({
    nombre_viajero: '',
    telefono_viajero: usuario?.telefono || '',
    sube_en_terminal: true,
    parada_extra: '',
    parada_bajada: '',
    metodo_pago: 'efectivo'
  });

  useEffect(() => {
    if (!viaje) return navigate('/');

    axios.get(`${API_URL}/viajes/${id_viaje}/asientos`).then(res => {
      setAsientosInfo(res.data.estructuras);

      const ocupadosClaves = res.data.ocupados.map(o => `${o.id_unidad_viaje}-${o.asiento}`);
      const confirmadosClaves = res.data.confirmados?.map(o => `${o.id_unidad_viaje}-${o.asiento}`) || [];
      const pendientesClaves = res.data.pendientes?.map(o => `${o.id_unidad_viaje}-${o.asiento}`) || [];

      setOcupados(ocupadosClaves);
      setConfirmados(confirmadosClaves);
      setPendientes(pendientesClaves);
    }).catch(() => toast.error('❌ Error al cargar asientos'));

    axios.get(`${API_URL}/viajes/plantillas-parada`).then(res => {
      setParadas(res.data);
    }).catch(() => toast.error('❌ Error al obtener paradas'));
  }, []);

  const toggleAsiento = (unidadId, numero) => {
    const clave = `${unidadId}-${numero}`;
    if (ocupados.includes(clave) || confirmados.includes(clave) || pendientes.includes(clave)) return;

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
      return toast.warn(' Selecciona al menos un asiento ');
    }

    if (reserva.parada_bajada && reserva.parada_extra && reserva.parada_bajada === reserva.parada_extra) {
      setEstado('');
      return toast.warn('⚠️ La parada de bajada no puede ser igual a la de subida');
    }

    try {
      const asientosRes = await axios.get(`${API_URL}/viajes/${id_viaje}/asientos`);
      const actuales = asientosRes.data.ocupados.map(o => `${o.id_unidad_viaje}-${String(o.asiento)}`);
      const repetidos = seleccionados.filter(sel => actuales.includes(sel.clave));

      if (repetidos.length > 0) {
        setOcupados(actuales);
        toast.error('❌ Uno o más asientos ya están ocupados. Se ha actualizado la lista.');
        setSeleccionados(sel => sel.filter(s => !actuales.includes(s.clave)));
        setEstado('');
        return;
      }

      for (const sel of seleccionados) {
        await axios.post(`${API_URL}/viajes/reservas`, {
          id_usuario: usuario.id,
          ...reserva,
          parada_extra_nombre: reserva.parada_extra,
          parada_bajada_nombre: reserva.parada_bajada,
          id_unidad_viaje: sel.id_unidad_viaje,
          asiento: sel.asiento
        });
      }

      toast.success('✅ Reserva realizada correctamente');

      if (reserva.metodo_pago === 'tarjeta') {
        window.open('/pago-con-tarjeta', '_blank');
        navigate('/');
      } else {
        navigate('/confirmacion-reserva');
      }
    } catch (err) {
      console.error(err);
      toast.error('❌ Error al registrar la reserva');
      setEstado('');
    }
  };

  return (
    <div className="reserva-container">
      <h3>Seleccionar Asientos</h3>

      <form onSubmit={handleSubmit} className="form-reserva">
        <label>Nombre del pasajero:</label>
        <input type="text" value={reserva.nombre_viajero} onChange={e => setReserva({ ...reserva, nombre_viajero: e.target.value })} required />

        <label>Teléfono (opcional):</label>
        <input type="text" value={reserva.telefono_viajero} onChange={e => setReserva({ ...reserva, telefono_viajero: e.target.value })} />

        <label>Parada de bajada:</label>
        <select value={reserva.parada_bajada || ''} onChange={e => setReserva({ ...reserva, parada_bajada: e.target.value })}>
          <option value="">Selecciona una opción</option>
          {paradas.flatMap(p => {
            try {
              const lista = Array.isArray(p.lista) ? p.lista : JSON.parse(p.lista);
              return lista.map((nombre, i) => (
                <option key={`bajada-${p.id}-${i}`} value={nombre}>{nombre}</option>
              ));
            } catch { return []; }
          })}
        </select>

  <div className="check-parada">
  <input
    type="checkbox"
    id="parada-checkbox"
    checked={!reserva.sube_en_terminal}
    onChange={e => setReserva({ ...reserva, sube_en_terminal: !e.target.checked })}
  />
  <label htmlFor="parada-checkbox">Sube en una parada diferente</label>
</div>

        {!reserva.sube_en_terminal && (
          <>
            <label>Parada de subida:</label>
            <select value={reserva.parada_extra || ''} onChange={e => setReserva({ ...reserva, parada_extra: e.target.value })}>
              <option value="">Selecciona una opción</option>
              {paradas.flatMap(p => {
                try {
                  const lista = Array.isArray(p.lista) ? p.lista : JSON.parse(p.lista);
                  return lista.map((nombre, i) => (
                    <option key={`subida-${p.id}-${i}`} value={nombre}>{nombre}</option>
                  ));
                } catch { return []; }
              })}
            </select>
          </>
        )}

        <label>Método de pago:</label>
        <select value={reserva.metodo_pago} onChange={e => setReserva({ ...reserva, metodo_pago: e.target.value })}>
          <option value="efectivo">En terminal</option>

        </select>

        <div className="simbologia">
          <span><span className="cuadro disponible"></span> Disponible</span>
          <span><span className="cuadro ocupado"></span> Ocupado</span>
          <span><span className="cuadro seleccionado"></span> Seleccionado</span>
          <span><span className="cuadro pendiente"></span> Pendiente</span>
          <span><span className="cuadro confirmado"></span> Confirmado</span>
          <span><span className="cuadro pasillo"></span> Pasillo</span>
          <span><span className="cuadro conductor"></span> Conductor</span>
        </div>

        {[...new Set(asientosInfo.map(a => a.id_unidad))].sort().map((unidadId, i) => {
          const asientosUnidad = asientosInfo.filter(a => a.id_unidad === unidadId);
          const maxCol = Math.max(...asientosUnidad.map(a => a.col));
          const maxRow = Math.max(...asientosUnidad.map(a => a.fila));

          return (
            <div key={unidadId}>
              <h4>Unidad #{i + 1}</h4>
              <div className="unidades-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${maxCol}, 40px)`, gridTemplateRows: `repeat(${maxRow}, 40px)` }}>
                {asientosUnidad.map((asiento, index) => {
                  const clave = `${asiento.id_unidad}-${asiento.numero}`;
                  const ocupado = ocupados.includes(clave);
                  const confirmado = confirmados.includes(clave);
                  const pendiente = pendientes.includes(clave);
                  const seleccionado = seleccionados.find(sel => sel.clave === clave);

                  return (
                    <div
                      key={index}
                      className={`asiento ${ocupado ? 'ocupado' : ''} ${confirmado ? 'confirmado' : ''} ${pendiente ? 'pendiente' : ''} ${seleccionado ? 'seleccionado' : ''} ${asiento.tipo}`}
                      style={{ gridColumn: asiento.col, gridRow: asiento.fila }}
                      onClick={() => asiento.tipo === 'asiento' && !ocupado && !confirmado && !pendiente && toggleAsiento(asiento.id_unidad, asiento.numero)}
                    >
                      {asiento.tipo === 'asiento' ? asiento.numero : asiento.tipo === 'pasillo' ? 'P' : 'C'}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button type="submit" disabled={estado === 'enviando'}>Confirmar Reserva</button>
      </form>
    </div>
  );
}