import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Briefcase, 
  BookOpen, 
  Building2, 
  LogOut, 
  User, 
  Code, 
  BarChart3,
  ShieldCheck
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    student: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    teacher: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    recruiter: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    tpo: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    govt: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-extrabold'
  };

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight group-hover:text-sky-400 transition-colors">
                Academia <span className="text-sky-400">↔</span> Industry
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                AI Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links based on Role */}
          <div className="hidden md:flex items-center space-x-1">
            {user?.role === 'student' && (
              <>
                <Link to="/student" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition">
                  Dashboard
                </Link>
                <Link to="/jobs" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-sky-400" /> Jobs & Match
                </Link>
                <Link to="/assessment" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-400" /> Coding Quiz
                </Link>
              </>
            )}

            {user?.role === 'teacher' && (
              <Link to="/teacher" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" /> Teacher Portal
              </Link>
            )}

            {user?.role === 'recruiter' && (
              <Link to="/recruiter" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" /> Recruiter Console
              </Link>
            )}

            {user?.role === 'tpo' && (
              <Link to="/tpo" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" /> TPO Analytics
              </Link>
            )}

            {user?.role === 'govt' && (
              <Link to="/govt" className="px-3 py-2 rounded-lg text-sm font-extrabold text-amber-300 hover:bg-amber-500/10 transition flex items-center gap-1.5 border border-amber-500/30">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Govt Portal
              </Link>
            )}

            {/* Direct Switch Role Portals */}
            <div className="flex items-center space-x-1 pl-2 border-l border-slate-800 text-xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold pr-1">Portals:</span>
              <Link to="/login?role=student" onClick={() => logout()} className="px-2 py-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800">Student</Link>
              <Link to="/login?role=recruiter" onClick={() => logout()} className="px-2 py-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800">Recruiter</Link>
              <Link to="/login?role=teacher" onClick={() => logout()} className="px-2 py-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800">Teacher</Link>
              <Link to="/login?role=tpo" onClick={() => logout()} className="px-2 py-1 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-800">TPO</Link>
              <Link to="/login?role=govt" onClick={() => logout()} className="px-2 py-1 rounded text-amber-400 font-bold hover:bg-amber-500/20">Govt</Link>
            </div>
          </div>

          {/* User Auth Info / Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <span className="block text-sm font-semibold text-white">{user.full_name}</span>
                  <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider ${roleColors[user.role] || 'bg-slate-800 text-slate-300'}`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Switch Portal Account / Log Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Switch Account</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/20 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};
