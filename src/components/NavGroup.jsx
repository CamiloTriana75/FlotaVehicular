import React from 'react';

/**
 * Componente para agrupar elementos del menú
 * Proporciona un header consistente y organización visual
 */
const NavGroup = ({
  title,
  icon: Icon,
  children,
  collapsed = false,
  className = '',
}) => {
  return (
    <div className={`mt-6 first:mt-0 ${className}`}>
      {/* Header del grupo */}
      {!collapsed && (
        <div className="px-4 mb-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-gray-400" />}
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <div className="h-px bg-gradient-to-r from-gray-200 to-transparent mt-2" />
        </div>
      )}

      {/* Items del grupo */}
      <div className="px-2 space-y-1">{children}</div>
    </div>
  );
};

export default NavGroup;
