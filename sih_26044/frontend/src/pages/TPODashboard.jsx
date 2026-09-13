import React, { useState, useEffect } from 'react';
import { tpoApi } from '../services/api';
import { ShieldCheck, BarChart3, Users, CheckCircle2, XCircle, Download, AlertTriangle, Sparkles, FileText, UploadCloud } from 'lucide-react';

export const TPODashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [pending, setPending] = useState([]);
  const [cutoff, setCutoff] = useState(60.0);
  const [exportedTalent, setExportedTalent] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rosterFile, setRosterFile] = useState(null);
  const [rosterStatus, setRosterStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    try {
      const aRes = await tpoApi.getAnalytics();
      setAnalytics(aRes.data);

      const hRes = await tpoApi.getSkillHeatmap();
      setHeatmap(hRes.data || []);

      const pRes = await tpoApi.getPending();
      setPending(pRes.data || []);

      const eRes = await tpoApi.exportCandidates(cutoff);
      setExportedTalent(eRes.data?.candidates || []);
    } catch (err) {
      console.error('Error loading TPO analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (profileId, approve) => {
    try {
      await tpoApi.verifyStudent(profileId, approve);
      loadData();
    } catch (err) {
      alert('Verification action failed.');
    }
  };

  const handleRosterUpload = async (e) => {
    e.preventDefault();
    if (!rosterFile) return;
    setUploading(true);
    setRosterStatus(null);
    try {
      const res = await tpoApi.uploadRoster(rosterFile);
      setRosterStatus({ 
        type: 'success', 
        message: res.data?.message || 'Roster uploaded successfully!', 
        parsed: res.data?.total_parsed || 0,
        verified: res.data?.total_auto_verified || 0
      });
      loadData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((item) => item.msg || JSON.stringify(item)).join('; ')
        : detail || 'Roster upload failed. Please ensure file is valid CSV.';
      setRosterStatus({ 
        type: 'error', 
        message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCutoffChange = async (newVal) => {
    setCutoff(newVal);
    try {
      const res = await tpoApi.exportCandidates(newVal);
      setExportedTalent(res.data?.candidates || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-sky-400" /> TPO & Placement Cell Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">Batch employability analytics, student roster upload, skill deficit heatmap, and verification.</p>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4">
          <span className="block text-2xl font-extrabold text-white">{analytics?.total_students || 0}</span>
          <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">Total Students</span>
        </div>
        <div className="glass-card p-4">
          <span className="block text-2xl font-extrabold text-emerald-400">{analytics?.job_ready_count || 0} ({analytics?.job_ready_percentage || 0}%)</span>
          <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">Job Ready (&gt;=60%)</span>
        </div>
        <div className="glass-card p-4">
          <span className="block text-2xl font-extrabold text-sky-400">{analytics?.average_match_score || 0}%</span>
          <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">Avg Match Score</span>
        </div>
        <div className="glass-card p-4">
          <span className="block text-2xl font-extrabold text-indigo-400">{analytics?.verified_students_count || 0}</span>
          <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">TPO Verified</span>
        </div>
        <div className="glass-card p-4">
          <span className="block text-2xl font-extrabold text-red-400">{analytics?.flagged_fraud_count || 0}</span>
          <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">Fraud Flagged</span>
        </div>
      </div>

      {/* INSTITUTION STUDENT ROSTER CSV/EXCEL UPLOAD */}
      <div className="glass-card p-6 border-indigo-500/40 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 glow-indigo">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> College Official Student Roster CSV Upload
            </h3>
            <p className="text-xs text-slate-300">
              Upload official batch CSV containing headers: <code className="text-sky-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded">roll_number, full_name, college_email, branch, batch_year</code>. 
              Students matching roster entries are auto pre-verified for instant 1st-time login.
            </p>
          </div>

          <form onSubmit={handleRosterUpload} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <label className="cursor-pointer px-4 py-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold transition flex items-center gap-2 justify-center">
              <UploadCloud className="w-4 h-4" />
              <span className="truncate max-w-[160px]">{rosterFile ? rosterFile.name : 'Select Roster CSV'}</span>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setRosterFile(e.target.files[0])}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={!rosterFile || uploading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              {uploading ? 'Processing CSV...' : 'Upload & Verify Roster'}
            </button>
          </form>
        </div>

        {rosterStatus && (
          <div className={`mt-4 p-4 rounded-xl text-xs font-semibold flex items-center gap-3 shadow-lg ${
            rosterStatus.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300' : 'bg-red-500/15 border border-red-500/40 text-red-300'
          }`}>
            {rosterStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <div className="space-y-0.5">
              <p className="font-bold">{rosterStatus.message}</p>
              {rosterStatus.type === 'success' && (
                <p className="text-[11px] opacity-80">
                  Total Parsed: <strong>{rosterStatus.parsed}</strong> | Auto-Verified Active Students: <strong>{rosterStatus.verified}</strong>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BATCH SKILL DEFICIT HEATMAP */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" /> Batch Skill Deficit & Curriculum Gap Heatmap
          </h3>
          <span className="text-xs text-slate-400">Computed from active student profiles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {(heatmap || []).map((item, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border flex flex-col justify-between ${
              item.deficit_percentage >= 60 ? 'bg-red-500/10 border-red-500/30 text-red-300' :
              item.deficit_percentage >= 30 ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              <div>
                <span className="text-xs font-extrabold block text-white">{item.skill}</span>
                <span className="text-[10px] block opacity-80 mt-1">
                  Deficit: <strong className="text-sm font-bold">{item.deficit_percentage}%</strong>
                </span>
              </div>
              <span className="text-[9px] uppercase font-extrabold tracking-wider mt-2 block">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STUDENT REGISTRATION VERIFICATION CONSOLE */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Pending Student Registration Verifications ({(pending || []).length})
          </h3>
        </div>

        {(pending || []).length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No pending student registrations waiting for manual verification.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Branch & Batch</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pending.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-3 font-semibold text-white">{p.full_name}</td>
                    <td className="p-3 font-mono text-xs text-indigo-400 font-bold">{p.roll_number || 'NIT2026-CSE01'}</td>
                    <td className="p-3 text-xs text-slate-400">{p.email}</td>
                    <td className="p-3 text-xs">{p.branch} ({p.batch_year})</td>
                    <td className="p-3 flex items-center gap-2">
                      <button
                        onClick={() => handleVerify(p.profile_id, true)}
                        className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleVerify(p.profile_id, false)}
                        className="px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VERIFIED TALENT EXPORTER */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" /> Pre-Screened Verified Talent Exporter
            </h3>
            <p className="text-xs text-slate-400">Export pre-screened job-ready candidates matching recruiter cutoff score.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Score Cutoff:</span>
            <select
              value={cutoff}
              onChange={(e) => handleCutoffChange(parseFloat(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold"
            >
              <option value="50">>= 50% Score</option>
              <option value="60">>= 60% Score</option>
              <option value="75">>= 75% Score</option>
              <option value="85">>= 85% Score</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Branch</th>
                <th className="p-3">Skills</th>
                <th className="p-3">Match Score</th>
                <th className="p-3">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(exportedTalent || []).map((cand, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50">
                  <td className="p-3 font-bold text-slate-400">#{cand.rank}</td>
                  <td className="p-3 font-semibold text-white">{cand.name}</td>
                  <td className="p-3 text-xs text-slate-400">{cand.email}</td>
                  <td className="p-3 text-xs">{cand.branch}</td>
                  <td className="p-3 text-xs max-w-xs truncate">{cand.skills}</td>
                  <td className="p-3 font-extrabold text-emerald-400">{cand.match_score}</td>
                  <td className="p-3 text-xs font-bold text-emerald-400">{cand.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
