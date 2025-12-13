import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente reutilizable para enlaces de navegación
 * Soporta:
 * - Estado activo/inactivo
 * - Badges
 * - Iconos
 * - Responsive (oculta descripción en móvil)
 */
const NavLink = ({
  to,
  icon: Icon,
  title,
  description,
  active = false,
  badge,
  badgeColor = 'bg-blue-100 text-blue-800',
  onClick,
  collapsed = false,
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        group flex items-center justify-between px-3 py-2.5 rounded-lg
        transition-all duration-200 ease-out
        ${
          active
            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 shadow-sm'
            : 'hover:bg-gray-50 border-l-4 border-transparent hover:shadow-sm'
        }
      `}
      title={collapsed ? title : undefined}
    >
      {/* Icono + Contenido */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Icono */}
        <div
          className={`
            flex-shrink-0 p-2 rounded-lg transition-all duration-200
            ${
              active
                ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
            }
          `}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Texto (ocultar en collapsed) */}
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p
              className={`
                font-medium transition-colors duration-200
                ${active ? 'text-blue-900' : 'text-gray-900'}
              `}
            >
              {title}
            </p>
            {description && (
              <p
                className={`
                  text-xs transition-colors duration-200
                  hidden sm:block
                  ${active ? 'text-blue-600' : 'text-gray-500'}
                `}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Badge */}
      {badge && !collapsed && (
        <span
          className={`
            flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full
            ml-2 animate-pulse
            ${badgeColor}
          `}
        >
          {badge}
        </span>
      )}
    </Link>
  );
};

export default NavLink;
