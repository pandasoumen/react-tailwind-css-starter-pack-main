import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBlogPosts } from '../store/slices/blogSlice';

export default function Blog() {
  const dispatch = useDispatch();
  const blogState = useSelector((state) => state.blog) || {};
  const posts = Array.isArray(blogState.posts) ? blogState.posts : [];

  useEffect(() => {
    dispatch(getBlogPosts());
  }, [dispatch]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-[#0B3D91] mb-6">Health Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.length === 0 ? (
          <p className="text-slate-500">No blog posts found.</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{post.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{post.excerpt}</p>
              <p className="text-slate-500 text-xs">By {post.author?.name}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
