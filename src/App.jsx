import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Import components
import Navigation from './components/Navigation';

// Import pages
import Home from './pages/Home';
import PostPage from './pages/PostPage';
import Admin from './pages/Admin';
import QuotesPage from './pages/QuotesPage';
import NewsPage from './pages/NewsPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
        <Route path="/captions" element={<NewsPage />} />
        <Route path="/post/:slug" element={<PostPage />} />

        {/* Admin Route */}
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">DailyBuzz</p>
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} DailyBuzz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
