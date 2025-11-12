import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Componente simple para proteger rutas por rol.
 * Lee el usuario actual desde localStorage (compat con mock y real).
 * Si no cumple, redirige a /dashboard.
 */
export default function ProtectedRoute({ roles = [], children }) {
  const userStr =
    typeof window !== 'undefined' &&
    (localStorage.getItem('currentUser') || localStorage.getItem('mockUser'));

  let role = null;
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      role = user.rol || user.user_metadata?.role || user.role || null;
    } catch (e) {
      // ignore parse error
    }
  }

  const allowed = role && (roles.length === 0 || roles.includes(role));
  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
