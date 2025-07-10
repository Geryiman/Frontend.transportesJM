import React, { useState } from 'react';
import '../styles/Navbar.css';
import { Link } from 'react-router-dom';

export default function NavbarPublico() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <span className="logo">Transportes JM</span>
        <button className="menu-toggle" onClick={toggleMenu}>☰</button>
      </div>

      <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/contacto">Contáctanos</Link></li>
        <li><Link to="/usuario/login">Iniciar Sesión</Link></li>
        <li><Link to="/usuario/register">Registrarse</Link></li>
      </ul>
    </nav>
  );
}
