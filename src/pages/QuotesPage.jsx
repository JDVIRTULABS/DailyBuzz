import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import SEO from '../components/SEO';
import { Sparkles } from 'lucide-react';

/**
 * Quotes Page - Displays published quotes
 */
const QuotesPage = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const postRef = collection(db, 'posts');
                const q = query(
                    postRef,
                    collection(db, 'posts'),
                    where('status', '==', 'published')

                );
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(post => post.category === 'quote')
                    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
                setQuotes(data);
            } catch (err) {
                console.error('Error fetching quotes:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <SEO
                title="Quotes - DailyBuzz"
                description="Read daily inspirational and motivational quotes on DailyBuzz."
                url={`${window.location.origin}/quotes`}
            />

            {/* Page Header */}
            <div className="max-w-4xl mx-auto text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30 mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span>Inspire Yourself</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                    Daily <span className="text-purple-600">Quotes</span>
                </h1>
                <p className="text-gray-700 text-lg mt-4">
                    Discover the best inspirational, motivational, and thought-provoking quotes updated daily.
                </p>
            </div>

            {/* Quotes Grid */}
            {loading ? (
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    ))}
                </div>
            ) : quotes.length === 0 ? (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                        <Sparkles className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No quotes yet</h3>
                    <p className="text-gray-600 text-lg">Check back soon for daily inspiration!</p>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {quotes.map((quote) => (
                        <div
                            key={quote.id}
                            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2"
                        >
                            <p className="text-gray-900 text-lg md:text-xl font-semibold mb-4">“{quote.content}”</p>
                            {quote.author && (
                                <p className="text-gray-500 text-sm md:text-base text-right">— {quote.author}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuotesPage;
