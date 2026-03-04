import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

const PaymentsManagement = () => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/admin/payments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTransactions(res.data?.transactions || []);
  };

  useEffect(() => {
    fetchTransactions().catch(() => setTransactions([]));
  }, []);

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Payments Management</h1>
      <div className="space-y-3">
        {transactions.map((item) => (
          <div key={item._id} className="rounded-lg border bg-white p-4 shadow-sm text-sm">
            <p className="font-semibold">Invoice: {item.invoiceNumber || "N/A"}</p>
            <p>Patient: {item.patientId?.name || "-"}</p>
            <p>Doctor: {item.doctorId?.name || "-"}</p>
            <p>Status: {item.paymentStatus}</p>
            <p>Amount: {item.paymentAmount}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PaymentsManagement;
