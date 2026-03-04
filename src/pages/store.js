import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, addToCart } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';

export default function Store() {
  const dispatch = useDispatch();
  const { products, cart } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">Medical Store</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </div>
  );
}