export default function useNotificaciones(id, tipo = 'usuario') {
  useEffect(() => {
    if (!id) {
      console.warn('⚠️ No hay ID para notificación');
      return;
    }

    console.log('✅ Ejecutando useNotificaciones para ID:', id);

    Notification.requestPermission().then(async (permiso) => {
      console.log('🔐 Permiso de notificación:', permiso);

      if (permiso === 'granted') {
        try {
          const token = await getToken(messaging, {
            vapidKey: 'BDmwWifvJ1Uumes8Wu2Jb9fjQ9BcfYdxEBXF8HxT86CGTgWy8NhEGqmmwQZ0M4Wooz9eUHW0AyGCyqEm5QkKu0'
          });

          if (token) {
            console.log('📲 Token generado:', token);

            await axios.put(`${API_URL}/notificacion/${tipo}/${id}`, { token });

            console.log('✅ Token FCM enviado al backend y guardado');
          } else {
            console.warn('❌ No se generó token');
          }
        } catch (error) {
          console.error('❌ Error al obtener o guardar el token:', error);
        }
      } else {
        console.warn('⚠️ Permiso de notificación no otorgado');
      }
    });

    onMessage((payload) => {
      const { title, body } = payload.notification;
      alert(`${title}: ${body}`);
    });
  }, [id]);
}
