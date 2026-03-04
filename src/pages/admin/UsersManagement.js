import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data?.users || []);
  };

  useEffect(() => {
    fetchUsers().catch(() => setUsers([]));
  }, []);

  const blockUser = async (id) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${BASE_URL}/admin/users/${id}/block`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers();
  };

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Users Management</h1>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.isActive ? "Active" : "Blocked"}</td>
                <td className="p-3">
                  <button
                    className="rounded bg-red-600 px-3 py-1 text-white"
                    onClick={() => blockUser(user._id)}
                    disabled={!user.isActive}
                  >
                    Block
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UsersManagement;
