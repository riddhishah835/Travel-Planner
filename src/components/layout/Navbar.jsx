import React from 'react';
import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
            <Plane className="w-6 h-6" />
            <span>Travel Companion</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
            <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
