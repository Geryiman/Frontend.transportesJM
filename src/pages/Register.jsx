import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarPublico from '../components/NavbarPublico';
import '../styles/Register.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    username: '',
    password: '',
    confirmPassword: '',
    genero: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.telefono.length !== 10 || !/^\d+$/.test(form.telefono)) {
        setError('El teléfono debe tener exactamente 10 dígitos numéricos');
        return;
      }
      

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error al registrar');
      } else {
        setSuccess('Usuario registrado correctamente');
        localStorage.clear();
        setTimeout(() => navigate('/usuario/home'), 1500);
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor');
    }
  };

  return (
    <div>
      <NavbarPublico />
      <div className="register-container">
        <h2>Registro de Usuario</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleRegister}>
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
          <input name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} required />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
          <input name="username" placeholder="Nombre de usuario" value={form.username} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" value={form.confirmPassword} onChange={handleChange} required />

          <select name="genero" value={form.genero} onChange={handleChange} required>
            <option value="">Selecciona tu género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>

          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
}
