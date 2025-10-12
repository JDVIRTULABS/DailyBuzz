import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Clock } from 'lucide-react';
import SEO from '../components/SEO';

const PostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setPost({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'news': return 'bg-blue-100 text-blue-800';
      case 'quote': return 'bg-purple-100 text-purple-800';
      case 'caption': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse w-full max-w-4xl space-y-4 p-6 bg-white rounded-2xl shadow-lg">
          <div className="h-80 bg-gray-200 rounded-lg"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-4">The post you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
<SEO
  title={`${post.title} - DailyBuzz`}
  description={post.excerpt || post.title}
  image={post.imageUrl}
  url={`${window.location.origin}/post/${post.slug}`}
/>
  return (
    
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 border p-2 mb-2 border-blue-600 rounded-2xl bg-blue-600 text-white hover:text-white font-medium"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Hero Image */}
        {post.imageUrl && (
          <div className="relative group">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-96 object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
            />
            <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(post.category)} backdrop-blur-sm`}>
              {post.category?.toUpperCase()}
            </span>
          </div>
        )}

        <div className="p-8 space-y-6">
          {/* Back Button */}

          {/* Post Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 ">
            {post.title}
          </h1>

          {/* Post Meta */}
          <div className="flex items-center gap-4 text-gray-500">
            <Clock className="w-4 h-4" />
            <time dateTime={post.createdAt?.toDate ? post.createdAt.toDate().toISOString() : new Date(post.createdAt).toISOString()}>
              {new Date(post.createdAt?.toDate ? post.createdAt.toDate() : post.createdAt).toLocaleDateString('en-US', {
                year:'numeric', month:'long', day:'numeric'
              })}
            </time>
          </div>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
    </div>
  );
};

export default PostPage;
