import React from 'react';
import '../styles/Contactanos.css';
import NavbarPrivado from '../components/NavbarPrivado';
import NavbarPublico from '../components/NavbarPublico';

export default function Contactanos() {
    // Verificamos si el usuario está logueado
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    return (
        <>
            {/* Mostrar el navbar según el estado de sesión */}
            {usuario ? <NavbarPrivado /> : <NavbarPublico />}

            <div className="contact-container">
                <h1>Contáctanos</h1>

                <p className="slogan">
                    ¿Tienes dudas o necesitas un viaje especial?{' '}
                    <strong>¡Contáctanos y lo hacemos realidad!</strong>
                </p>

                <div className="contact-card">
                    <h2>Jairo Montalvo Sánchez</h2>
                    <p>
                        <strong>Teléfono:</strong>{' '}
                        <a href="tel:2361147879">236 114 7879</a>
                    </p>
                    <p>
                        <strong>WhatsApp:</strong>{' '}
                        <a
                            href="https://wa.me/5212361147879"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Enviar mensaje por WhatsApp
                        </a>
                    </p>
                </div>

                <div className="extra-info">
                    <p className="mensaje-importante">
                        Estamos disponibles para responder tus preguntas y ayudarte a
                        planear el viaje que necesitas. ¡Tu comodidad y seguridad son
                        nuestra prioridad!
                    </p>
                </div>
            </div>
        </>
    );
}
