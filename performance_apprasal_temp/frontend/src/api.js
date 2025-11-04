const API_BASE = "http://localhost:5000/api";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

// AUTH APIs
export const loginUser = async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Login failed");
    return response.json();
};

export const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Registration failed");
    return response.json();
};

export const getCurrentUser = async () => {
    const response = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
};

export const updateProfile = async (userData) => {
    const response = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
    });
    return response.json();
};

// GOAL APIs
export const createGoal = async (goalData) => {
    const response = await fetch(`${API_BASE}/goals`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(goalData),
    });
    return response.json();
};

export const getGoals = async () => {
    const response = await fetch(`${API_BASE}/goals`, {
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const updateGoal = async (id, updatedData) => {
    const response = await fetch(`${API_BASE}/goals/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedData),
    });
    return response.json();
};

export const deleteGoal = async (id) => {
    const response = await fetch(`${API_BASE}/goals/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const reviewGoal = async (id, reviewData) => {
    const response = await fetch(`${API_BASE}/goals/${id}/review`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(reviewData),
    });
    return response.json();
};

// EVALUATION APIs
export const createSelfAssessment = async (data) => {
    const response = await fetch(`${API_BASE}/evaluations/self-assessment`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return response.json();
};

export const createManagerReview = async (data) => {
    const response = await fetch(`${API_BASE}/evaluations/manager-review`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return response.json();
};

export const getEvaluations = async () => {
    const response = await fetch(`${API_BASE}/evaluations`, {
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const getCompetencies = async () => {
    const response = await fetch(`${API_BASE}/evaluations/competencies`, {
        headers: getAuthHeaders(),
    });
    return response.json();
};

// DASHBOARD APIs
export const getEmployeeDashboard = async () => {
    const response = await fetch(`${API_BASE}/dashboard/employee`, {
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const getManagerDashboard = async () => {
    const response = await fetch(`${API_BASE}/dashboard/manager`, {
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const getAdminDashboard = async () => {
    const response = await fetch(`${API_BASE}/dashboard/admin`, {
        headers: getAuthHeaders(),
    });
    return response.json();
};

// ADMIN APIs
export const getAllUsers = async () => {
    const response = await fetch(`${API_BASE}/admin/users`, {
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const updateUserRole = async (userId, roleData) => {
    const response = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(roleData),
    });
    return response.json();
};

export const deleteUser = async (userId) => {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    return response.json();
};

// NOTIFICATION APIs
export const getNotifications = async () => {
    const response = await fetch(`${API_BASE}/notifications`, {
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const markNotificationRead = async (id) => {
    const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PUT",
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const markAllNotificationsRead = async () => {
    const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PUT",
        headers: getAuthHeaders(),
    });
    return response.json();
};

// REPORT APIs
export const downloadPDFReport = (userId) => {
    window.open(`${API_BASE}/reports/pdf/${userId}`, "_blank");
};

export const downloadCSVExport = () => {
    window.open(`${API_BASE}/reports/export/csv`, "_blank");
};