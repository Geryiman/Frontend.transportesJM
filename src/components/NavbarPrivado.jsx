import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css';
import { Link } from 'react-router-dom';
import useNotificaciones from '../hooks/useNotificaciones'; // ✅ Importamos el hook

export default function NavbarPrivado() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // ✅ Obtenemos el usuario desde localStorage
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // ✅ Llamamos al hook si hay sesión activa
  useNotificaciones(usuario?.id, 'usuario');

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <span className="logo">Transportes JM</span>
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
      </div>

      <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
        <li><Link to="/usuario/home">Inicio</Link></li>
        <li><Link to="/usuario/mis-viajes">Mis Viajes</Link></li>
        <li><Link to="/usuario/reservarviaje">Reservar Viaje</Link></li>
        <li><Link to="/usuario/contacto">Contáctanos</Link></li>
        <li><Link to="/usuario/perfil">Perfil</Link></li>
      </ul>
    </nav>
  );
}
