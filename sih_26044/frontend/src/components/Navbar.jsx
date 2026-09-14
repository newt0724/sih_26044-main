import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  , ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const roleSelected = ['/login', '/register'].includes(location.pathname) && Boolean(new URLSearchParams(location.search).get('role'));

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

            {/* Keep role switching available only before authentication. */}
            {!user && !roleSelected && (
              <div className="relative pl-2 border-l border-slate-800 text-xs">
                <button type="button" onClick={() => setPortalMenuOpen((open) => !open)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-800 hover:text-white" aria-expanded={portalMenuOpen}>
                  Portals <ChevronDown className={`h-3.5 w-3.5 transition-transform ${portalMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {portalMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl">
                    <Link onClick={() => setPortalMenuOpen(false)} to="/login?role=student" className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-emerald-500/15 hover:text-emerald-300">Student</Link>
                    <Link onClick={() => setPortalMenuOpen(false)} to="/login?role=recruiter" className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-indigo-500/15 hover:text-indigo-300">Recruiter</Link>
                    <Link onClick={() => setPortalMenuOpen(false)} to="/login?role=teacher" className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-amber-500/15 hover:text-amber-300">Teacher</Link>
                    <Link onClick={() => setPortalMenuOpen(false)} to="/login?role=tpo" className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-sky-500/15 hover:text-sky-300">TPO</Link>
                    <Link onClick={() => setPortalMenuOpen(false)} to="/login?role=govt" className="block rounded-lg px-3 py-2 text-amber-300 hover:bg-amber-500/15">Government</Link>
                  </div>
                )}
              </div>
            )}
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
                {(location.pathname !== '/' || roleSelected) && (
                  <Link to="/" className="px-3 py-2 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white">
                    Home
                  </Link>
                )}
                {!roleSelected && (
                  <>
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
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};
