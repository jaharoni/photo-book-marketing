import { Routes, Route } from 'react-router-dom'
import MarketingPage from './pages/MarketingPage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}

export default App
