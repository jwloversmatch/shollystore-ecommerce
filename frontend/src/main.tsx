import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import toast from 'react-hot-toast';
import { store, persistor } from './store';
import App from './App';
import './index.css';

function promptForUpdate(registration: ServiceWorkerRegistration) {
  toast(
    (t) => (
      <span className="flex items-center gap-3">
        New version available
        <button
          onClick={() => {
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            toast.dismiss(t.id);
          }}
          className="font-bold underline"
        >
          Refresh
        </button>
      </span>
    ),
    { duration: Infinity },
  );
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('SW registered:', registration.scope);

      if (registration.waiting) {
        promptForUpdate(registration);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            promptForUpdate(registration);
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);