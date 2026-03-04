import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiFilter, FiSliders } from "react-icons/fi";
import { getProducts, addToCart } from "../../store/slices/productSlice";
import ProductCard from "../../components/ProductCard";
import CartSidebar from "../../components/cartSidebar";

const saleTypes = ["all", "on-sale", "regular"];
const priceRanges = ["all", "under-500", "500-1000", "1000-2000", "2000+"];
const priceRangeLabels = {
  all: "All Prices",
  "under-500": "Under 500",
  "500-1000": "500 to 1000",
  "1000-2000": "1000 to 2000",
  "2000+": "2000+",
};

const toNumberPrice = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const toTimestamp = (value) => {
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const toBestSellScore = (product) =>
  Math.max(
    Number(product?.sold) || 0,
    Number(product?.salesCount) || 0,
    Number(product?.totalSales) || 0,
    Number(product?.ordersCount) || 0
  );

const isOnSaleProduct = (product) =>
  Boolean(
    product?.isOnSale ||
      Number(product?.discountPercentage) > 0 ||
      (Number(product?.originalPrice) > 0 &&
        Number(product?.price) < Number(product?.originalPrice))
  );

export default function Store() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const productsState = useSelector((state) => state.products) || {};
  const products = Array.isArray(productsState.products) ? productsState.products : [];
  const cart = Array.isArray(productsState.cart) ? productsState.cart : [];
  const isLoading = Boolean(productsState.isLoading);

  const [wishlist, setWishlist] = React.useState([]);
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = React.useState(true);
  const [sortBy, setSortBy] = React.useState("default");
  const [brandFilter, setBrandFilter] = React.useState("all");
  const [saleFilter, setSaleFilter] = React.useState("all");
  const [priceFilter, setPriceFilter] = React.useState("all");
  const [filterOpen, setFilterOpen] = React.useState(false);

  const params = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const view = (params.get("view") || "").trim().toLowerCase();
  const showWishlistOnly = view === "wishlist";
  const shouldOpenCart = view === "cart";

  const handleCloseCart = React.useCallback(() => {
    if (view !== "cart") return;
    const nextParams = new URLSearchParams(location.search);
    nextParams.delete("view");
    const nextQuery = nextParams.toString();
    navigate(`${location.pathname}${nextQuery ? `?${nextQuery}` : ""}`, { replace: true });
  }, [location.pathname, location.search, navigate, view]);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  useEffect(() => {
    const stored = localStorage.getItem("wishlistProducts");
    const ids = stored ? JSON.parse(stored) : [];
    setWishlist(Array.isArray(ids) ? ids : []);
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlistProducts", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const categories = React.useMemo(() => {
    const set = new Set(
      products
        .map((product) => String(product?.category || "").trim())
        .filter(Boolean)
    );
    return ["All", ...Array.from(set)];
  }, [products]);

  const brands = React.useMemo(() => {
    const set = new Set(
      products
        .map((product) =>
          String(product?.brand || product?.manufacturer || "Generic").trim()
        )
        .filter(Boolean)
    );
    return ["all", ...Array.from(set)];
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    let next = [...products];

    if (showWishlistOnly) {
      next = next.filter((product) => wishlist.includes(product._id));
    }

    if (activeCategory !== "All") {
      next = next.filter((product) => String(product?.category || "") === activeCategory);
    }

    if (brandFilter !== "all") {
      next = next.filter(
        (product) =>
          String(product?.brand || product?.manufacturer || "Generic") === brandFilter
      );
    }

    if (saleFilter === "on-sale") {
      next = next.filter((product) => isOnSaleProduct(product));
    }
    if (saleFilter === "regular") {
      next = next.filter((product) => !isOnSaleProduct(product));
    }

    if (priceFilter !== "all") {
      next = next.filter((product) => {
        const price = toNumberPrice(product?.price);
        if (priceFilter === "under-500") return price < 500;
        if (priceFilter === "500-1000") return price >= 500 && price <= 1000;
        if (priceFilter === "1000-2000") return price > 1000 && price <= 2000;
        if (priceFilter === "2000+") return price > 2000;
        return true;
      });
    }

    if (sortBy === "price-low") {
      next.sort((a, b) => toNumberPrice(a?.price) - toNumberPrice(b?.price));
    } else if (sortBy === "price-high") {
      next.sort((a, b) => toNumberPrice(b?.price) - toNumberPrice(a?.price));
    } else if (sortBy === "name-az") {
      next.sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || ""))
      );
    } else if (sortBy === "latest") {
      next.sort((a, b) => {
        const bTime = toTimestamp(b?.createdAt || b?.updatedAt || b?.dateAdded);
        const aTime = toTimestamp(a?.createdAt || a?.updatedAt || a?.dateAdded);
        return bTime - aTime;
      });
    } else if (sortBy === "best-sell") {
      next.sort((a, b) => toBestSellScore(b) - toBestSellScore(a));
    }

    return next;
  }, [products, wishlist, showWishlistOnly, activeCategory, brandFilter, saleFilter, priceFilter, sortBy]);

  const categoryCount = React.useMemo(
    () =>
      products.reduce((acc, product) => {
        const key = String(product?.category || "").trim();
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    [products]
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-[#ecf0f4] p-4 shadow-sm md:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
        <aside
          className={`rounded-3xl bg-white p-4 shadow-sm transition-all duration-300 ${
            isCategoryPanelOpen ? "w-[300px]" : "w-[88px]"
          }`}
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            {isCategoryPanelOpen && (
              <h2 className="text-4xl font-bold text-[#073b71]">Category</h2>
            )}
            <button
              type="button"
              onClick={() => setIsCategoryPanelOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              title={isCategoryPanelOpen ? "Collapse categories" : "Expand categories"}
              aria-label={isCategoryPanelOpen ? "Collapse categories" : "Expand categories"}
            >
              <FiSliders />
            </button>
          </div>
          {isCategoryPanelOpen && (
            <div className="space-y-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-lg ${
                    activeCategory === category
                      ? "bg-[#e6f5f4] font-semibold text-[#0b8b86]"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{category}</span>
                  <span className="text-slate-400">
                    {category === "All" ? products.length : categoryCount[category] || 0}
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section>
          <div className="mb-4 rounded-2xl bg-white px-3 py-2 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="sortBy" className="text-sm font-semibold text-slate-600">
                Sort By:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="min-w-[200px] rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 outline-none"
              >
                <option value="default">Default Sorting</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-az">Name: A-Z</option>
                <option value="latest">Latest Items</option>
                <option value="best-sell">Best Sell Items</option>
              </select>

              <p className="text-sm text-slate-500">
                Showing 1-{filteredProducts.length} of {filteredProducts.length} Results
              </p>

              <div className="relative ml-auto">
                <button
                  type="button"
                  onClick={() => setFilterOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-md bg-[#0ea5a0] px-2.5 py-1 text-sm font-semibold text-white hover:bg-[#0b8b86]"
                >
                  <FiFilter />
                  Filter
                  <FiChevronDown />
                </button>

                {filterOpen && (
                  <div className="absolute right-0 top-12 z-30 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
                    <div className="mb-3">
                      <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Brand</label>
                      <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
                      >
                        {brands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand === "all" ? "All Brands" : brand}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Price Range</label>
                      <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
                      >
                        {priceRanges.map((range) => (
                          <option key={range} value={range}>
                            {priceRangeLabels[range]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Sales</label>
                      <select
                        value={saleFilter}
                        onChange={(e) => setSaleFilter(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"
                      >
                        {saleTypes.map((sale) => (
                          <option key={sale} value={sale}>
                            {sale === "all"
                              ? "All"
                              : sale === "on-sale"
                                ? "On Sale"
                                : "Regular"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setBrandFilter("all");
                        setPriceFilter("all");
                        setSaleFilter("all");
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showWishlistOnly && (
            <p className="mb-4 text-sm font-semibold text-[#0B3D91]">Showing wishlist products</p>
          )}

          {isLoading && <p className="text-lg text-slate-600">Loading products...</p>}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {!isLoading &&
              filteredProducts.length > 0 &&
              filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={(item) => dispatch(addToCart(item))}
                  isWishlisted={wishlist.includes(product._id)}
                  onToggleWishlist={() => toggleWishlist(product._id)}
                />
              ))}
          </div>

          {!isLoading && filteredProducts.length === 0 && (
            <p className="mt-2 text-slate-500">No products found for selected filters.</p>
          )}
        </section>
      </div>

      <CartSidebar cart={cart} forceOpen={shouldOpenCart} onClose={handleCloseCart} />
    </div>
  );
}
