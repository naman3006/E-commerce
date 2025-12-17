import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './i18n';
import './index.css';
import { store } from './store/store';

import { ThemeProvider } from './contexts/ThemeContext';
import { VoiceProvider } from './contexts/VoiceContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <VoiceProvider>
            <App />
          </VoiceProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);