import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Wrench,
  Users,
  FileText,
  BarChart,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Material Cost', href: '/material-cost', icon: Wrench },
    { name: 'Labor Cost', href: '/labor-cost', icon: Users },
    { name: 'Project Summary', href: '/project-summary', icon: FileText },
    { name: 'Market Analysis', href: '/market-analysis', icon: BarChart },
  ];

  const isActivePath = (path) => location.pathname === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile Menu Button - Fixed at top */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#1a1f2b] text-white rounded-lg shadow-lg hover:bg-[#252b3b] transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Responsive */}
      <aside
        className={`
          flex flex-col h-screen bg-[#1a1f2b] text-white
          fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out
          w-64 md:w-56 lg:w-64
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Branding - Responsive text size */}
        <div className="p-4 md:p-5 border-b border-gray-700/50">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
            JengaEstimate
          </h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3 md:p-4 overflow-y-auto">
          <ul className="space-y-1.5 md:space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={closeMobileMenu}
                    className={`
                      flex items-center space-x-3 p-3 md:p-3.5 rounded-lg
                      transition-all duration-200 min-h-[44px]
                      ${isActivePath(item.href)
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'hover:bg-gray-700/50 active:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm md:text-base truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-3 md:p-4 border-t border-gray-700/50">
          <button
            onClick={() => {
              logout();
              closeMobileMenu();
            }}
            className="flex items-center space-x-3 p-3 md:p-3.5 w-full rounded-lg hover:bg-gray-700/50 active:bg-gray-700 transition-all duration-200 min-h-[44px]"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm md:text-base">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;