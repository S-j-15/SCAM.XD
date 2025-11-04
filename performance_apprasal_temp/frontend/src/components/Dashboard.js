import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getEmployeeDashboard, getManagerDashboard, getAdminDashboard } from "../api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, [user]);

    const fetchDashboard = async () => {
        try {
            let data;
            if (user.role === "Employee") {
                data = await getEmployeeDashboard();
            } else if (user.role === "Manager") {
                data = await getManagerDashboard();
            } else if (user.role === "HR Admin") {
                data = await getAdminDashboard();
            }
            setDashboardData(data);
        } catch (error) {
            console.error("Failed to fetch dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-6 text-white">
                    <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
                    <p className="text-blue-100">
                        {user.role} • {user.department}
                    </p>
                </div>

                {/* Employee Dashboard */}
                {user.role === "Employee" && dashboardData && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <StatCard
                                title="Total Goals"
                                value={dashboardData.stats.totalGoals}
                                icon="🎯"
                                color="from-blue-500 to-blue-600"
                            />
                            <StatCard
                                title="Completed"
                                value={dashboardData.stats.goalsCompleted}
                                icon="✅"
                                color="from-green-500 to-green-600"
                            />
                            <StatCard
                                title="In Progress"
                                value={dashboardData.stats.goalsInProgress}
                                icon="🔄"
                                color="from-yellow-500 to-yellow-600"
                            />
                            <StatCard
                                title="Avg Score"
                                value={dashboardData.stats.averageScore}
                                icon="⭐"
                                color="from-purple-500 to-purple-600"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Recent Goals</h2>
                                    <button
                                        onClick={() => navigate("/goals")}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        View All →
                                    </button>
                                </div>
                                {dashboardData.recentGoals.map(goal => (
                                    <div key={goal._id} className="border-l-4 border-blue-500 bg-blue-50 p-4 mb-3 rounded-r-lg">
                                        <h3 className="font-semibold text-gray-800">{goal.goalTitle}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                                                {goal.status}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Due: {new Date(goal.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Evaluations</h2>
                                {dashboardData.recentEvaluations.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No evaluations yet</p>
                                ) : (
                                    dashboardData.recentEvaluations.map(ev1l => (
                                        <div key={ev1l._id} className="border-l-4 border-purple-500 bg-purple-50 p-4 mb-3 rounded-r-lg">
                                            <h3 className="font-semibold text-gray-800">
                                                {ev1l.reviewPeriod} - {ev1l.evaluationType}
                                            </h3>
                                            {ev1l.overallScore && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Overall Score: {ev1l.overallScore}/5
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Manager Dashboard */}
                {user.role === "Manager" && dashboardData && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <StatCard
                                title="Team Size"
                                value={dashboardData.teamSize}
                                icon="👥"
                                color="from-blue-500 to-blue-600"
                            />
                            <StatCard
                                title="Total Goals"
                                value={dashboardData.totalGoals}
                                icon="🎯"
                                color="from-green-500 to-green-600"
                            />
                            <StatCard
                                title="Pending Reviews"
                                value={dashboardData.pendingReviews}
                                icon="📋"
                                color="from-yellow-500 to-yellow-600"
                            />
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Team Performance</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left p-3 rounded-l-lg">Employee</th>
                                            <th className="text-left p-3">Department</th>
                                            <th className="text-center p-3">Total Goals</th>
                                            <th className="text-center p-3">Completed</th>
                                            <th className="text-center p-3 rounded-r-lg">Avg Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData.teamPerformance.map(member => (
                                            <tr key={member.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{member.name}</td>
                                                <td className="p-3 text-gray-600">{member.department}</td>
                                                <td className="p-3 text-center">{member.totalGoals}</td>
                                                <td className="p-3 text-center">{member.completedGoals}</td>
                                                <td className="p-3 text-center">
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">
                                                        {member.averageScore}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* HR Admin Dashboard */}
                {user.role === "HR Admin" && dashboardData && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <StatCard
                                title="Total Users"
                                value={dashboardData.totalUsers}
                                icon="👤"
                                color="from-blue-500 to-blue-600"
                            />
                            <StatCard
                                title="Total Goals"
                                value={dashboardData.totalGoals}
                                icon="🎯"
                                color="from-green-500 to-green-600"
                            />
                            <StatCard
                                title="Evaluations"
                                value={dashboardData.totalEvaluations}
                                icon="📊"
                                color="from-purple-500 to-purple-600"
                            />
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Department Statistics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(dashboardData.departmentStats).map(([dept, stats]) => (
                                    <div key={dept} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition">
                                        <h3 className="font-bold text-lg text-gray-800 mb-2">{dept}</h3>
                                        <p className="text-sm text-gray-600">Employees: {stats.employees}</p>
                                        <p className="text-sm text-gray-600">Goals: {stats.goals}</p>
                                        <p className="text-sm text-gray-600">Evaluations: {stats.evaluations}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
);
};

const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-gradient-to-r ${color} rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-white/80 text-sm font-medium">{title}</p>
                <p className="text-4xl font-bold mt-2">{value}</p>
            </div>
            <div className="text-4xl">{icon}</div>
        </div>
    </div>
);

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

export default Dashboard;