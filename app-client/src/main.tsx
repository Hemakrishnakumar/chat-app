import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.tsx';
import { ErrorBoundaryClass } from './components/ErrorBoundary.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import { SocketProvider } from './context/socketContext.tsx';
import { ConversationProvider } from './context/conversationContext.tsx';



const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string || "hvjfhv";

createRoot(document.getElementById('root')!).render(
    //<StrictMode>
        <ErrorBoundaryClass  >
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <AuthProvider>
                    <SocketProvider>
                        <ConversationProvider>
                            <ThemeProvider >
                                <App />
                                <Toaster />
                            </ThemeProvider>
                        </ConversationProvider>
                    </SocketProvider>                    
                </AuthProvider>
            </GoogleOAuthProvider>
        </ErrorBoundaryClass>
    //</StrictMode>,
);
