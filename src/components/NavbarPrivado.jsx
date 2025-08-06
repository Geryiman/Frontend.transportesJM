import React, { useState } from 'react';
import '../styles/Navbar.css';
import { Link } from 'react-router-dom';

export default function NavbarPrivado() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

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
