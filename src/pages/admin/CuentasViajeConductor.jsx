import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

export default function CuentasViajeConductor({ idViaje }) {
  const [cuenta, setCuenta] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [formulario, setFormulario] = useState({
    gasolina: '',
    casetas: '',
    otros: '',
    descripcion_otros: '',
  });

  const obtenerCuenta = async () => {
    try {
      const res = await axios.get(`${API_URL}/cuentas-viaje/${idViaje}`);
      if (res.data) {
        setCuenta(res.data);
        setFormulario({
          gasolina: res.data.gasolina,
          casetas: res.data.casetas,
          otros: res.data.otros,
          descripcion_otros: res.data.descripcion_otros,
        });
      }
    } catch (err) {
      console.error('❌ Error al obtener cuenta', err);
    }
  };

  const obtenerResumen = async () => {
    try {
      const res = await axios.get(`${API_URL}/cuentas-viaje/${idViaje}/resumen`);
      setResumen(res.data);
    } catch (err) {
      console.error('❌ Error al obtener resumen', err);
      toast.error('❌ No se pudo obtener el resumen');
    }
  };

  useEffect(() => {
    if (idViaje) {
      obtenerCuenta();
      obtenerResumen();
    }
  }, [idViaje]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const handleGuardar = async () => {
    try {
      const body = { ...formulario, id_viaje: idViaje };

      if (cuenta) {
        await axios.put(`${API_URL}/cuentas-viaje/${cuenta.id}`, body);
        toast.success('✅ Cuenta actualizada');
      } else {
        await axios.post(`${API_URL}/cuentas-viaje`, body);
        toast.success('✅ Cuenta guardada');
      }

      obtenerCuenta();
      obtenerResumen();
    } catch (err) {
      console.error('❌ Error al guardar/actualizar cuenta:', err);
      toast.error('❌ No se pudo guardar/actualizar');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>🧾 Cuenta del Viaje</h2>

      <div style={styles.formulario}>
        <label>Gasolina:</label>
        <input type="number" name="gasolina" value={formulario.gasolina} onChange={handleChange} />

        <label>Casetas:</label>
        <input type="number" name="casetas" value={formulario.casetas} onChange={handleChange} />

        <label>Otros gastos:</label>
        <input type="number" name="otros" value={formulario.otros} onChange={handleChange} />

        <label>Descripción otros:</label>
        <input type="text" name="descripcion_otros" value={formulario.descripcion_otros} onChange={handleChange} />

        <button onClick={handleGuardar} style={styles.boton}>
          {cuenta ? 'Actualizar Cuenta' : 'Guardar Cuenta'}
        </button>
      </div>

      <hr style={{ margin: '30px 0' }} />

      <h3 style={styles.titulo}>📊 Resumen</h3>
      {resumen ? (
        <div style={styles.resumen}>
          <p><strong>Total pasajeros (efectivo):</strong> {resumen.totalPasajeros}</p>
          <p><strong>Total efectivo:</strong> ${resumen.totalEfectivo}</p>
          <p><strong>Total transferencia:</strong> ${resumen.totalTransferencia}</p>
          <p><strong>Total generado:</strong> ${resumen.totalGenerado}</p>
          <p><strong>Total gastos:</strong> ${resumen.totalGastos}</p>
          <p><strong>Pendiente por entregar:</strong> ${resumen.pendienteEntregar}</p>
        </div>
      ) : (
        <p style={{ color: 'gray' }}>No hay resumen disponible.</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '600px',
    margin: 'auto',
    background: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0 0 10px #ccc',
    color: '#000',
  },
  titulo: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  boton: {
    marginTop: '20px',
    padding: '10px',
    background: '#0066cc',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  resumen: {
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
};
