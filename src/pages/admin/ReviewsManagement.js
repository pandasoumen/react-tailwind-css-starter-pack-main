import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/admin/reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setReviews(res.data?.reviews || []);
  };

  useEffect(() => {
    fetchReviews().catch(() => setReviews([]));
  }, []);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Reviews Management</h1>
      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review._id} className="rounded-lg border bg-white p-4 shadow-sm text-sm">
            <p className="font-semibold">{review.user?.name || "User"}</p>
            <p>Doctor: {review.doctor?.name || "N/A"}</p>
            <p>Rating: {review.rating}</p>
            <p>Comment: {review.comment}</p>
            <p>Flagged: {review.isFlagged ? "Yes" : "No"}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewsManagement;
