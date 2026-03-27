import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Palmtree, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-teal-100 transition-colors">
            <Palmtree className="w-7 h-7" />
            <span className="tracking-wide">Tropical Planner</span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            {currentUser ? (
              <>
                <div className="hidden md:flex items-center gap-6 text-teal-50">
                  <Link 
                    to="/" 
                    className={`hover:text-white transition-colors ${isActive('/') ? 'text-white font-semibold underline underline-offset-4' : ''}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`flex items-center gap-2 hover:text-white transition-colors ${isActive('/profile') ? 'text-white font-semibold underline underline-offset-4' : ''}`}
                  >
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="User" className="w-6 h-6 rounded-full border border-teal-200" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    Profile
                  </Link>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-teal-50 hover:text-red-300 transition-colors ml-2 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-teal-50 hover:text-white transition-colors">Login</Link>
                <Link to="/signup" className="bg-white text-teal-600 px-5 py-2 rounded-lg font-semibold hover:bg-teal-50 shadow-sm transition-all transform hover:scale-105">
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
