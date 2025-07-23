import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ConfirmacionReserva.css';

export default function ConfirmacionReserva() {
  return (
    <div className="confirmacion-container">
      <div className="confirmacion-card">
        <h2>✅ ¡Reserva registrada con éxito!</h2>
        <p>Recibirás confirmación del administrador pronto.</p>
        <Link to="/usuario/home" className="btn-volver">Volver al inicio</Link>
      </div>
    </div>
  );
}
