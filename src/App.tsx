import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './components/LoginPage';
import { MainLayout } from './components/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { RadiosPage } from './pages/RadiosPage';
import { OrcamentosPage } from './pages/OrcamentosPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="radios" element={<RadiosPage />} />
            <Route path="orcamentos" element={<OrcamentosPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
