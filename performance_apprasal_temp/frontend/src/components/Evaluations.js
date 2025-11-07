import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getEvaluations, getCompetencies, createSelfAssessment, createManagerReview, getAllUsers } from "../api";

const Evaluations = () => {
    const { user } = useAuth();
    const [evaluations, setEvaluations] = useState([]);
    const [competencies, setCompetencies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formType, setFormType] = useState("self");
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        reviewPeriod: "",
        competencies: [],
        selfFeedback: "",
        managerFeedback: "",
        overallScore: "",
        selectedEmployee: "",
    });

    useEffect(() => {
        fetchEvaluations();
        fetchCompetencies();
        if (user.role === "Manager" || user.role === "HR Admin") {
            fetchEmployees();
        }
    }, []);

    const fetchEvaluations = async () => {
        const data = await getEvaluations();
        setEvaluations(data);
    };

    const fetchCompetencies = async () => {
        const data = await getCompetencies();
        const compList = data.map(name => ({ name, selfRating: 0, managerRating: 0 }));
        setCompetencies(data);
        setFormData(prev => ({ ...prev, competencies: compList }));
    };

 const fetchEmployees = async () => {
    try {
        const data = await getAllUsers();
        console.log("getAllUsers response:", data);  // <--- add this
        if (!data || !data.users) {
            console.error("No users array found in response");
            return;
        }
        setEmployees(data.users.filter(u => u.role === "Employee"));
    } catch (error) {
        console.error("Error fetching employees:", error);
    }
};

    const handleCompetencyChange = (index, field, value) => {
        const newCompetencies = [...formData.competencies];
        newCompetencies[index][field] = parseInt(value);
        setFormData({ ...formData, competencies: newCompetencies });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formType === "self") {
                await createSelfAssessment({
                    reviewPeriod: formData.reviewPeriod,
                    competencies: formData.competencies,
                    selfFeedback: formData.selfFeedback,
                });
            } else {
                await createManagerReview({
                    userId: formData.selectedEmployee,
                    reviewPeriod: formData.reviewPeriod,
                    competencies: formData.competencies,
                    managerFeedback: formData.managerFeedback,
                    overallScore: parseFloat(formData.overallScore),
                });
            }
            setShowForm(false);
            fetchEvaluations();
            resetForm();
        } catch (error) {
            console.error("Failed to submit evaluation:", error);
        }
    };

    const resetForm = () => {
        const compList = competencies.map(name => ({ name, selfRating: 0, managerRating: 0 }));
        setFormData({
            reviewPeriod: "",
            competencies: compList,
            selfFeedback: "",
            managerFeedback: "",
            overallScore: "",
            selectedEmployee: "",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Performance Evaluations</h1>
                            <p className="text-gray-600 mt-1">Complete and review performance assessments</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition shadow-lg"
                        >
                            {showForm ? "Cancel" : "+ New Evaluation"}
                        </button>
                    </div>
                </div>

                {/* Evaluation Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Type</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setFormType("self")}
                                    className={`px-4 py-2 rounded-lg font-medium transition ${
                                        formType === "self"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-700"
                                    }`}
                                >
                                    Self Assessment
                                </button>
                                {(user.role === "Manager" || user.role === "HR Admin") && (
                                    <button
                                        onClick={() => setFormType("manager")}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${
                                            formType === "manager"
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                    >
                                        Manager Review
                                    </button>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {formType === "manager" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                                    <select
                                        value={formData.selectedEmployee}
                                        onChange={(e) => setFormData({ ...formData, selectedEmployee: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                    >
                                        <option value="">Select an employee</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.name} - {emp.department}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Review Period</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Q1 2024, Jan-Mar 2024"
                                    value={formData.reviewPeriod}
                                    onChange={(e) => setFormData({ ...formData, reviewPeriod: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Rate Competencies (1-5)</h3>
                                <div className="space-y-4">
                                    {formData.competencies.map((comp, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                            <p className="font-medium text-gray-800 mb-2">{comp.name}</p>
                                            <div className="flex gap-4">
                                                {formType === "self" && (
                                                    <div className="flex-1">
                                                        <label className="text-sm text-gray-600">Self Rating</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="5"
                                                            value={comp.selfRating}
                                                            onChange={(e) => handleCompetencyChange(index, "selfRating", e.target.value)}
                                                            required
                                                            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                                                        />
                                                    </div>
                                                )}
                                                {formType === "manager" && (
                                                    <div className="flex-1">
                                                        <label className="text-sm text-gray-600">Manager Rating</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="5"
                                                            value={comp.managerRating}
                                                            onChange={(e) => handleCompetencyChange(index, "managerRating", e.target.value)}
                                                            required
                                                            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {formType === "self" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Self Feedback</label>
                                    <textarea
                                        value={formData.selfFeedback}
                                        onChange={(e) => setFormData({ ...formData, selfFeedback: e.target.value })}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                        placeholder="Reflect on your performance..."
                                    />
                                </div>
                            )}

                            {formType === "manager" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Manager Feedback</label>
                                        <textarea
                                            value={formData.managerFeedback}
                                            onChange={(e) => setFormData({ ...formData, managerFeedback: e.target.value })}
                                            rows="4"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                            placeholder="Provide feedback on employee performance..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Overall Score (1-5)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="1"
                                            max="5"
                                            value={formData.overallScore}
                                            onChange={(e) => setFormData({ ...formData, overallScore: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                        />
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition"
                            >
                                Submit Evaluation
                            </button>
                        </form>
                    </div>
                )}

                {/* Evaluations List */}
                <div className="space-y-4">
                    {evaluations.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">No evaluations yet</h3>
                            <p className="text-gray-600">Start by creating your first evaluation!</p>
                        </div>
                    ) : (
                        evaluations.map((evaluation) => (
                            <div key={evaluation._id} className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{evaluation.reviewPeriod}</h3>
                                        <p className="text-gray-600">{evaluation.evaluationType} Assessment</p>
                                        {evaluation.userId?.name && (
                                            <p className="text-sm text-gray-500">
                                                Employee: {evaluation.userId.name}
                                            </p>
                                        )}
                                    </div>
                                    {evaluation.overallScore && (
                                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl">
                                            <p className="text-sm">Overall Score</p>
                                            <p className="text-3xl font-bold">{evaluation.overallScore}/5</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {evaluation.competencies.map((comp, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700">{comp.name}</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {comp.selfRating || comp.managerRating}/5
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {evaluation.selfFeedback && (
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
                                        <p className="text-sm font-semibold text-gray-700">Self Feedback:</p>
                                        <p className="text-sm text-gray-600 mt-1">{evaluation.selfFeedback}</p>
                                    </div>
                                )}

                                {evaluation.managerFeedback && (
                                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                                        <p className="text-sm font-semibold text-gray-700">Manager Feedback:</p>
                                        <p className="text-sm text-gray-600 mt-1">{evaluation.managerFeedback}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Evaluations;