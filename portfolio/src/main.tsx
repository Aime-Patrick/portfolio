import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      toastOptions={{
        className: 'custom-toast',
        style: {
          background: 'linear-gradient(90deg, #ff9800 0%, #ff5722 100%)',
          color: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          fontWeight: 500,
          fontFamily: "'Playpen Sans', cursive",
          padding: '16px 24px',
          fontSize: '1rem',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
          style: {
            background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
            color: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
            color: '#fff',
          },
        },
      }}
      containerStyle={{
        margin: '1.5rem',
      }}
    />
    <App />
  </StrictMode>,
)
