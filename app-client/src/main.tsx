import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.js'
import AuthProvider from './context/AuthContext.js'
import { BrowserRouter } from 'react-router'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  //   <App/>
  // </StrictMode>,
  <BrowserRouter>
    <AuthProvider>
      <App/>
    </AuthProvider>
  </BrowserRouter>
)
