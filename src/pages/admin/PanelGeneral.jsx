import React from 'react';
import '../../styles/panelGeneral.css';
import { useNavigate } from 'react-router-dom';

export default function PanelGeneral() {
  const admin = JSON.parse(localStorage.getItem('adminData'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  return (
    <div className="panel-general-wrapper">
      <div className="panel-general-container">
        <div className="panel-header">
          <h1>Bienvenido, {admin?.nombre}</h1>
          <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
        </div>

        <h2 className="panel-subtitle">Panel del Administrador General</h2>

        <div className="panel-buttons">
          <button className="panel-button" onClick={() => navigate('/admin/usuarios')}>
            Usuarios
          </button>
          <button className="panel-button" onClick={() => navigate('/admin/viajes')}>
            Viajes
          </button>
          <button className="panel-button" onClick={() => navigate('/admin/notificaciones')}>
            Notificaciones
          </button>
          <button className="panel-button" onClick={() => navigate('/admin/crear-usuario')}>
            Crear nuevos usuarios
          </button>
          <button className="panel-button" onClick={() => navigate('/admin/CrearPlantillaUnidad')}>
           Plantilla de Unidad
          </button>
          <button className="panel-button" onClick={() => navigate('/admin/ListaPlantillas')}>
           Lista de Platillas
          </button>
          <button className="panel-button" onClick={() => navigate('/admin/CrearViaje')}>
           Crear Viaje
          </button>
          <button className="panel-button" onClick={() => navigate('/admin/ParadasExtras')}>
           Paradas Extras
          </button>
          
        </div>
      </div>
    </div>
  );
}
