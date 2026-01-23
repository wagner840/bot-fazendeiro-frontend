import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SubscriptionGate } from './components/SubscriptionGate';
import { Layout } from './components/Layout';
import {
  Dashboard,
  Funcionarios,
  Produtos,
  Encomendas,
  Financeiro,
  Configuracoes,
  Login,
  AuthCallback,
  Unauthorized,
  GerenciarUsuarios,
  GerenciarEmpresas,
  SuperadminPanel,
  LandingPage,
  Checkout,
  AssinaturaExpirada,
  SuperAdminTesters,
} from './pages';


function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/assinatura-expirada" element={<AssinaturaExpirada />} />
            <Route path="/superadmin" element={<Navigate to="/dashboard/superadmin/testers" replace />} />

            {/* Protected routes - require auth + active subscription */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SubscriptionGate>
                    <Layout />
                  </SubscriptionGate>
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="funcionarios" element={<Funcionarios />} />
              <Route path="produtos" element={<Produtos />} />
              <Route path="encomendas" element={<Encomendas />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route
                path="configuracoes"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Configuracoes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="usuarios"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <GerenciarUsuarios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="empresas"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <GerenciarEmpresas />
                  </ProtectedRoute>
                }
              />
              <Route path="superadmin">
                <Route
                  index
                  element={
                    <ProtectedRoute requiredRole="superadmin">
                      <SuperadminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="testers"
                  element={
                    <ProtectedRoute requiredRole="superadmin">
                      <SuperAdminTesters />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
