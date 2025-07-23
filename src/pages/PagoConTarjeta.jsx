import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function PagoScreen() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const reservaId = params.get('id');
  const nombre = params.get('nombre') || 'Pasajero';
  const asiento = params.get('asiento') || 'X';
  const monto = parseFloat(params.get('monto')) || 450;

  useEffect(() => {
    const generarPago = async () => {
      try {
        const res = await axios.post(`${API_URL}/pagos/crear`, {
          reservaId,
          nombre,
          asiento,
          monto
        });

        if (res.data.url) {
          window.location.href = res.data.url;
        } else {
          throw new Error('No se recibió el link de pago');
        }
      } catch (err) {
        console.error('❌ Error al generar pago', err);
        navigate('/error'); // Redirige a una pantalla de error si la tienes
      }
    };

    if (reservaId) generarPago();
  }, [reservaId]);

  return <p>🔄 Redirigiendo a Mercado Pago...</p>;
}
