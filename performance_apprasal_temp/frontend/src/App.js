import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import GoalForm from "./components/GoalForm";
import Evaluations from "./components/Evaluations";
import TeamView from "./components/TeamView";
import AdminPanel from "./components/AdminPanel";
import Navbar from "./components/Navbar";

const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

const AppContent = () => {
    const { user } = useAuth();

    return (
        <Router>
            {user && <Navbar />}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/goals"
                    element={
                        <PrivateRoute>
                            <GoalForm />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/evaluations"
                    element={
                        <PrivateRoute>
                            <Evaluations />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/team"
                    element={
                        <PrivateRoute roles={["Manager", "HR Admin"]}>
                            <TeamView />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute roles={["HR Admin"]}>
                            <AdminPanel />
                        </PrivateRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;