import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogIn, AlertCircle, ShieldCheck, BookOpen, Building2, User, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.role === 'student') navigate('/student');
      else if (data.role === 'teacher') navigate('/teacher');
      else if (data.role === 'recruiter') navigate('/recruiter');
      else if (data.role === 'tpo') navigate('/tpo');
      else if (data.role === 'govt') navigate('/govt');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="glass-card max-w-lg w-full p-8 shadow-2xl relative overflow-hidden glow-indigo">
        
        <div className="text-center mb-6 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/25">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Sign In to Platform</h2>
          <p className="text-sm text-slate-400">Select 1-Click Demo Role or enter credentials to sign in</p>
        </div>

        {/* 1-CLICK QUICK DEMO LOGIN BUTTONS */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-sky-400"><Sparkles className="w-3.5 h-3.5" /> 1-Click Instant Demo Login:</span>
            <span>Password: demo</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('student@nit.edu', 'student123')}
              className="px-2 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-[10px] font-extrabold transition text-center"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('recruiter@google.com', 'admin123')}
              className="px-2 py-2 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 text-[10px] font-extrabold transition text-center"
            >
              👔 Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('teacher@nit.edu', 'teacher123')}
              className="px-2 py-2 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-[10px] font-extrabold transition text-center"
            >
              📚 Teacher
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('tpo@nit.edu', 'tpo123')}
              className="px-2 py-2 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 text-[10px] font-extrabold transition text-center"
            >
              🛡️ TPO
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('govt@education.gov.in', 'govt123')}
              className="px-2 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/40 text-[10px] font-extrabold transition text-center col-span-1"
            >
              🏛️ Govt
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-extrabold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Sign-In Notice</span>
            </div>
            <p className="text-xs text-red-300 leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@nit.edu"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-extrabold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Authenticating...' : <><LogIn className="w-5 h-5" /> Sign In to Portal</>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-sky-400 hover:underline font-bold">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
};
