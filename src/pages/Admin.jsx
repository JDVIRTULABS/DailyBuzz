import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, orderBy, query, Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  Trash2, Edit, Save, X, Upload, Image as ImageIcon, 
  LogOut, User, Calendar, Eye, EyeOff, Sparkles 
} from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentPost, setCurrentPost] = useState({
    title: '',
    excerpt: '',
    category: 'news',
    content: '',
    imageUrl: '',
    status: 'draft'
  });

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchPosts();
    });
    return () => unsubscribe();
  }, []);

  // Google Login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      alert(`Welcome ${result.user.displayName}! 🎉`);
    } catch (error) {
      console.error('Google login error:', error);
      alert('Failed to login. Please try again.');
    }
  };

  // Logout
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await signOut(auth);
      setUser(null);
      alert('Logged out successfully');
      navigate('/');
    }
  };

  // Fetch posts
 const fetchPosts = async () => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt || Timestamp.now() // fallback if missing
    }));
    setPosts(postsData);
  } catch (error) {
    console.error('Error fetching posts:', error);
    alert('Failed to load posts');
  } finally {
    setLoadingPosts(false);
  }
};


  // Slug generator
  const generateSlug = (title) => title.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Upload image
 // Upload image to Cloudinary
const uploadImage = async () => {
  if (!imageFile) return currentPost.imageUrl; // keep existing image if no new file

  try {
    setUploading(true);

    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', 'dailybuzz_preset'); // replace with your preset

    const res = await fetch(`https://api.cloudinary.com/v1_1/du6kgmxnu/image/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Upload failed');

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    alert('Failed to upload image to Cloudinary');
    return currentPost.imageUrl;
  } finally {
    setUploading(false);
  }
};

  // Submit post
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageUrl = await uploadImage();
      const slug = generateSlug(currentPost.title);
      const postData = {
        ...currentPost,
        slug,
        imageUrl,
        updatedAt: Timestamp.now()
      };

      if (isEditing) {
        const postRef = doc(db, 'posts', currentPost.id);
        await updateDoc(postRef, postData);
        setPosts(posts.map(p => p.id === currentPost.id ? { id: currentPost.id, ...postData } : p));
        alert('✅ Post updated successfully!');
      } else {
        postData.createdAt = Timestamp.now();
        const docRef = await addDoc(collection(db, 'posts'), postData);
        setPosts([{ id: docRef.id, ...postData }, ...posts]);
        alert('✅ Post created successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('❌ Failed to save post. Please try again.');
    }
  };

  const resetForm = () => {
    setCurrentPost({
      title: '',
      excerpt: '',
      category: 'news',
      content: '',
      imageUrl: '',
      status: 'draft'
    });
    setIsEditing(false);
    setImageFile(null);
    setImagePreview('');
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setIsEditing(true);
    setImagePreview(post.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this post? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
      setPosts(posts.filter(p => p.id !== id));
      alert('🗑️ Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'news': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'quote': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'caption': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'news': return '📰';
      case 'quote': return '💭';
      case 'caption': return '✨';
      default: return '📄';
    }
  };
const contentTypes = {
  news: { label: '📰 News', hasImage: true, hasContent: true },
  quote: { label: '💭 Quote', hasImage: false, hasContent: true },
  caption: { label: '✨ Caption', hasImage: true, hasContent: false },
  motivation: { label: '🔥 Motivation', hasImage: false, hasContent: true },
  // add more types here
};

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
       
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="mb-8 animate-bounce">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
              <Sparkles className="text-white" size={48} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DailyBuzz Admin
          </h1>
          <p className="text-gray-600 mb-8 text-lg">Sign in to manage your content</p>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            className="group relative px-8 py-4 bg-white text-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 hover:border-blue-400 flex items-center space-x-3 mx-auto"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-semibold text-lg">Sign in with Google</span>
          </button>

          {/* Info Box */}
          <div className="mt-12 max-w-md mx-auto bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
            <p className="text-sm text-gray-600">
              <strong className="text-gray-800">🔒 Admin Access Only</strong><br />
              This dashboard is restricted to authorized administrators. Please sign in with your Google account to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
     
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 flex items-center space-x-2">
                  <User size={14} />
                  <span>{user.displayName || user.email}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all transform hover:scale-105 shadow-md"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total Posts</p>
            <p className="text-3xl font-bold text-gray-800">{posts.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-3xl font-bold text-gray-800">{posts.filter(p => p.status === 'published').length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600">Drafts</p>
            <p className="text-3xl font-bold text-gray-800">{posts.filter(p => p.status === 'draft').length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-3xl font-bold text-gray-800">3</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CREATE/EDIT FORM */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Save size={24} />
                  <h2 className="text-2xl font-bold">
                    {isEditing ? 'Edit Post' : 'Create New Post'}
                  </h2>
                </div>
                {isEditing && (
                  <button
                    onClick={resetForm}
                    className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Post Title *
                </label>
                <input
                  type="text"
                  value={currentPost.title}
                  onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                  placeholder="Enter an engaging title..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ✍️ Excerpt *
                </label>
                <textarea
                  value={currentPost.excerpt}
                  onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                  placeholder="Brief description that appears in previews..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  rows={3}
                  required
                />
              </div>

              {/* Category */}
             <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    🏷️ Type *
  </label>
  <select
    value={currentPost.category}
    onChange={(e) =>
      setCurrentPost({ ...currentPost, category: e.target.value })
    }
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
  >
    {Object.keys(contentTypes).map((key) => (
      <option key={key} value={key}>
        {contentTypes[key].label}
      </option>
    ))}
  </select>
</div>

              {/* Image Upload */}
{contentTypes[currentPost.category]?.hasImage && (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      🖼️ Hero Image
    </label>
    {imagePreview && (
      <div className="mb-3 relative group">
        <img
          src={imagePreview}
          alt="Preview"
          className="w-full h-56 object-cover rounded-xl border-2 border-gray-200"
        />
      </div>
    )}
    <label className="flex items-center justify-center space-x-3 px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
      <Upload size={24} className="text-gray-600" />
      <span className="text-gray-600 font-medium">
        {imageFile ? imageFile.name : 'Click to upload image'}
      </span>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </label>
    <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
  </div>
)}

{/* Content */}
{contentTypes[currentPost.category]?.hasContent && (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      📄 Content
    </label>
    <textarea
      value={currentPost.content}
      onChange={(e) =>
        setCurrentPost({ ...currentPost, content: e.target.value })
      }
      placeholder="Write your amazing content here..."
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono text-sm resize-none"
      rows={8}
      required
    />
  </div>
)}
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🎯 Status *
                </label>
                <select
                  value={currentPost.status}
                  onChange={(e) => setCurrentPost({ ...currentPost, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="draft">📝 Draft</option>
                  <option value="published">✅ Published</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Uploading Image...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{isEditing ? 'Update Post' : 'Create Post'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* POSTS LIST */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* List Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ImageIcon size={24} />
                  <h2 className="text-2xl font-bold">All Posts</h2>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full">
                  <span className="font-bold text-lg">{posts.length}</span>
                </div>
              </div>
            </div>

            {/* Posts List Body */}
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {loadingPosts ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="text-gray-400 mb-4" size={64} />
                  <p className="text-gray-600 text-lg font-semibold">No posts yet</p>
                  <p className="text-gray-500 text-sm">Create your first post to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <div 
                      key={post.id} 
                      className="group border-2 border-gray-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
                    >
                      {/* Post Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(post.category)}`}>
                          <span>{getCategoryIcon(post.category)}</span>
                          <span className="capitalize">{post.category}</span>
                        </span>
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full border ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {post.status === 'published' ? <Eye size={12} /> : <EyeOff size={12} />}
                          <span className="capitalize">{post.status}</span>
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar size={14} />
                          <span>
                            {new Date(post.createdAt?.toDate ? post.createdAt.toDate() : post.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all transform hover:scale-110"
                            title="Edit post"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all transform hover:scale-110"
                            title="Delete post"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;