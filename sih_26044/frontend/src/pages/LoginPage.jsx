import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogIn, AlertCircle, ShieldCheck, BookOpen, Building2, User, Home } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedRole = searchParams.get('role');
  const roleLabels = {
    student: 'Chhatra',
    recruiter: 'Karyah',
    teacher: 'Guru',
    tpo: 'Gurukul',
    govt: 'Rajya'
  };
  const selectedRoleLabel = roleLabels[selectedRole] || 'Portal';
  const demoAccounts = {
    student: { email: 'student@nit.edu', password: 'student123' },
    teacher: { email: 'teacher@nit.edu', password: 'teacher123' },
    recruiter: { email: 'recruiter@google.com', password: 'admin123' },
    tpo: { email: 'tpo@nit.edu', password: 'tpo123' },
    govt: { email: 'govt@education.gov.in', password: 'govt123' }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDemoCredentials = () => {
    const demoAccount = demoAccounts[selectedRole];
    if (!demoAccount) return;
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    setError('');
  };

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

  return (
    <div className={`auth-entry-layout min-h-[85vh] px-4 py-8 ${selectedRole ? `role-selected role-${selectedRole}` : 'role-picker-only'}`}>
      {!selectedRole && <div className="login-character-panel">
        <p className="game-font text-[9px] text-sky-400 tracking-widest">CHOOSE YOUR PORTAL</p>
        <h2 className="game-heading mt-3 text-3xl font-bold text-white">Select your champion</h2>
        <p className="mt-2 text-sm text-slate-400">Pick a role to enter its command center.</p>
        <div className="login-character-grid">
          <Link to="/login?role=student" className="login-character-card login-character-student"><div className="login-mini-character"><span className="login-mini-head" /><span className="login-mini-body" /><span className="login-mini-prop">L</span></div><strong>Chhatra</strong><small>Student</small></Link>
          <Link to="/login?role=teacher" className="login-character-card login-character-teacher"><div className="login-mini-character"><span className="login-mini-head" /><span className="login-mini-body" /><span className="login-mini-prop">ID</span></div><strong>Guru</strong><small>Teacher</small></Link>
          <Link to="/login?role=recruiter" className="login-character-card login-character-recruiter"><div className="login-mini-character"><span className="login-mini-head" /><span className="login-mini-body" /><span className="login-mini-prop">B</span></div><strong>Karyah</strong><small>Recruiter</small></Link>
          <Link to="/login?role=tpo" className="login-character-card login-character-gurukul"><div className="login-mini-character"><span className="login-mini-head" /><span className="login-mini-body" /><span className="login-mini-prop">P</span></div><strong>Gurukul</strong><small>TPO</small></Link>
          <Link to="/login?role=govt" className="login-character-card login-character-government"><div className="login-mini-character"><span className="login-mini-head" /><span className="login-mini-body" /><span className="login-mini-prop">R</span></div><strong>Rajya</strong><small>Government</small></Link>
        </div>
      </div>}
      {selectedRole && <div className={`selected-character-stage selected-character-${selectedRole}`}>
        {selectedRole === 'tpo' && <div className="scene-room"><div className="scene-table" /><div className="scene-lamp" /></div>}
        <div className="scene-platform" />
        <div className="anime-character anime-character-principal">
          <div className="anime-hair" /><div className="anime-head" /><div className="anime-body" />
          <div className="anime-arm anime-arm-left" /><div className="anime-arm anime-arm-right" />
          <div className="anime-leg anime-leg-left" /><div className="anime-leg anime-leg-right" />
          {selectedRole === 'student' && <div className="anime-prop laptop-prop" />}
          {selectedRole === 'teacher' && <div className="anime-prop id-card-prop">ID</div>}
          {selectedRole === 'recruiter' && <div className="anime-prop briefcase-prop" />}
          {selectedRole === 'tpo' && <div className="anime-prop principal-badge">P</div>}
          {selectedRole === 'govt' && <div className="anime-prop tablet-prop" />}
        </div>
        <div className="selected-character-caption"><span className="character-kicker">ACTIVE PORTAL CHARACTER</span><strong>{selectedRoleLabel}</strong><span>{selectedRole === 'student' ? 'Laptop runner' : selectedRole === 'teacher' ? 'Faculty mentor' : selectedRole === 'recruiter' ? 'Talent hunter' : selectedRole === 'tpo' ? 'Principal · campus leader' : 'Realm overseer'}</span></div>
      </div>}
      {selectedRole && <div className="login-form-panel glass-card max-w-lg w-full p-8 shadow-2xl relative overflow-hidden glow-indigo">
        
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="text-center flex-1 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/25">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <span className="login-selected-badge">{selectedRoleLabel} PORTAL // PLAYER READY</span>
          <p className="text-sm text-slate-400">Continue to your {selectedRoleLabel} portal.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white" title="Return to home">
            <Home className="h-4 w-4" /> Home
          </Link>
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
          <div className="demo-access-panel">
            <div><span className="demo-access-kicker">DEMO LOADOUT READY</span><strong>{demoAccounts[selectedRole]?.email}</strong></div>
            <button type="button" onClick={loadDemoCredentials}>Load demo credentials</button>
          </div>
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
          <Link to={selectedRole ? `/register?role=${selectedRole}` : '/register'} className="text-sky-400 hover:underline font-bold">
            Create an Account
          </Link>
        </p>

      </div>}
    </div>
  );
};
