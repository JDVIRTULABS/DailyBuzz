import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import SEO from '../components/SEO';
import { TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * News Page - Displays published news posts
 */
const NewsPage = () => {
    const [newsPosts, setNewsPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const newsRef = collection(db, 'posts');
                const q = query(
                    collection(db, 'posts'),
                    where('status', '==', 'published')
                );
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(post => post.category === 'news')
                    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
                setNewsPosts(data);
            } catch (err) {
                console.error('Error fetching news:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
          <SEO
  title={`${post.title} | DailyBuzz`}
  description={post.excerpt || "Stay updated with the latest news on DailyBuzz."}
  url={`${window.location.origin}/news/${post.slug}`}
  image={post.imageUrl}
/>


            {/* Page Header */}
            <div className="max-w-4xl mx-auto text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30 mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span>Stay Updated</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                    Latest <span className="text-blue-600">News</span>
                </h1>
                <p className="text-gray-700 text-lg mt-4">
                    Catch the most trending, breaking, and relevant news stories updated daily.
                </p>
            </div>

            {/* News Grid */}
            {loading ? (
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse space-y-4">
                            <div className="h-48 bg-gray-200 rounded-lg"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    ))}
                </div>
            ) : newsPosts.length === 0 ? (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                        <TrendingUp className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No news yet</h3>
                    <p className="text-gray-600 text-lg">Check back soon for the latest news updates!</p>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {newsPosts.map((post) => (
                        <Link
                            to={`/post/${post.slug}`}
                            key={post.id}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2"
                        >
                            <div className="relative">
                                <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="w-full h-56 object-cover transition-transform duration-500 transform hover:scale-105"
                                />
                                <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {post.category}
                                </span>
                            </div>
                            <div className="p-6 space-y-2">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900">{post.title}</h2>
                                <p className="text-gray-600 text-sm">
                                    {new Date(post.createdAt?.toDate ? post.createdAt.toDate() : post.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsPage;
