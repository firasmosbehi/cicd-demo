import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/dashboard" className="text-xl font-bold text-gray-800">
            CI/CD Pipeline
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link 
              to="/dashboard" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/users" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Users
            </Link>
            <Link 
              to="/orders" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Orders
            </Link>
            <Link 
              to="/products" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Products
            </Link>
            <Link 
              to="/analytics" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Analytics
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;