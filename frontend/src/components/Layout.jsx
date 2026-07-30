import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: '/telegram', label: 'Telegram' },
    { path: '/reddit', label: 'Reddit' },
    { path: '/discord', label: 'Discord' },
    { path: '/settings', label: 'Configuración' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 shadow-xl flex-shrink-0">
        <h1 className="text-2xl font-bold mb-8 text-blue-400">GlidePost</h1>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`block py-2 px-4 rounded transition duration-200 ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}