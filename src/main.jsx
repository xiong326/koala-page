import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/nunito/wght.css'
import './assets/fonts/chill-round-gothic/font-faces.css'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { GenerationProvider } from './contexts/GenerationContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <GenerationProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </GenerationProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
)
