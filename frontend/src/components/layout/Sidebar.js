import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Wrench,
  Users,
  FileText,
  BarChart,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Material Cost', href: '/material-cost', icon: Wrench },
    { name: 'Labor Cost', href: '/labor-cost', icon: Users },
    { name: 'Project Summary', href: '/project-summary', icon: FileText },
    { name: 'Market Analysis', href: '/market-analysis', icon: BarChart },
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen bg-[#1a1f2b] text-white w-64 fixed left-0 top-0">
      <div className="p-5">
        <h1 className="text-2xl font-bold">JengaEstimate</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActivePath(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-gray-700 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;