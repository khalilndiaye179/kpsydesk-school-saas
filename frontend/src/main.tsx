import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { CountryThemeProvider } from './theme/CountryThemeProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CountryThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CountryThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);
