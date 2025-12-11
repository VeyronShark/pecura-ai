import { Link, useLocation } from 'react-router-dom';
import { User, Home, Search, BookOpen, Settings, FlaskConical, Calendar } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Quiz', href: '/quiz', icon: Search },
    { name: 'Products', href: '/products', icon: BookOpen },
    { name: 'Ingredients', href: '/ingredient-checker', icon: FlaskConical },
    { name: 'Routine', href: '/routine-builder', icon: Calendar },
    { name: 'Dashboard', href: '/dashboard', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PA</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Pecura AI</span>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-purple-600'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Layout;