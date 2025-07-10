import React from 'react';
import '../styles/Home.css';
import NavbarPublico from '../components/NavbarPublico.jsx';

export default function Home() {
    return (
        <div>
            <NavbarPublico />


            <section className="hero">
                <h1>Bienvenido a Transportes JM</h1>
                <p>Viajes seguros, cómodos y al mejor precio. Explora el país con nosotros.</p>
                <div className="buttons">
                    <a href="/usuario/Login"><button>Iniciar Sesión</button></a>
                    <a href="/usuario/Register"><button>Registrarse</button></a>
                </div>
            </section>

            <section className="destinos">
                <h2 style={{ textAlign: 'center', marginTop: '40px' }}>Destinos populares</h2>
                <div className="slider-wrapper">
                    <div className="slider">
                        <div className="slide-track">
                            <div className="slide">
                                <img src="https://i.ibb.co/SGLQMrM/Imagen-de-Whats-App-2025-05-06-a-las-00-35-01-3cb20b09.jpg" alt="Ventanillas" />
                                <p>Ventanillas</p>
                            </div>
                            <div className="slide">
                                <img src="https://i.ibb.co/gMVfyc2n/IMG-20250430-WA0011.jpg" alt="Zoquitlan" />
                                <p>Zoquitlan</p>
                            </div>
                            <div className="slide">
                                <img src="https://i.ibb.co/xqqhZfv6/Imagen-de-Whats-App-2025-05-06-a-las-00-56-50-41f1c21c.jpg" alt="Unidades" />
                                <p>Unidades</p>
                            </div>
                            <div className="slide">
                                <img src="https://i.ibb.co/vxC9cT8G/Imagen-de-Whats-App-2025-05-06-a-las-00-56-50-1596c68f.jpg" alt="Veracruz" />
                                <p>Veracruz</p>
                            </div>
                            <div className="slide">
                                <img src="https://www.mexicodesconocido.com.mx/wp-content/uploads/2010/05/ciudad-de-mexico-angel-independencia-depositphotos-900x600.jpg" alt="CDMX" />
                                <p>CDMX</p>
                            </div>
                            {/* Agrega más slides aquí */}
                        </div>
                    </div>
                </div>
            </section>


            <section>
                <h2 style={{ textAlign: 'center', marginTop: '40px' }}>Horarios de salida</h2>
                <table className="tabla-horarios">
                    <thead>
                        <tr>
                            <th>Origen</th>
                            <th>Destino</th>
                            <th>Hora de salida</th>
                            <th>Días</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Ciudad de México</td><td>Zoquitlán</td><td>11:00 PM</td><td>Lunes a Domingo</td></tr>
                        <tr><td>Ciudad de México</td><td>Zoquitlán</td><td>9:30 AM y 11:00 PM</td><td>Lunes</td></tr>
                        <tr><td>Zoquitlán</td><td>Ciudad de México</td><td>12:00 PM</td><td>Lunes a Sabado</td></tr>
                        <tr><td>Zoquitlán</td><td>Ciudad de México</td><td>12:00 PM y 06:00 PM</td><td>    Domingo</td></tr>
                    </tbody>
                </table>
            </section>
        </div>
    );
}
