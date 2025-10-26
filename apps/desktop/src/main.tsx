import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('[Renderer] Starting React app...')
console.log('[Renderer] Root element:', document.getElementById('root'))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

console.log('[Renderer] React app rendered')
