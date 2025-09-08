import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AnalysisProvider } from './contexts/AnalysisContext'

createRoot(document.getElementById("root")!).render(
  <AnalysisProvider>
    <App />
  </AnalysisProvider>
);
