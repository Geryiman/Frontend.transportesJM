import React, { useState } from 'react';
import '../../styles/crearusuario.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function CrearUsuario() {
  const [form, setForm] = useState({
    nombre: '',
    username: '',
    password: '',
    rol: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al registrar usuario');
        return;
      }

      setSuccess('Usuario registrado correctamente');
      setForm({ nombre: '', username: '', password: '', rol: '' });
    } catch (err) {
      setError('Error de red o del servidor');
    }
  };

  return (
    <div className="crear-usuario-container">
      <h2 className="crear-usuario-title">Crear Nuevo Usuario</h2>
      {error && <p className="crear-usuario-error">{error}</p>}
      {success && <p className="crear-usuario-success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <label className="crear-usuario-label">Nombre completo:</label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className="crear-usuario-input"
          placeholder='Nombre Real'
          required
        />

        <label className="crear-usuario-label">Nombre de usuario:</label>
        <input
        placeholder='Nombre de usuario'
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          className="crear-usuario-input"
          required
        />

        <label  className="crear-usuario-label">Contraseña:</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="crear-usuario-input"
          required
        />

        <label className="crear-usuario-label">Rol:</label>
        <select
          name="rol"
          value={form.rol}
          onChange={handleChange}
          className="crear-usuario-select"
          required
        >
          <option value="">Selecciona un rol</option>
          <option value="administrador_general">Administrador General</option>
          <option value="conductor">Conductor</option>
          <option value="secretario">Secretario</option>
        </select>

        <button type="submit" className="crear-usuario-button">
          Registrar usuario
        </button>
      </form>
    </div>
  );
}
