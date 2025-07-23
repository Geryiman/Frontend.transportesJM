import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/crearPlantillaUnidad.css';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

export default function CrearPlantillaUnidad() {
  const [form, setForm] = useState({ nombre: '', tipo: 'combi' });
  const [matriz, setMatriz] = useState(
    Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => ''))
  );
  const [tipoActivo, setTipoActivo] = useState('asiento');
  const [pintando, setPintando] = useState(false);

  const cambiarTipoCelda = (fila, col) => {
    setMatriz(prev => {
      const nueva = prev.map(f => [...f]);

      nueva[fila][col] = tipoActivo === 'eliminado' ? 'eliminado' :
                         tipoActivo === 'borrar' ? '' : tipoActivo;
      return nueva;
    });
  };

  const handleInputChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const agregarColumna = () => {
    setMatriz(prev => prev.map(fila => [...fila, '']));
  };

  const eliminarColumna = () => {
    if (matriz[0].length > 1) {
      setMatriz(prev => prev.map(fila => fila.slice(0, -1)));
    }
  };

  const agregarFila = () => {
    const columnas = matriz[0].length;
    setMatriz(prev => [...prev, Array.from({ length: columnas }, () => '')]);
  };

  const eliminarFila = () => {
    if (matriz.length > 1) {
      setMatriz(prev => prev.slice(0, -1));
    }
  };

  const contarTipos = () => {
    let asientos = 0, pasillos = 0, conductor = 0;
    matriz.forEach(fila =>
      fila.forEach(tipo => {
        if (tipo === 'asiento') asientos++;
        else if (tipo === 'pasillo') pasillos++;
        else if (tipo === 'conductor') conductor++;
      })
    );
    return { asientos, pasillos, conductor };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const estructura = [];
    let total_asientos = 0;
    let contadorAsientos = 1;

    matriz.forEach((fila, i) =>
      fila.forEach((tipo, j) => {
        if (tipo && tipo !== 'eliminado') {
          const celda = { fila: i + 1, col: j + 1, tipo }; // 🔄 YA NO se invierte col
          if (tipo === 'asiento') {
            celda.numero = `A${contadorAsientos}`;
            contadorAsientos++;
            total_asientos++;
          }
          estructura.push(celda);
        }
      })
    );

    const { conductor } = contarTipos();
    if (!form.nombre || !form.tipo || total_asientos === 0 || conductor === 0) {
      toast.warning('⚠️ Completa todos los campos, incluye al menos un asiento y un conductor');
      return;
    }

    try {
      await axios.post(`${API_URL}/viajes/crear-plantilla-unidad`, {
        nombre: form.nombre,
        tipo: form.tipo,
        total_asientos,
        estructura_asientos: estructura
      });

      toast.success('✅ Plantilla guardada correctamente');
      setForm({ nombre: '', tipo: 'combi' });
      setMatriz(Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => '')));
    } catch (err) {
      console.error(err);
      toast.error('❌ Error al guardar la plantilla');
    }
  };

  const { asientos, pasillos, conductor } = contarTipos();

  return (
    <div className="plantilla-container">
      <h2>Crear Plantilla de Unidad</h2>

      <form onSubmit={handleSubmit} className="plantilla-form">
        <label>Nombre:</label>
        <input name="nombre" value={form.nombre} onChange={handleInputChange} required />

        <label>Tipo de unidad:</label>
        <select name="tipo" value={form.tipo} onChange={handleInputChange}>
          <option value="combi">Combi</option>
          <option value="autobus">Autobús</option>
          <option value="otro">Otro</option>
        </select>

        <div className="selector-tipo">
          <strong>Modo actual:</strong>
          <button type="button" onClick={() => setTipoActivo('asiento')} className={tipoActivo === 'asiento' ? 'activo' : ''}>🟩 Asiento</button>
          <button type="button" onClick={() => setTipoActivo('pasillo')} className={tipoActivo === 'pasillo' ? 'activo' : ''}>🟨 Pasillo</button>
          <button type="button" onClick={() => setTipoActivo('conductor')} className={tipoActivo === 'conductor' ? 'activo' : ''}>🧑‍✈️ Conductor</button>
          <button type="button" onClick={() => setTipoActivo('eliminado')} className={tipoActivo === 'eliminado' ? 'activo' : ''}>🗑 Eliminar</button>
          <button type="button" onClick={() => setTipoActivo('borrar')} className={tipoActivo === 'borrar' ? 'activo' : ''}>❌ Borrar tipo</button>
        </div>

        <div className="matriz-wrapper">
          <div className="matriz">
            {matriz.map((fila, i) => (
              <div key={`fila-${i}`} className="fila">
                {fila.map((tipo, j) => {
                  const indexPlano = i * matriz[0].length + j;
                  const numeroAsiento = `A${matriz.flat().filter((t, idx) => t === 'asiento' && idx < indexPlano).length + 1}`;
                  const isFirstConductor = tipo === 'conductor' && (j === 0 || fila[j - 1] !== 'conductor');

                  const contenido =
                    tipo === 'asiento' ? numeroAsiento :
                    tipo === 'conductor' && isFirstConductor ? 'C' :
                    tipo === 'pasillo' ? 'P' : '';

                  return (
                    <button
                      key={`${i}-${j}`}
                      type="button"
                      className={`celda ${tipo || 'vacia'}`}
                      onMouseDown={() => {
                        cambiarTipoCelda(i, j);
                        setPintando(true);
                      }}
                      onMouseOver={() => {
                        if (pintando) cambiarTipoCelda(i, j);
                      }}
                      onMouseUp={() => setPintando(false)}
                    >
                      {contenido}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="botones-globales">
            <button type="button" onClick={agregarFila}>➕ Agregar fila</button>
            <button type="button" onClick={eliminarFila}>➖ Eliminar fila</button>
            <button type="button" onClick={agregarColumna}>➕ Agregar columna</button>
            <button type="button" onClick={eliminarColumna}>➖ Eliminar columna</button>
          </div>
        </div>

        <div className="contador">
          <span>🟩 Asientos: {asientos}</span>
          <span>🟨 Pasillos: {pasillos}</span>
          <span>🧑‍✈️ Conductor: {conductor}</span>
        </div>

        <button type="submit" className="btn-guardar">Guardar Plantilla</button>
      </form>
    </div>
  );
}
