// src/hooks/useNotificaciones.js
import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCkTkINb4eNvETqSmMvHZTBTyxNseuKO4w",
  authDomain: "transportesjm-d72d3.firebaseapp.com",
  projectId: "transportesjm-d72d3",
  storageBucket: "transportesjm-d72d3.appspot.com",
  messagingSenderId: "29195739631",
  appId: "1:29195739631:web:d12f3339c934ae0e9d5b5a"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const vapidKey = import.meta.env.VITE_VAPID_KEY;

const useNotificaciones = () => {
  useEffect(() => {
    const obtenerToken = async () => {
      try {
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
          console.warn('🚫 Permiso de notificación denegado');
          return;
        }

        const token = await getToken(messaging, { vapidKey });

        if (token) {
          console.log('✅ Token FCM:', token);
          // Puedes enviarlo al backend si lo necesitas
        } else {
          console.warn('⚠️ No se obtuvo token de FCM');
        }
      } catch (error) {
        console.error('❌ Error al obtener token FCM:', error);
      }
    };

    obtenerToken();

    onMessage(messaging, (payload) => {
      console.log('📩 Mensaje en primer plano:', payload);
      // Aquí puedes mostrar un toast, modal o notificación local
    });
  }, []);
};

export default useNotificaciones;
