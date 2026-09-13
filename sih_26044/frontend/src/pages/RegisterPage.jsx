import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';
import { GraduationCap, UserPlus, AlertCircle, ShieldCheck, CheckCircle2, Lock, Sparkles } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') || 'student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student specific attributes
  const [rollNumber, setRollNumber] = useState('NIT2026-CSE01');
  const [college, setCollege] = useState('National Institute of Technology');
  const [branch, setBranch] = useState('Computer Science Engineering');
  const [batchYear, setBatchYear] = useState(2026);
  const [collegeEmail, setCollegeEmail] = useState('');

  const [error, setError] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryRole = searchParams.get('role');
    if (queryRole) setRole(queryRole);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailExists(false);
    setSuccess('');
    setLoading(true);

    const payload = {
      full_name: fullName,
      email: email,
      password: password,
      role: role,
      roll_number: rollNumber,
      college: college,
      branch: branch,
      batch_year: parseInt(batchYear) || 2026,
      college_email: collegeEmail || email
    };

    try {
      await authApi.register(payload);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Registration failed. Email might already exist.';
      setError(detail);
      if (detail.toLowerCase().includes('already') || detail.toLowerCase().includes('exist')) {
        setEmailExists(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="glass-card max-w-xl w-full p-8 shadow-2xl relative overflow-hidden glow-sky">
        
        <div className="text-center mb-6 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/25">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Platform Account</h2>
          <p className="text-sm text-slate-400">Select role and register with Fernet encryption protection</p>
        </div>

        {/* FEEDBACK ALERTS */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm space-y-2 shadow-lg">
            <div className="flex items-center gap-2 text-red-400 font-extrabold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {emailExists && (
              <div className="pt-2 border-t border-red-500/30 flex items-center justify-between">
                <span className="text-xs text-red-200">Account already exists with email '{email}'.</span>
                <Link
                  to={`/login`}
                  className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-md transition"
                >
                  Sign In Directly
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Aryan Sharma"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition text-sm"
            />
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

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Platform Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 font-semibold"
            >
              <option value="student">Student / Candidate</option>
              <option value="recruiter">Recruiter / Corporate Employer</option>
              <option value="teacher">Teacher / Faculty Member</option>
              <option value="tpo">TPO / Placement Cell Officer</option>
              <option value="govt">Government / Accreditation Authority</option>
            </select>
          </div>

          {role === 'student' && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
              <div className="text-xs font-extrabold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-indigo-400" /> Student Academic Details (TPO Roster Encrypted)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Roll Number / Student ID</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="NIT2026-CSE01"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">College / University Name</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="National Institute of Technology"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Branch / Department</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Computer Science Engineering"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Batch / Graduation Year</label>
                  <input
                    type="number"
                    value={batchYear}
                    onChange={(e) => setBatchYear(parseInt(e.target.value) || 2026)}
                    placeholder="2026"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Roll number will be encrypted using Fernet AES-256 and matched against TPO roster.
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-extrabold text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-amber-500 hover:opacity-90 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Creating Account...' : <><UserPlus className="w-5 h-5" /> Register Account</>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-400 hover:underline font-bold">
            Sign In Directly
          </Link>
        </p>

      </div>
    </div>
  );
};
