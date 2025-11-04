import React, { useState, useEffect } from "react";
import { createGoal, getGoals, updateGoal, deleteGoal } from "../api";
import { useAuth } from "../context/AuthContext";

const GoalForm = () => {
    const { user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [formData, setFormData] = useState({
        goalTitle: "",
        description: "",
        successCriteria: "",
        dueDate: "",
        status: "Draft",
    });
    const [editingId, setEditingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("All");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        const data = await getGoals();
        setGoals(data);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            await updateGoal(editingId, formData);
            setEditingId(null);
        } else {
            await createGoal(formData);
        }
        setFormData({
            goalTitle: "",
            description: "",
            successCriteria: "",
            dueDate: "",
            status: "Draft",
        });
        setShowForm(false);
        fetchGoals();
    };

    const handleEdit = (goal) => {
        setFormData({
            goalTitle: goal.goalTitle,
            description: goal.description,
            successCriteria: goal.successCriteria,
            dueDate: goal.dueDate.split('T')[0],
            status: goal.status,
        });
        setEditingId(goal._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this goal?")) {
            await deleteGoal(id);
            fetchGoals();
        }
    };

    const filteredGoals = filterStatus === "All" 
        ? goals 
        : goals.filter(g => g.status === filterStatus);

    const canEdit = (goal) => {
        return user.role === "Employee" && !goal.reviewedBy && goal.status !== "Approved";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Goals Management</h1>
                            <p className="text-gray-600 mt-1">Create and track your performance goals</p>
                        </div>
                        {user.role === "Employee" && (
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition shadow-lg"
                            >
                                {showForm ? "Cancel" : "+ New Goal"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Goal Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            {editingId ? "Edit Goal" : "Create New Goal"}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                name="goalTitle"
                                placeholder="Goal Title"
                                value={formData.goalTitle}
                                onChange={handleChange}
                                required
                                className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                            />
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                required
                                className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                            />
                            <textarea
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="col-span-2 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                            />
                            <textarea
                                name="successCriteria"
                                placeholder="Success Criteria"
                                value={formData.successCriteria}
                                onChange={handleChange}
                                rows="2"
                                className="col-span-2 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                            />
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition"
                            >
                                {editingId ? "Update Goal" : "Create Goal"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Filter */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {["All", "Draft", "Under Review", "Approved", "Not Started", "In Progress", "Completed"].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filterStatus === status
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Goals List */}
                <div className="space-y-4">
                    {filteredGoals.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <div className="text-6xl mb-4">🎯</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">No goals found</h3>
                            <p className="text-gray-600">Start by creating your first goal!</p>
                        </div>
                    ) : (
                        filteredGoals.map((goal) => (
                            <div key={goal._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800">{goal.goalTitle}</h3>
                                        <p className="text-gray-600 mt-1">{goal.description}</p>
                                        {goal.successCriteria && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                <strong>Success Criteria:</strong> {goal.successCriteria}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(goal.status)}`}>
                                        {goal.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Employee</p>
                                        <p className="font-semibold text-gray-800">{goal.employeeName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Department</p>
                                        <p className="font-semibold text-gray-800">{goal.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Due Date</p>
                                        <p className="font-semibold text-gray-800">
                                            {new Date(goal.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {goal.achievementRating && (
                                        <div>
                                            <p className="text-gray-500">Rating</p>
                                            <p className="font-semibold text-gray-800">{goal.achievementRating}/5 ⭐</p>
                                        </div>
                                    )}
                                </div>

                                {goal.managerFeedback && (
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
                                        <p className="text-sm font-semibold text-gray-700">Manager Feedback:</p>
                                        <p className="text-sm text-gray-600 mt-1">{goal.managerFeedback}</p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {canEdit(goal) && (
                                        <>
                                            <button
                                                onClick={() => handleEdit(goal)}
                                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(goal._id)}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case "Completed":
            return "bg-green-100 text-green-800";
        case "In Progress":
            return "bg-yellow-100 text-yellow-800";
        case "Approved":
            return "bg-blue-100 text-blue-800";
        case "Under Review":
            return "bg-purple-100 text-purple-800";
        case "Draft":
            return "bg-gray-100 text-gray-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export default GoalForm;