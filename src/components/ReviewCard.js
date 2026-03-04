export default function ReviewCard({ review }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-white font-semibold">{review.user?.name || 'Anonymous'}</h4>
          <div className="text-primary text-sm">
            {'⭐'.repeat(review.rating)}
          </div>
        </div>
        <span className="text-xs text-slate-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-slate-300 text-sm">{review.comment}</p>
    </div>
  );
}