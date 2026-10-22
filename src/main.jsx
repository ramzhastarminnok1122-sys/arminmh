import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import 'vazirmatn/Vazirmatn-font-face.css';
import './styles.css';
import App from './App';
import { StoreProvider } from './lib/store';
import { ToastHost } from './components/ui';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <StoreProvider>
        <App />
        <ToastHost />
      </StoreProvider>
    </HashRouter>
  </React.StrictMode>
);
