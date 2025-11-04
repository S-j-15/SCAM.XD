import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getGoals, reviewGoal, downloadPDFReport } from "../api";

const TeamView = () => {
    const { user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [reviewData, setReviewData] = useState({
        status: "",
        achievementRating: "",
        managerFeedback: "",
    });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        const data = await getGoals();
        setGoals(data);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        await reviewGoal(selectedGoal._id, reviewData);
        setSelectedGoal(null);
        setReviewData({ status: "", achievementRating: "", managerFeedback: "" });
        fetchGoals();
    };

    const groupedGoals = goals.reduce((acc, goal) => {
        const employeeName = goal.userId?.name || goal.employeeName;
        if (!acc[employeeName]) {
            acc[employeeName] = [];
        }
        acc[employeeName].push(goal);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Team Overview</h1>
                    <p className="text-gray-600 mt-1">Review and manage team member goals</p>
</div>

                {/* Review Modal */}
                {selectedGoal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Review Goal</h2>
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <h3 className="font-bold text-lg">{selectedGoal.goalTitle}</h3>
                                <p className="text-gray-600 mt-2">{selectedGoal.description}</p>
                            </div>

                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={reviewData.status}
                                        onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                    >
                                        <option value="">Select status</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Under Review">Under Review</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Achievement Rating (1-5)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={reviewData.achievementRating}
                                        onChange={(e) => setReviewData({ ...reviewData, achievementRating: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager Feedback</label>
                                    <textarea
                                        value={reviewData.managerFeedback}
                                        onChange={(e) => setReviewData({ ...reviewData, managerFeedback: e.target.value })}
                                        rows="4"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                        placeholder="Provide constructive feedback..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                                    >
                                        Submit Review
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGoal(null)}
                                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Team Members */}
                <div className="space-y-6">
                    {Object.keys(groupedGoals).length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">No team members found</h3>
                            <p className="text-gray-600">Team member goals will appear here</p>
                        </div>
                    ) : (
                        Object.entries(groupedGoals).map(([employeeName, employeeGoals]) => (
                            <div key={employeeName} className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">{employeeName}</h2>
                                        <p className="text-gray-600">
                                            {employeeGoals[0].department} • {employeeGoals.length} goals
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => downloadPDFReport(employeeGoals[0].userId._id || employeeGoals[0].userId)}
                                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium"
                                    >
                                        📄 Download Report
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {employeeGoals.map((goal) => (
                                        <div key={goal._id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-800">{goal.goalTitle}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                                                    <div className="flex gap-4 mt-2 text-sm">
                                                        <span className="text-gray-500">
                                                            Due: {new Date(goal.dueDate).toLocaleDateString()}
                                                        </span>
                                                        {goal.achievementRating && (
                                                            <span className="text-gray-500">
                                                                Rating: {goal.achievementRating}/5 ⭐
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(goal.status)}`}>
                                                        {goal.status}
                                                    </span>
                                                    <button
                                                        onClick={() => setSelectedGoal(goal)}
                                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium"
                                                    >
                                                        Review
                                                    </button>
                                                </div>
                                            </div>

                                            {goal.managerFeedback && (
                                                <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-lg mt-3">
                                                    <p className="text-sm font-semibold text-gray-700">Your Feedback:</p>
                                                    <p className="text-sm text-gray-600 mt-1">{goal.managerFeedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
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
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export default TeamView;