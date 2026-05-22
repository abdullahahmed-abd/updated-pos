import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


import { AppProvider } from './all component/Contextapi.jsx'


// import Carousel from './all component/Carousel.jsx'

createRoot(document.getElementById('root')).render(
  <AppProvider>
    <App />

  </AppProvider>

)
