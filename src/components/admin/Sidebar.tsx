import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Clock, 
  UserCheck, 
  ChevronDown, 
  ChevronRight,
  X,
  Home,
  Calendar,
  FileText
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['reports']);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const menuItems = [
    {
      name: 'Overview',
      href: '/admin',
      icon: Home,
      exact: true
    },
    {
      name: 'Student Management',
      href: '/admin/students',
      icon: Users
    },
    {
      name: 'Group Settings',
      href: '/admin/groups',
      icon: UserCheck
    },
    {
      name: 'Shift Settings',
      href: '/admin/shifts',
      icon: Clock
    },
    {
      name: 'Attendance Settings',
      href: '/admin/settings',
      icon: Settings
    },
    {
      name: 'Attendance Reports',
      href: '/admin/reports',
      icon: BarChart3,
      submenu: [
        { name: 'Daily Reports', href: '/admin/reports?view=daily' },
        { name: 'Weekly Reports', href: '/admin/reports?view=weekly' },
        { name: 'Monthly Reports', href: '/admin/reports?view=monthly' }
      ]
    }
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-white">Attendance Admin</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.name}>
              <div className="flex items-center justify-between">
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${
                    isActive(item.href, item.exact)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
                {item.submenu && (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedMenus.includes(item.name) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              {item.submenu && expandedMenus.includes(item.name) && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.name}
                      to={subItem.href}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        location.pathname + location.search === subItem.href
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;