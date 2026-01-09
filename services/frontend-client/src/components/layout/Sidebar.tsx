import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Users', path: '/users', icon: '👥' },
    { name: 'Orders', path: '/orders', icon: '📦' },
    { name: 'Products', path: '/products', icon: '🛍️' },
    { name: 'Analytics', path: '/analytics', icon: '📈' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen hidden md:block">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Navigation</h2>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;