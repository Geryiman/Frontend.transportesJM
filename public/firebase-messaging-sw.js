// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.5.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.5.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA7d0vBbfFbyVcTIgybUDdnWpUHriO3g4w",
  authDomain: "transportesjm-d72d3.firebaseapp.com",
  projectId: "transportesjm-d72d3",
  storageBucket: "transportesjm-d72d3.appspot.com",
  messagingSenderId: "299157939631",
  appId: "1:299157939631:web:d12f3339c934a0e9d5bb5a",
  measurementId: "G-6VD13BY0M8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('📦 Mensaje recibido en segundo plano: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    data: payload.data,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('push', function (event) {
  const data = event.data.json();
  console.log('🔔 Push recibido:', data);

  const options = {
    body: data.notification.body,
    icon: '/icon.png',
  };

  event.waitUntil(
    self.registration.showNotification(data.notification.title, options)
  );
});
