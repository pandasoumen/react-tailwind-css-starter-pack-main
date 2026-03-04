import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/admin/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts(res.data?.products || []);
  };

  useEffect(() => {
    fetchProducts().catch(() => setProducts([]));
  }, []);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Products Management</h1>
      <div className="space-y-3">
        {products.map((product) => (
          <div key={product._id} className="rounded-lg border bg-white p-4 shadow-sm text-sm">
            <p className="font-semibold">{product.name}</p>
            <p>Category: {product.category}</p>
            <p>Price: {product.price}</p>
            <p>Stock: {product.stock}</p>
            <p>Status: {product.isActive ? "Active" : "Inactive"} / {product.isHidden ? "Hidden" : "Visible"}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductsManagement;
