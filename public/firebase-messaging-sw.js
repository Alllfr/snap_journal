importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDM6xLjZc6u5fitgHCsOt4vNUVXpZ0WJyE",
  authDomain: "snap-journal-510e0.firebaseapp.com",
  projectId: "snap-journal-510e0",
  storageBucket: "snap-journal-510e0.firebasestorage.app",
  messagingSenderId: "1081980428891",
  appId: "1:1081980428891:web:14bdffc554e7b85259557e",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png",
  });
});
