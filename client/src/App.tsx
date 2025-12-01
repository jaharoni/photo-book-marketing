import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import MarketingPage from './pages/MarketingPage';
import AdminPage from './pages/AdminPage';
import SEO from './components/SEO/SEO';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <SEO />
      <Routes>
        <Route path="/" element={<MarketingPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
