import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Palmtree, 
  LayoutDashboard, 
  PlusCircle, 
  User, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Create Trip', path: '/create-trip', icon: PlusCircle },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gradient-to-b from-teal-700 to-cyan-800 text-white min-h-screen shadow-2xl relative z-10">
        
        {/* Logo Section */}
        <div className="p-8 flex items-center justify-center border-b border-teal-600/50">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Palmtree className="w-8 h-8 text-teal-100" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">AI Travel</span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-6">
          <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4 border border-white/10 backdrop-blur-md">
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
                className="w-12 h-12 rounded-full border-2 border-teal-300 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-teal-500/50 border-2 border-teal-300 flex items-center justify-center text-lg font-bold">
                {currentUser.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{currentUser.displayName || 'Traveler'}</p>
              <p className="text-xs text-teal-200 truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.name} 
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-4 px-6 py-4 rounded-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-white/20 text-white shadow-inner backdrop-blur-md' 
                      : 'text-teal-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-teal-600/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-4 w-full rounded-xl font-medium text-teal-200 hover:bg-red-500/20 hover:text-red-100 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 flex justify-around items-center p-3 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.name} 
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  isActive 
                    ? 'text-teal-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-teal-50/50' : ''}`} />
                  <span className="text-[10px] font-semibold">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </>
  );
};

export default Sidebar;
