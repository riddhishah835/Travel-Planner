import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Palmtree, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // If user is not logged in and is on auth pages, we might want to hide navbar or keep it simple
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-cyan-600">
            <Palmtree className="w-6 h-6" />
            <span>Travel Companion</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            {currentUser ? (
              <>
                <span className="text-gray-500 hidden md:inline truncate max-w-[150px]">
                  {currentUser.email || currentUser.phoneNumber || 'User'}
                </span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-cyan-600 transition-colors">Login</Link>
                <Link to="/signup" className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 shadow-sm transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
