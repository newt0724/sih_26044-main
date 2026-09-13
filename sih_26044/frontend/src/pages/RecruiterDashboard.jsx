import React, { useState, useEffect } from 'react';
import { jobApi, teacherApi } from '../services/api';
import { 
  Building2, 
  Plus, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  XCircle,
  AlertTriangle, 
  Clock, 
  Trash2, 
  FileText, 
  Download,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [newJob, setNewJob] = useState({
    company_name: 'Google',
    company_rating: 4.9,
    job_role: 'Machine Learning Engineer',
    location: 'Bangalore / Remote',
    salary_range: '$60,000 - $90,000',
    required_skills: 'Python, PyTorch, SQL, FastAPI',
    min_experience: 1.0,
    description: 'Looking for Machine Learning Engineer to build AI platforms.'
  });

  const loadData = async () => {
    try {
      const jRes = await jobApi.listJobs();
      setJobs(jRes.data || []);

      const cRes = await teacherApi.getStudents();
      setCandidates(cRes.data || []);

      const appRes = await jobApi.getRecruiterApplications();
      setApplications(appRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await jobApi.createJob(newJob);
      setShowModal(false);
      setMessage('New job drive posted successfully! Job will remain active until closed.');
      loadData();
    } catch (err) {
      setError('Failed to post new job drive.');
    }
  };

  const handleDeleteJob = async (jobId, role, company) => {
    if (!window.confirm(`Are you sure you want to close/delete job drive '${role}' at ${company}?`)) return;
    try {
      await jobApi.deleteJob(jobId);
      setMessage(`Job drive '${role}' closed successfully.`);
      loadData();
    } catch (err) {
      setError('Failed to delete job drive.');
    }
  };

  const handleDecision = async (appId, approve) => {
    try {
      const res = await jobApi.updateApplicationDecision(appId, approve);
      setMessage(res.data.message);
      loadData();
    } catch (err) {
      setError('Failed to update candidate application decision.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER BAR */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glow-indigo">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-8 h-8 text-indigo-400" /> Recruiter & Corporate Console
          </h1>
          <p className="text-slate-400 text-sm">
            Post active job drives, review candidate applications with 20-day review clocks, inspect anti-fraud flags, and manage candidate hiring decisions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl font-extrabold text-sm bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-400 hover:to-sky-500 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition whitespace-nowrap"
        >
          <Plus className="w-5 h-5" /> Post New Job Drive
        </button>
      </div>

      {/* FEEDBACK ALERTS */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm flex items-center gap-2 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ACTIVE JOB DRIVES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" /> Active Job Drives ({jobs.length})
          </h3>
          <span className="text-xs text-slate-400">Jobs stay active until explicitly deleted</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const jobApps = applications.filter((a) => a.job_id === job.id);
            const pendingApps = jobApps.filter((a) => a.status === 'Under Review');

            return (
              <div key={job.id} className="glass-card-hover p-6 flex flex-col justify-between space-y-4 relative group">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">{job.company_name}</span>
                    <span className="badge-emerald">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Active Job Drive
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white">{job.job_role}</h4>
                  <p className="text-xs text-slate-400 mt-1">{job.location} • {job.salary_range}</p>
                  
                  <div className="mt-3 text-xs text-slate-300">
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Required Skills:</span>
                    <p className="font-mono text-indigo-300">{job.required_skills}</p>
                  </div>

                  {/* 20-DAY CANDIDATE APPLICATION REVIEW CLOCK NOTIFICATION BADGE */}
                  {jobApps.length > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                      <div className="flex items-center justify-between font-extrabold">
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <Clock className="w-4 h-4 animate-pulse" />
                          20-Day Application Clock Active
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                          {jobApps.length} Applications ({pendingApps.length} Pending)
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-200/80">
                        Review candidate applications within 20 days before automatic expiration.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleDeleteJob(job.id, job.job_role, job.company_name)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                    title="Close / Delete Job Drive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE JOB MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full p-6 border-indigo-500/40 glow-indigo">
            <h3 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" /> Post New Job Drive
            </h3>
            
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newJob.company_name}
                    onChange={(e) => setNewJob({...newJob, company_name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Company Rating ★</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newJob.company_rating}
                    onChange={(e) => setNewJob({...newJob, company_rating: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Target Job Role</label>
                <input
                  type="text"
                  required
                  value={newJob.job_role}
                  onChange={(e) => setNewJob({...newJob, job_role: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Salary Range</label>
                  <input
                    type="text"
                    required
                    value={newJob.salary_range}
                    onChange={(e) => setNewJob({...newJob, salary_range: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Required Technical Skills</label>
                <input
                  type="text"
                  required
                  value={newJob.required_skills}
                  onChange={(e) => setNewJob({...newJob, required_skills: e.target.value})}
                  placeholder="Python, PyTorch, SQL, FastAPI"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Job Description</label>
                <textarea
                  rows="3"
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  Publish Active Job Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE APPLICATIONS RECEIVED WITH 20-DAY REVIEW DEADLINE CLOCK */}
      <div className="glass-card p-6 border-indigo-500/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" /> Candidate Applications Received ({applications.length})
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Review applicant resumes and candidate details. Applications auto-reject after 20 days of no recruiter decision.
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No candidate applications submitted yet. Student submissions will appear here when submitted.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">App ID</th>
                  <th className="p-3">Candidate Details</th>
                  <th className="p-3">Applied Job</th>
                  <th className="p-3">20-Day Review Timer</th>
                  <th className="p-3">ML Score</th>
                  <th className="p-3">Anti-Fraud Inspection</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Recruiter Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {applications.map((app) => {
                  const flags = app.explainability?.flags || app.explainability?.anti_fraud?.flags || [];
                  const isFlagged = flags.length > 0 || app.explainability?.anti_fraud?.fraud_risk === 'high';
                  const remDays = app.days_remaining !== undefined ? app.days_remaining : 20;

                  return (
                    <tr key={app.id} className="hover:bg-slate-900/60 transition">
                      <td className="p-3 font-mono text-xs text-slate-400">#{app.id}</td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{app.explainability?.candidate_name || 'Candidate'}</span>
                        <span className="text-[11px] text-slate-400 block">Roll No: {app.student?.roll_number || 'NIT2026-CSE01'}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-200 block">{app.explainability?.job_role || 'Software Engineer'}</span>
                        <span className="text-[11px] text-indigo-400">{app.explainability?.company_name || 'Company'}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 w-max ${
                          remDays <= 3 ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                          remDays <= 7 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          {remDays} Days Remaining
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-sky-400 text-base">
                        {app.match_score}%
                      </td>
                      <td className="p-3">
                        {isFlagged ? (
                          <span className="badge-red">
                            <AlertTriangle className="w-3.5 h-3.5" /> High Risk Fraud ({flags.length || 1})
                          </span>
                        ) : (
                          <span className="badge-emerald">
                            <ShieldCheck className="w-3.5 h-3.5" /> Low Risk
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold ${
                          app.status === 'Shortlisted' ? 'badge-emerald' :
                          app.status.includes('Expired') || app.status === 'Rejected' ? 'badge-red' :
                          'badge-amber'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        <button
                          onClick={() => handleDecision(app.id, true)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs transition flex items-center gap-1"
                          title="Accept / Shortlist Candidate"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleDecision(app.id, false)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs transition flex items-center gap-1"
                          title="Reject Candidate"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CANDIDATE SCREENING & RANKING TABLE */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Dynamic Candidate Ranking & Screening Console
          </h3>
          <span className="text-xs text-slate-400">Sorted by ML Match Score (High to Low)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Candidate Name</th>
                <th className="p-3">Branch & Experience</th>
                <th className="p-3">Skills</th>
                <th className="p-3">ML Match Score</th>
                <th className="p-3">ML Decision</th>
                <th className="p-3">TPO Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {candidates
                .sort((a, b) => b.final_match_score - a.final_match_score)
                .map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="p-3 font-semibold text-white">{c.full_name}</td>
                    <td className="p-3 text-xs text-slate-400">{c.branch} ({c.experience_years} yrs exp)</td>
                    <td className="p-3 text-xs max-w-xs truncate font-mono text-indigo-300">{c.skills}</td>
                    <td className="p-3 font-extrabold text-indigo-400">{c.final_match_score}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-extrabold ${
                        c.decision === 'SHORTLIST' ? 'badge-emerald' : 'badge-red'
                      }`}>
                        {c.decision}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="badge-sky">
                        {c.tpo_status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
