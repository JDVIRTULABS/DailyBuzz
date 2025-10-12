import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import PostCard from '../components/PostCard';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = collection(db, 'posts');

        const q = query(
          postsRef,
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(12)
        );

        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            if (!data.createdAt || !data.status) return null;
            return { id: doc.id, ...data };
          })
          .filter(Boolean);

        setPosts(postsData);
      } catch (error) {
        if (error.code === 'failed-precondition') {
          console.warn('Firestore index missing. Please create the required composite index.');
        } else {
          console.error('Error fetching posts:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
              <Sparkles className="w-4 h-4" />
              <span>Discover Amazing Stories</span>
            </div>
            
            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">DailyBuzz</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Your daily dose of news, inspiration, and creativity from writers around the world
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Latest Posts
              </h2>
            </div>
            <p className="text-gray-600 ml-14">Fresh content updated every day</p>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>Updated recently</span>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-6 space-y-4">
                  <div className="h-3 bg-gray-200 rounded-full w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-full"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-600 text-lg">Check back soon for amazing content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <PostCard post={post}  />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style> */}
    </div>
  );
};

export default Home;