import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

/**
 * Reusable PostCard component for displaying post previews
 * Used on home page and category pages
 */
const PostCard = ({ post }) => {
  // Enhanced category badge styling with gradients
  const getCategoryStyle = (category) => {
    switch (category) {
      case 'news':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          text: 'text-white',
          icon: '📰'
        };
      case 'quote':
        return {
          bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
          text: 'text-white',
          icon: '💭'
        };
      case 'caption':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          text: 'text-white',
          icon: '✨'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-slate-500',
          text: 'text-white',
          icon: '📝'
        };
    }
  };

  const categoryStyle = getCategoryStyle(post.category);

  // Format date
  const formatDate = () => {
    const date = new Date(post.createdAt?.toDate ? post.createdAt.toDate() : post.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link to={`/post/${post.slug}`} className="block group">
      <article className="h-full bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-gray-100">
        {/* Post thumbnail with overlay gradient */}
        <div className="relative h-56 overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Category badge - positioned on image */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${categoryStyle.bg} ${categoryStyle.text} shadow-lg backdrop-blur-sm`}>
              <span>{categoryStyle.icon}</span>
              <span className="uppercase tracking-wider">{post.category}</span>
            </span>
          </div>

          {/* Read time indicator */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
              <Clock className="w-3.5 h-3.5" />
              <span>5 min read</span>
            </div>
          </div>
        </div>
        
        {/* Post content */}
        <div className="p-6 space-y-3">
          {/* Post title */}
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 line-clamp-2 leading-tight">
            {post.title}
          </h3>
          
          {/* Post excerpt */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
          
          {/* Footer section */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Post date */}
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <time>{formatDate()}</time>
            </div>
            
            {/* Read more indicator */}
            <div className="flex items-center gap-1 text-blue-600 text-sm font-semibold group-hover:gap-2 transition-all duration-300">
              <span>Read</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className={`h-1 ${categoryStyle.bg} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
      </article>
    </Link>
  );
};

export default PostCard;