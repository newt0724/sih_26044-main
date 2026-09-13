import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { JobMatchPage } from './pages/JobMatchPage';
import { CodingAssessmentPage } from './pages/CodingAssessmentPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { TPODashboard } from './pages/TPODashboard';
import { GovtDashboard } from './pages/GovtDashboard';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Loading auth session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            path="/student"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobMatchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <CodingAssessmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute roles={['teacher', 'tpo', 'govt']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute roles={['recruiter', 'tpo', 'govt']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tpo"
            element={
              <ProtectedRoute roles={['tpo', 'teacher', 'govt']}>
                <TPODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/govt"
            element={
              <ProtectedRoute roles={['govt']}>
                <GovtDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
