import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SubscriptionGate } from './components/SubscriptionGate';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/PublicLayout';

// Auth-critical pages — loaded synchronously (small + needed immediately)
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { Unauthorized } from './pages/Unauthorized';
import { AssinaturaExpirada } from './pages/AssinaturaExpirada';

// Lazy-loaded pages — code-split for smaller initial bundle
const LandingPage = lazy(() => import('./pages/Landing').then(m => ({ default: m.LandingPage })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Funcionarios = lazy(() => import('./pages/Funcionarios').then(m => ({ default: m.Funcionarios })));
const Produtos = lazy(() => import('./pages/Produtos').then(m => ({ default: m.Produtos })));
const Estoque = lazy(() => import('./pages/Estoque').then(m => ({ default: m.Estoque })));
const Encomendas = lazy(() => import('./pages/Encomendas').then(m => ({ default: m.Encomendas })));
const Financeiro = lazy(() => import('./pages/Financeiro').then(m => ({ default: m.Financeiro })));
const Auditoria = lazy(() => import('./pages/Auditoria').then(m => ({ default: m.Auditoria })));
const Configuracoes = lazy(() => import('./pages/Configuracoes').then(m => ({ default: m.Configuracoes })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const GerenciarUsuarios = lazy(() => import('./pages/GerenciarUsuarios').then(m => ({ default: m.GerenciarUsuarios })));
const GerenciarEmpresas = lazy(() => import('./pages/GerenciarEmpresas').then(m => ({ default: m.GerenciarEmpresas })));
const SuperadminPanel = lazy(() => import('./pages/SuperadminPanel').then(m => ({ default: m.SuperadminPanel })));
const SuperAdminTesters = lazy(() => import('./pages/SuperAdminTesters').then(m => ({ default: m.SuperAdminTesters })));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse').then(m => ({ default: m.TermsOfUse })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const Support = lazy(() => import('./pages/Support').then(m => ({ default: m.Support })));
const AboutUs = lazy(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })));
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));

function PageLoader() {
  return (
    <div className="min-h-screen bg-leather-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/assinatura-expirada" element={<AssinaturaExpirada />} />
            <Route path="/superadmin" element={<Navigate to="/dashboard/superadmin/testers" replace />} />

            {/* Institutional Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/termos-de-uso" element={<TermsOfUse />} />
              <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
              <Route path="/suporte" element={<Support />} />
              <Route path="/quem-somos" element={<AboutUs />} />
              <Route path="/faq" element={<FAQ />} />
            </Route>

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
              <Route path="estoque" element={<Estoque />} />
              <Route path="encomendas" element={<Encomendas />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route
                path="auditoria"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Auditoria />
                  </ProtectedRoute>
                }
              />
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
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
