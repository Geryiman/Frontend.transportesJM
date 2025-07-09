import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/loginAdmin.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al iniciar sesión');
        return;
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify(data.admin));

      switch (data.admin.rol) {
        case 'administrador_general':
          navigate('/admin/panel-general');
          break;
        case 'conductor':
          navigate('/admin/panel-conductor');
          break;
        case 'secretario':
          navigate('/admin/panel-secretario');
          break;
        default:
          setError('Rol no reconocido');
      }

    } catch (err) {
      setError('Error de red o del servidor');
    }
  };

  return (
    <div className="login-admin-container">
      <form className="login-admin-form" onSubmit={handleLogin}>
        <h2 className="login-admin-title">Login Administrador</h2>

        {error && <p className="login-admin-error">{error}</p>}

        <label className="login-admin-label">Usuario:</label>
        <input
          type="text"
          name="username"
          className="login-admin-input"
          value={form.username}
          onChange={handleChange}
          required
        />

        <label className="login-admin-label">Contraseña:</label>
        <input
          type="password"
          name="password"
          className="login-admin-input"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="login-admin-button">Iniciar Sesión</button>
      </form>
    </div>
  );
}
