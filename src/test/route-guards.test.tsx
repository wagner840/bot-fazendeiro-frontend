import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { SubscriptionGate } from '../components/SubscriptionGate';

type MockAuth = {
  loading: boolean;
  user: unknown;
  userFrontend: { role?: string } | null;
  hasAccess: (requiredRole?: string) => boolean;
  hasActiveSubscription: boolean;
  isSuperadmin: boolean;
};

const authState: MockAuth = {
  loading: false,
  user: { id: '1' },
  userFrontend: { role: 'funcionario' },
  hasAccess: () => true,
  hasActiveSubscription: true,
  isSuperadmin: false,
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authState,
}));

function renderRoute(ui: ReactNode, initialPath = '/private') {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>LOGIN_PAGE</div>} />
        <Route path="/unauthorized" element={<div>UNAUTHORIZED_PAGE</div>} />
        <Route path="/assinatura-expirada" element={<div>ASSINATURA_EXPIRADA</div>} />
        <Route path="/private" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Route Guards', () => {
  beforeEach(() => {
    authState.loading = false;
    authState.user = { id: '1' };
    authState.userFrontend = { role: 'funcionario' };
    authState.hasAccess = () => true;
    authState.hasActiveSubscription = true;
    authState.isSuperadmin = false;
  });

  it('redirects unauthenticated users to login', async () => {
    authState.user = null;
    renderRoute(
      <ProtectedRoute>
        <div>PRIVATE_OK</div>
      </ProtectedRoute>
    );
    expect(await screen.findByText('LOGIN_PAGE')).toBeInTheDocument();
  });

  it('redirects role mismatch to unauthorized', async () => {
    authState.hasAccess = () => false;
    renderRoute(
      <ProtectedRoute requiredRole="admin">
        <div>PRIVATE_OK</div>
      </ProtectedRoute>
    );
    expect(await screen.findByText('UNAUTHORIZED_PAGE')).toBeInTheDocument();
  });

  it('redirects inactive subscription to assinatura-expirada', async () => {
    authState.hasActiveSubscription = false;
    renderRoute(
      <SubscriptionGate>
        <div>SUB_OK</div>
      </SubscriptionGate>
    );
    expect(await screen.findByText('ASSINATURA_EXPIRADA')).toBeInTheDocument();
  });
});
