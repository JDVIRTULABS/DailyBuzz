import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, FileText, Quote, MessageSquare, Lock, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Navigation component with responsive mobile menu
 * Shows admin options only for authenticated users
 */
const Navigation = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      setIsOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            DailyBuzz
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link to="/news" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <FileText size={18} />
              <span>News</span>
            </Link>
            {/* <Link to="/quotes" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <Quote size={18} />
              <span>Quotes</span>
            </Link>
            <Link to="/captions" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <MessageSquare size={18} />
              <span>Captions</span>
            </Link> */}
            
            {/* Show Admin and Logout only if user is authenticated */}
            {user && (
              <>
                <Link to="/admin" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                  <Lock size={18} />
                  <span>Admin</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link 
              to="/" 
              className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/news" 
              className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              News
            </Link>
            {/* <Link 
              to="/quotes" 
              className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Quotes
            </Link>
            <Link 
              to="/captions" 
              className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Captions
            </Link> */}
            
            {user && (
              <>
                <Link 
                  to="/admin" 
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Admin
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;