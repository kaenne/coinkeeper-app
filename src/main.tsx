import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom' // BrowserRouter остается здесь
import { store } from './store'
import './styles/global.css' 
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter> {/* Оборачиваем App в BrowserRouter здесь */}
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
