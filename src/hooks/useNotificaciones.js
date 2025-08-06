// src/hooks/useNotificaciones.js
import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase-config';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

export default function useNotificaciones(idUsuario, tipo = 'usuario') {
  useEffect(() => {
    if (!idUsuario || !messaging) return;

    const obtenerToken = async () => {
      try {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });

        if (token) {
          console.log('✅ Token FCM generado:', token);

          // Enviar al backend
          await axios.post(`${API_URL}/notificaciones/guardar-token`, {
            id: idUsuario,
            tipo,
            token,
          });

          toast.success('🔔 Notificaciones habilitadas');
        } else {
          console.warn('⚠️ No se pudo generar el token FCM');
        }
      } catch (err) {
        console.error('❌ Error al obtener token FCM:', err);
      }
    };

    obtenerToken();

    // Escuchar mensajes entrantes (foreground)
    onMessage(messaging, (payload) => {
      console.log('📩 Mensaje recibido en foreground:', payload);
      toast.info(`🔔 ${payload.notification?.title || 'Notificación recibida'}`);
    });
  }, [idUsuario]);
}
