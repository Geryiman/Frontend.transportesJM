import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Perfil.css';
import NavbarPrivado from '../components/NavbarPrivado.jsx';

const API_URL = import.meta.env.VITE_API_URL;

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();
  const [confirmarContrasena, setConfirmarContrasena] = useState('');


  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (!usuario) {
      navigate('/usuario/login');
      return;
    }

    axios
      .get(`${API_URL}/auth/perfil/${usuario.id}`)
      .then((res) => {
        if (res.data.estado === 'bloqueado') {
          setMensaje('Tu cuenta ha sido bloqueada. Contacta al administrador.');
          localStorage.clear();
          setTimeout(() => navigate('/usuario/login'), 3000);
        } else {
          setPerfil(res.data);
        }
      })
      .catch((err) => {
        console.error(err);
        setMensaje('Usuario no encontrado');
        localStorage.clear();
        setTimeout(() => navigate('/usuario/login'), 3000);
      });
  }, []);

  const handleCambiarContrasena = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!nuevaContrasena || !confirmarContrasena) {
      return setMensaje('Completa ambos campos de contraseña');
    }

    if (nuevaContrasena !== confirmarContrasena) {
      return setMensaje('Las contraseñas no coinciden');
    }

    try {
      const res = await axios.put(`${API_URL}/auth/cambiar-contrasena`, {
        id: usuario.id,
        nuevaContrasena,
      });

      setMensaje(res.data.message);
      setNuevaContrasena('');
      setConfirmarContrasena('');
    } catch (error) {
      setMensaje('Error al cambiar la contraseña');
      console.error(error);
    }
  };


  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/usuario/login');
  };

  if (!perfil && !mensaje) return <p>Cargando perfil...</p>;

  return (
    <>
      <NavbarPrivado />

      <div className="perfil-container">
        <h2>Mi Perfil</h2>

        {mensaje && <p className="mensaje">{mensaje}</p>}

        {perfil && (
          <>
            <div className="perfil-card">
              <p><strong>Nombre:</strong> {perfil.nombre} {perfil.apellidos}</p>
              <p><strong>Teléfono:</strong> {perfil.telefono}</p>
              <p><strong>Usuario:</strong> {perfil.username}</p>
              <p><strong>Género:</strong> {perfil.genero}</p>
              <p><strong>Estado:</strong> {perfil.estado === 'activo' ? '✅ Activo' : '🚫 Bloqueado'}</p>
              {perfil.favorito ? (
                <div className="mensaje-favorito">
                  ⭐ Gracias por ser parte de la familia. Usted es considerado uno de nuestros clientes favoritos.
                </div>
              ) : null}

              <p><strong>Suscrito desde:</strong> {new Date(perfil.creado_en).toLocaleDateString()}</p>
            </div>

            <form onSubmit={handleCambiarContrasena} className="form-contraseña">
              <h3>Cambiar contraseña</h3>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
              />
              <button type="submit">Actualizar</button>
            </form>


            <button className="cerrar-sesion" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </>
  );
}
