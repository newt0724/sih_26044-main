import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/') return null;

  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
      className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-extrabold text-slate-200 shadow-xl backdrop-blur-md transition hover:-translate-x-1 hover:border-sky-500/60 hover:text-sky-300"
    >
      <ArrowLeft className="h-4 w-4" /> Back
    </button>
  );
};

const PortalCharacterWatermark = ({ role }) => {
  if (!role) return null;

  return (
    <div className={`portal-character-watermark portal-character-${role}`} aria-hidden="true">
      <div className="anime-character anime-character-principal">
        <div className="anime-hair" /><div className="anime-head" /><div className="anime-body" />
        <div className="anime-arm anime-arm-left" /><div className="anime-arm anime-arm-right" />
        <div className="anime-leg anime-leg-left" /><div className="anime-leg anime-leg-right" />
        {role === 'student' && <div className="anime-prop laptop-prop" />}
        {role === 'teacher' && <div className="anime-prop id-card-prop">ID</div>}
        {role === 'recruiter' && <div className="anime-prop briefcase-prop" />}
        {role === 'tpo' && <div className="anime-prop principal-badge">P</div>}
        {role === 'govt' && <div className="anime-prop tablet-prop" />}
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Loading auth session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className={`portal-shell portal-theme-${user?.role || 'neutral'} min-h-screen bg-slate-950 text-slate-100 flex flex-col`}>
      <Navbar />
      <main className="flex-1">
        <PortalCharacterWatermark role={user?.role} />
        <BackButton />
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
