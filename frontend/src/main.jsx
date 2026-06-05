import { createRoot } from 'react-dom/client'
import './index.css';
import './app.css';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/appContext.jsx';

import "leaflet/dist/leaflet.css";
import { SocketProvider } from './context/socketContext.jsx';

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="49732715505-89vvk8pcnv077n01tontlhvf3rt0l1g2.apps.googleusercontent.com">
    <AppProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AppProvider>
  </GoogleOAuthProvider>
)
