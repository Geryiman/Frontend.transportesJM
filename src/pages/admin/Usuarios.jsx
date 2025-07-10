import React, { useEffect, useState } from 'react';
import '../../styles/usuarios.css';
import {
  FaLock,
  FaUnlock,
  FaStar,
  FaRegStar,
  FaTrashAlt
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarUsuarios, setMostrarUsuarios] = useState(true);
  const [mostrarAdmins, setMostrarAdmins] = useState(true);
  const [columnas, setColumnas] = useState({
    genero: true,
    estado: true,
    favorito: true,
  });

  const token = localStorage.getItem('adminToken');

  const fetchCuentas = () => {
    fetch(`${API_URL}/admin/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.usuarios && data.administradores) {
          setUsuarios(data.usuarios);
          setAdministradores(data.administradores);
        } else {
          setError(data.message || 'Error al cargar datos');
        }
      })
      .catch(() => setError('Error al conectar con el servidor'));
  };

  useEffect(() => {
    fetchCuentas();
  }, []);

  const confirmarAccion = (tipo, id, accion, nombre) => {
    setConfirm({ tipo, id, accion, nombre });
  };

  const ejecutarAccion = async () => {
    const { tipo, id, accion } = confirm;
    try {
      if (accion === 'eliminar') {
        await fetch(`${API_URL}/admin/delete-${tipo}/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await fetch(`${API_URL}/admin/update-account`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tipo, id, accion }),
        });
      }

      toast.success('Acción realizada correctamente');
      setConfirm(null);
      fetchCuentas();
    } catch {
      toast.error('Error al realizar la acción');
    }
  };

  const filtroBusqueda = (lista) => {
    return lista.filter((item) =>
      (item.nombre + item.username).toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  return (
    <div className="usuarios-container">
      <ToastContainer />
      <h1 className="usuarios-title">Gestión de Cuentas</h1>

      {/* Barra de búsqueda y filtros */}
      <div className="usuarios-filtros">
        <input
          type="text"
          placeholder="Buscar por nombre o username..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={mostrarUsuarios}
            onChange={() => setMostrarUsuarios(!mostrarUsuarios)}
          />{' '}
          Mostrar usuarios
        </label>
        <label>
          <input
            type="checkbox"
            checked={mostrarAdmins}
            onChange={() => setMostrarAdmins(!mostrarAdmins)}
          />{' '}
          Mostrar administradores
        </label>
        <label>
          <input
            type="checkbox"
            checked={columnas.genero}
            onChange={() => setColumnas({ ...columnas, genero: !columnas.genero })}
          />{' '}
          Género
        </label>
        <label>
          <input
            type="checkbox"
            checked={columnas.estado}
            onChange={() => setColumnas({ ...columnas, estado: !columnas.estado })}
          />{' '}
          Estado
        </label>
        <label>
          <input
            type="checkbox"
            checked={columnas.favorito}
            onChange={() => setColumnas({ ...columnas, favorito: !columnas.favorito })}
          />{' '}
          Favorito
        </label>
      </div>

      {confirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>
              ¿Confirmas la acción <strong>{confirm.accion}</strong> sobre {confirm.tipo} <strong>{confirm.nombre}</strong>?
            </p>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={ejecutarAccion}>Confirmar</button>
              <button className="btn-cancel" onClick={() => setConfirm(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Usuarios */}
      {mostrarUsuarios && (
        <>
          <h2 className="usuarios-subtitle">Usuarios Registrados</h2>
          <Tabla
            tipo="usuario"
            datos={filtroBusqueda(usuarios)}
            columnas={columnas}
            confirmarAccion={confirmarAccion}
          />
        </>
      )}

      {/* Administradores */}
      {mostrarAdmins && (
        <>
          <h2 className="usuarios-subtitle">Administradores</h2>
          <Tabla
            tipo="administrador"
            datos={filtroBusqueda(administradores)}
            columnas={columnas}
            confirmarAccion={confirmarAccion}
          />
        </>
      )}
    </div>
  );
}

function Tabla({ tipo, datos, columnas, confirmarAccion }) {
  return (
    <table className="usuarios-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          {tipo === 'usuario' && <th>Apellidos</th>}
          {tipo === 'usuario' && <th>Teléfono</th>}
          <th>Username</th>
          {columnas.genero && tipo === 'usuario' && <th>Género</th>}
          {tipo === 'administrador' && <th>Rol</th>}
          {columnas.estado && <th>Estado</th>}
          {columnas.favorito && <th>Favorito</th>}
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {datos.map((item) => (
          <tr key={item.id} className={item.estado === 'bloqueado' ? 'bloqueado' : ''}>
            <td>{item.id}</td>
            <td>{item.nombre}</td>
            {tipo === 'usuario' && <td>{item.apellidos}</td>}
            {tipo === 'usuario' && <td>{item.telefono}</td>}
            <td>{item.username}</td>
            {columnas.genero && tipo === 'usuario' && <td>{item.genero}</td>}
            {tipo === 'administrador' && <td>{item.rol}</td>}
            {columnas.estado && <td>{item.estado || '-'}</td>}
            {columnas.favorito && (
              <td>
                {item.favorito ? (
                  <FaStar
                    className="icon-btn favorito"
                    title="Quitar de favoritos"
                    onClick={() => confirmarAccion(tipo, item.id, 'no favorito', item.nombre)}
                  />
                ) : (
                  <FaRegStar
                    className="icon-btn"
                    title="Marcar como favorito"
                    onClick={() => confirmarAccion(tipo, item.id, 'favorito', item.nombre)}
                  />
                )}
              </td>
            )}
            <td className="acciones-cell">
              {item.estado === 'activo' ? (
                <FaLock
                  title="Bloquear"
                  className="icon-btn"
                  onClick={() => confirmarAccion(tipo, item.id, 'bloquear', item.nombre)}
                />
              ) : (
                <FaUnlock
                  title="Desbloquear"
                  className="icon-btn"
                  onClick={() => confirmarAccion(tipo, item.id, 'desbloquear', item.nombre)}
                />
              )}
              <FaTrashAlt
                title="Eliminar"
                className="icon-btn"
                onClick={() => confirmarAccion(tipo, item.id, 'eliminar', item.nombre)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
