import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Componente simple para proteger rutas por rol.
 * Lee el usuario actual desde localStorage (compat con mock y real).
 * Si no cumple, redirige según el rol del usuario.
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

  console.log('🔒 ProtectedRoute check:', { role, allowedRoles: roles });

  const allowed = role && (roles.length === 0 || roles.includes(role));

  if (!allowed) {
    console.warn('❌ Access denied. Role:', role, 'Required:', roles);
    // Redirigir según el rol del usuario
    const redirectMap = {
      rrhh: '/rrhh/dashboard',
      operador: '/operador/dashboard',
      supervisor: '/rutas/monitoreo',
      conductor: '/conductor/mis-rutas',
      planificador: '/rutas/planificacion',
      admin: '/dashboard',
      superusuario: '/dashboard',
    };

    const redirectTo = role ? redirectMap[role] || '/dashboard' : '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
