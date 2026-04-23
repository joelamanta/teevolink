import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LangProvider } from './contexts/LangContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Shell from './components/Shell'
import UnsupportedBrowser from './components/UnsupportedBrowser'
import ConnectScreen from './components/ConnectScreen'
import Dashboard from './components/Dashboard'
import DPIPage from './components/dpi/DPIPage'
import LightingPage from './components/lighting/LightingPage'
import ButtonsPage from './components/buttons/ButtonsPage'
import MacrosPage from './components/macros/MacrosPage'
import AdvancedPage from './components/advanced/AdvancedPage'

function isWebHIDSupported(): boolean {
  return typeof navigator !== 'undefined' && 'hid' in navigator
}

export default function App() {
  if (!isWebHIDSupported()) {
    return <UnsupportedBrowser />
  }

  return (
    <ThemeProvider>
      <LangProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Shell />}>
              <Route index element={<ConnectScreen />} />
              <Route path="dashboard" element={<Dashboard />}>
                <Route index element={<DPIPage />} />
                <Route path="lighting" element={<LightingPage />} />
                <Route path="buttons" element={<ButtonsPage />} />
                <Route path="macros" element={<MacrosPage />} />
                <Route path="advanced" element={<AdvancedPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </LangProvider>
    </ThemeProvider>
  )
}
