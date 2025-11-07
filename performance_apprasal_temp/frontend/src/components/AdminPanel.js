import React, { useState, useEffect } from "react";
import { getAllUsers, updateUserRole, deleteUser, downloadCSVExport } from "../api";

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ role: "", managerId: "" });
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const data = await getAllUsers();
        setUsers(data);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({ role: user.role, managerId: user.managerId?._id || "" });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        await updateUserRole(editingUser._id, formData);
        setEditingUser(null);
        fetchUsers();
    };

    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            await deleteUser(userId);
            fetchUsers();
        }
    };

    const filteredUsers = filter === "All" ? users : users.filter(u => u.role === filter);
    const managers = users.filter(u => u.role === "Manager" || u.role === "HR Admin");

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
                            <p className="text-gray-600 mt-1">Manage users and system configuration</p>
                        </div>
                        <button
                            onClick={downloadCSVExport}
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition shadow-lg"
                        >
                            📊 Export CSV
                        </button>
                    </div>
                </div>

                {/* Edit User Modal */}
                {editingUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit User</h2>
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <p className="font-semibold">{editingUser.name}</p>
                                <p className="text-sm text-gray-600">{editingUser.email}</p>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                    >
                                        <option value="Employee">Employee</option>
                                        <option value="Manager">Manager</option>
                                        <option value="HR Admin">HR Admin</option>
                                    </select>
                                </div>

                                {formData.role === "Employee" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign Manager</label>
                                        <select
                                            value={formData.managerId}
                                            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                        >
                                            <option value="">No Manager</option>
                                            {managers.map(manager => (
                                                <option key={manager._id} value={manager._id}>
                                                    {manager.name} ({manager.role})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                                    >
                                        Update
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Filter */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {["All", "Employee", "Manager", "HR Admin"].map(role => (
                            <button
                                key={role}
                                onClick={() => setFilter(role)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filter === role
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                        <p className="text-white/80 text-sm font-medium">Total Employees</p>
                        <p className="text-4xl font-bold mt-2">{users.filter(u => u.role === "Employee").length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                        <p className="text-white/80 text-sm font-medium">Managers</p>
                        <p className="text-4xl font-bold mt-2">{users.filter(u => u.role === "Manager").length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                        <p className="text-white/80 text-sm font-medium">HR Admins</p>
                        <p className="text-4xl font-bold mt-2">{users.filter(u => u.role === "HR Admin").length}</p>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                <tr>
                                    <th className="text-left p-4">Name</th>
                                    <th className="text-left p-4">Email</th>
                                    <th className="text-left p-4">Role</th>
                                    <th className="text-left p-4">Department</th>
                                    <th className="text-left p-4">Manager</th>
                                    <th className="text-center p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="border-b hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-800">{user.name}</td>
                                        <td className="p-4 text-gray-600">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">{user.department || "N/A"}</td>
                                        <td className="p-4 text-gray-600">{user.managerId?.name || "N/A"}</td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getRoleColor = (role) => {
    switch (role) {
        case "HR Admin":
            return "bg-purple-100 text-purple-800";
        case "Manager":
            return "bg-blue-100 text-blue-800";
        case "Employee":
            return "bg-green-100 text-green-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export default AdminPanel;