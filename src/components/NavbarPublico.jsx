import React, { useState } from 'react';
import '../styles/Navbar.css';

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
      <li><a href="/">Inicio</a></li>
      <li><a href="/contacto">Contáctanos</a></li>
      <li><a href="/usuario/login">Iniciar Sesión</a></li>
      <li><a href="/usuario/register">Registrarse</a></li>
    </ul>
  </nav>
  
  );
}
