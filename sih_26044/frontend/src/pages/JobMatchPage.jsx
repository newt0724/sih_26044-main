import React, { useState, useEffect } from 'react';
import { jobApi } from '../services/api';
import { Briefcase, Search, CheckCircle2, AlertTriangle, Sparkles, Building2, Clock, Eye, X } from 'lucide-react';

export const JobMatchPage = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [matchingJobId, setMatchingJobId] = useState(null);
  const [matchResults, setMatchResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [removingJobId, setRemovingJobId] = useState(null);

  useEffect(() => {
    jobApi.listJobs()
      .then((res) => setJobs(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleMatchJob = async (jobId) => {
    setMatchingJobId(jobId);
    try {
      const res = await jobApi.matchJob(jobId);
      setMatchResults((prev) => ({ ...prev, [jobId]: res.data }));
    } catch (err) {
      alert('Failed to calculate job match score.');
    } finally {
      setMatchingJobId(null);
    }
  };

  const handleApply = async (jobId) => {
    setApplyingJobId(jobId);
    try {
      await jobApi.applyJob(jobId);
      setSelectedJob(null);
      setRemovingJobId(jobId);
      window.setTimeout(() => {
        setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
        setRemovingJobId(null);
      }, 700);
    } catch (err) {
      alert('Application failed or profile missing.');
    } finally {
      setApplyingJobId(null);
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.job_role.toLowerCase().includes(search.toLowerCase()) ||
    job.company_name.toLowerCase().includes(search.toLowerCase()) ||
    job.required_skills.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Job Matching & Screening Console</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time candidate score prediction for active recruiter postings (20-day window).</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search role, skills, company..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading active recruiter job postings...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const matchData = matchResults[job.id];
            const isMatching = matchingJobId === job.id;

            return (
              <div key={job.id} className={`glass-card p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-700 ${removingJobId === job.id ? 'animate-pulse scale-105 opacity-0 rotate-2' : ''}`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> {job.company_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[11px] font-bold border border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ⏳ {job.deadline_days || 20}d Window
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                        ★ {job.company_rating}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white">{job.job_role}</h3>
                  <p className="text-xs text-slate-400 mt-1">{job.location} • {job.salary_range}</p>
                  
                  <p className="text-xs text-slate-300 mt-3 line-clamp-2">
                    {job.description || 'Looking for talented engineering candidates with strong core skills.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300"
                  >
                    <Eye className="w-3.5 h-3.5" /> View full job description
                  </button>

                  <div className="mt-4">
                    <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1">Required Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {job.required_skills.split(',').map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                          {skill.strip ? skill.strip() : skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Match Evaluation Result Box */}
                  {matchData && (
                    <div className="mt-5 p-3.5 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 uppercase font-bold">Predicted Match Score:</span>
                        <span className="text-lg font-extrabold text-sky-400">{matchData.match_score}%</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-slate-400">Status:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          matchData.decision === 'SHORTLIST' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {matchData.status_label}
                        </span>
                      </div>

                      {matchData.missing_skills?.length > 0 && (
                        <div className="text-[11px] text-amber-400">
                          Missing: {matchData.missing_skills.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => handleMatchJob(job.id)}
                    disabled={isMatching}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isMatching ? 'Calculating ML Score...' : 'Predict Match Score'}
                  </button>

                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 transition"
                  >
                    Apply to Position
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl border-sky-500/40 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-sky-400">{selectedJob.company_name}</p>
                <h2 className="mt-1 text-2xl font-extrabold text-white">{selectedJob.job_role}</h2>
                <p className="mt-1 text-xs text-slate-400">{selectedJob.location} • {selectedJob.salary_range}</p>
              </div>
              <button type="button" onClick={() => setSelectedJob(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close job description">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Job Description</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-200">{selectedJob.description || 'Looking for talented engineering candidates with strong core skills.'}</p>
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Required Skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedJob.required_skills.split(',').map((skill, idx) => (
                    <span key={idx} className="rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-200">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button type="button" onClick={() => setSelectedJob(null)} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-slate-700">Review Later</button>
              <button type="button" onClick={() => handleApply(selectedJob.id)} disabled={applyingJobId === selectedJob.id} className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-extrabold text-white hover:bg-sky-400 disabled:opacity-50">
                {applyingJobId === selectedJob.id ? 'Submitting...' : 'Apply to This Position'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
