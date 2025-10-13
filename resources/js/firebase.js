import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDM6xLjZc6u5fitgHCsOt4vNUVXpZ0WJyE",
  authDomain: "snap-journal-510e0.firebaseapp.com",
  projectId: "snap-journal-510e0",
  storageBucket: "snap-journal-510e0.firebasestorage.app",
  messagingSenderId: "1081980428891",
  appId: "1:1081980428891:web:14bdffc554e7b85259557e",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BGwBYYOnhmh5rlRLMe7M-5KflbrudREZWs7Lw-qQWrxiYXWHktGpKR4iWYrlsAQ7i_9XZy0SZ4mS6FzXWqrjQ1I",
    });
    return token;
  } catch (err) {
    console.error("Token error", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
