const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const getImage = (product) => {
  if (typeof product?.image === "string" && product.image) return product.image;
  if (typeof product?.imageUrl === "string" && product.imageUrl) return product.imageUrl;
  if (Array.isArray(product?.images) && product.images[0]) return product.images[0];
  return null;
};

const renderStars = (ratingValue) => {
  const rating = Math.max(0, Math.min(5, Math.round(Number(ratingValue) || 0)));
  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={index < rating ? "text-amber-500" : "text-slate-300"}>
      *
    </span>
  ));
};

export default function ProductCard({ product, onAddToCart, isWishlisted = false, onToggleWishlist }) {
  const imageSrc = getImage(product);
  const displayPrice = inrFormatter.format(Number(product?.price) || 0);
  const ratingValue = product?.rating || 4;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex justify-between">
        <button
          type="button"
          onClick={onToggleWishlist}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            isWishlisted ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-700 hover:bg-rose-200"
          }`}
        >
          {isWishlisted ? "Wishlisted" : "Wishlist"}
        </button>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      <div className="mb-5 flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
        {imageSrc ? (
          <img src={imageSrc} alt={product?.name || "Product"} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-medium text-slate-400">No image</span>
        )}
      </div>

      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {product?.category || "General"}
      </div>
      <h3 className="mb-2 truncate text-2xl font-semibold text-[#083b74]">{product?.name || "Unnamed Product"}</h3>

      <div className="mb-4 flex items-center gap-1 text-xl leading-none">
        {renderStars(ratingValue)}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className="text-3xl font-bold text-[#f35f61]">{displayPrice}</span>
        <span className="text-sm text-slate-500">Stock: {product?.stock ?? 0}</span>
      </div>

      <button
        onClick={() => onAddToCart(product)}
        disabled={product.stock === 0}
        className="w-full rounded-xl bg-[#0ea5a0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b8b86] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
      </button>
    </div>
  );
}
