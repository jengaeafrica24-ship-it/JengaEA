import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const userData = user ? JSON.parse(user) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '#features' },
    { label: 'How It Works', path: '#how-it-works' },
    { label: 'About', path: '#about' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 border-b border-blue-800/30 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="bg-gradient-to-br from-blue-400 to-cyan-400 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-400/50 transition-all duration-300">
              <BarChart3 className="w-6 h-6 text-blue-950" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              JengaEA
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.path}
                className="text-blue-200 hover:text-cyan-300 transition-colors duration-200 font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {token && userData ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-200 flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-800/30 border border-blue-700/30">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-blue-200 text-sm">{userData.first_name || userData.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-200 hover:text-cyan-300 transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-400/50"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-blue-800/30 text-blue-200 transition-colors duration-200"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-blue-800/30 py-4"
          >
            <div className="space-y-3">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-blue-200 hover:text-cyan-300 hover:bg-blue-800/20 rounded-lg transition-all duration-200"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 border-t border-blue-800/30 space-y-3">
                {token && userData ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-200 text-center"
                    >
                      Dashboard
                    </Link>
                    <div className="px-4 py-2 rounded-lg bg-blue-800/30 border border-blue-700/30">
                      <p className="text-blue-200 text-sm">{userData.first_name || userData.username}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-blue-200 hover:bg-blue-800/20 rounded-lg transition-colors duration-200 text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium text-center transition-all duration-200"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
