import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './stores/ThemeContext'
import { LocaleProvider } from './stores/LocaleContext'
import App from './App'
import '@/assets/style.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <LocaleProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ThemeProvider>
        </LocaleProvider>
    </React.StrictMode>
)
