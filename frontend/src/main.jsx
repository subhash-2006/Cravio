import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import StoreContextProvider from './context/StoreContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StoreContextProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </StoreContextProvider>
  </BrowserRouter>
)
