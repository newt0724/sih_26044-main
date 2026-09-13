import React, { useState, useEffect } from 'react';
import { candidateApi, resumeApi, jobApi, assessmentApi } from '../services/api';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Github, 
  Linkedin, 
  Award, 
  Briefcase, 
  Brain,
  ShieldCheck,
  RefreshCw,
  Plus,
  Code,
  Send,
  HelpCircle,
  XCircle,
  FileCheck
} from 'lucide-react';

const formatFlowLabel = (key) => key
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatFlowValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Not available';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'None';
  return String(value);
};

const FlowDetails = ({ details }) => {
  if (!details || typeof details !== 'object') {
    return <span>{formatFlowValue(details)}</span>;
  }

  return (
    <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-slate-400">
      {Object.entries(details).map(([key, value]) => (
        <div key={key}>
          <span className="font-semibold text-slate-300">{formatFlowLabel(key)}:</span>{' '}
          {value && typeof value === 'object' && !Array.isArray(value) ? (
            <div className="ml-3 mt-1 space-y-1 border-l border-slate-700 pl-3">
              <FlowDetails details={value} />
            </div>
          ) : (
            <span>{formatFlowValue(value)}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Assessment Quiz States
  const [questions, setQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Form edit states
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    roll_number: 'NIT2026-CSE01',
    college: 'National Institute of Technology',
    branch: 'Computer Science Engineering',
    batch_year: 2026,
    college_email: '',
    skills: '',
    experience_years: 1,
    education: 'B.Tech',
    certifications: 'None',
    projects_count: 2,
    salary_expectation: 60000,
    github_url: '',
    linkedin_url: ''
  });

  const loadData = async () => {
    try {
      const pRes = await candidateApi.getProfile();
      setProfile(pRes.data);
      setFormData({
        roll_number: pRes.data.roll_number || 'NIT2026-CSE01',
        college: pRes.data.college || 'National Institute of Technology',
        branch: pRes.data.branch || 'Computer Science Engineering',
        batch_year: pRes.data.batch_year || 2026,
        college_email: pRes.data.college_email || '',
        skills: pRes.data.skills || '',
        experience_years: pRes.data.experience_years || 1,
        education: pRes.data.education || 'B.Tech',
        certifications: pRes.data.certifications || 'None',
        projects_count: pRes.data.projects_count || 2,
        salary_expectation: pRes.data.salary_expectation || 60000,
        github_url: pRes.data.github_url || '',
        linkedin_url: pRes.data.linkedin_url || ''
      });

      const rRes = await candidateApi.getRecommendations();
      setRecommendations(rRes.data || []);

      const evalRes = await candidateApi.evaluate();
      setEvaluation(evalRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadQuestions = async () => {
    try {
      const res = await assessmentApi.getQuestions();
      setQuestions(res.data || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadData();
    loadQuestions();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await candidateApi.updateProfile(formData);
      setIsEditing(false);
      setMessage('Profile features updated successfully!');
      loadData();
    } catch (err) {
      setError('Failed to update candidate profile.');
    }
  };

  const handleApplyPosition = async (jobId, company, role) => {
    try {
      await jobApi.applyJob(jobId);
      setMessage(`Successfully applied for '${role}' at ${company}! Application recorded.`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit application.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const res = await resumeApi.uploadResume(file);
      setMessage(`Resume '${file.name}' parsed, scanned & evaluated successfully!`);
      setEvaluation(res.data.evaluation);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to parse resume file.');
    } finally {
      setUploading(false);
    }
  };

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const evalRes = await candidateApi.evaluate();
      setEvaluation(evalRes.data);
      setMessage('ML Evaluation refreshed!');
    } catch (err) {
      setError('Failed to re-run ML evaluation.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setQuizSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await assessmentApi.submitAnswers(quizAnswers);
      setQuizResult(res.data);
      setMessage(`Coding assessment submitted! You scored ${res.data.score_percentage}% (${res.data.correct_count}/${res.data.total_questions} correct). Bonus score added!`);
      loadData();
    } catch (err) {
      setError('Failed to submit coding assessment answers.');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const hasResume = evaluation?.has_uploaded_resume || profile?.has_uploaded_resume;
  const flags = evaluation?.flags || evaluation?.anti_fraud?.flags || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden glow-sky">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Brain className="w-8 h-8 text-sky-400" /> Candidate ML Portal
            </h1>
            <span className={profile?.is_verified_by_tpo ? 'badge-emerald' : 'badge-amber'}>
              <ShieldCheck className="w-3.5 h-3.5" />
              TPO: {profile?.tpo_status || 'Pending Verification'}
            </span>
            <span className="badge-indigo">
              Roll No: {profile?.roll_number || 'NIT2026-CSE01'}
            </span>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            Real ML candidate scoring, PDF anti-fraud inspection, interactive coding assessments, and job recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="px-4 py-2.5 rounded-xl font-bold text-sm bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition disabled:opacity-50 shadow-md"
          >
            <RefreshCw className={`w-4 h-4 text-sky-400 ${evaluating ? 'animate-spin' : ''}`} />
            {evaluating ? 'Evaluating...' : 'Re-Run ML Score'}
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/20 transition"
          >
            {isEditing ? 'Close Profile Form' : 'Edit ML Profile Features'}
          </button>
        </div>
      </div>

      {/* NO RESUME UPLOAD WARNING BANNER */}
      {!hasResume && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border-2 border-amber-500/40 text-amber-200 space-y-4 shadow-xl glow-amber">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 animate-bounce" />
                Resume Not Uploaded Yet
              </h3>
              <p className="text-xs text-amber-200/90 max-w-3xl">
                You have not uploaded a resume PDF yet. Upload your resume to run automatic white-text font anti-fraud scan, OCR inspection, and unlock your personalized candidate match score.
              </p>
            </div>
            <label className="cursor-pointer px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 whitespace-nowrap">
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} className="hidden" />
              <UploadCloud className="w-5 h-5" />
              {uploading ? 'Parsing PDF & Scanning...' : 'Upload Resume PDF Now'}
            </label>
          </div>
        </div>
      )}

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

      {/* EDIT PROFILE FORM */}
      {isEditing && (
        <div className="glass-card p-6 border-sky-500/40 shadow-sky-500/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" /> Structured Candidate Features
          </h3>
          <form onSubmit={handleProfileSave} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">College Roll Number</label>
              <input
                type="text"
                value={formData.roll_number}
                onChange={(e) => setFormData({...formData, roll_number: e.target.value})}
                placeholder="NIT2026-CSE01"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">College Name</label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({...formData, college: e.target.value})}
                placeholder="National Institute of Technology"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Branch / Department</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                placeholder="Computer Science Engineering"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Batch / Graduation Year</label>
              <input
                type="number"
                value={formData.batch_year}
                onChange={(e) => setFormData({...formData, batch_year: parseInt(e.target.value) || 2026})}
                placeholder="2026"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Technical Skills</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="Python, PyTorch, SQL, FastAPI"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Experience (Years)</label>
              <input
                type="number"
                step="0.5"
                value={formData.experience_years}
                onChange={(e) => setFormData({...formData, experience_years: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Education Degree</label>
              <select
                value={formData.education}
                onChange={(e) => setFormData({...formData, education: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="B.Sc">B.Sc</option>
                <option value="MBA">MBA</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Certifications</label>
              <input
                type="text"
                value={formData.certifications}
                onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                placeholder="AWS Certified, Deep Learning"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Projects Count</label>
              <input
                type="number"
                value={formData.projects_count}
                onChange={(e) => setFormData({...formData, projects_count: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Salary Expectation ($)</label>
              <input
                type="number"
                value={formData.salary_expectation}
                onChange={(e) => setFormData({...formData, salary_expectation: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">GitHub Profile URL</label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
            <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-sm font-bold bg-sky-500 text-white hover:bg-sky-400 shadow-md shadow-sky-500/20"
              >
                Save Features
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOP CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ML Score & Decision Card */}
        <div className="glass-card-hover p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">ML Candidate Score</span>
            <Brain className="w-5 h-5 text-sky-400" />
          </div>

          <div className="my-6">
            {hasResume ? (
              <>
                <div className="text-5xl font-extrabold text-white tracking-tight">
                  {evaluation ? `${evaluation.final_match_score}%` : 'Evaluating...'}
                </div>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border bg-slate-800/80">
                  <span className={evaluation?.decision === 'SHORTLIST' ? 'text-emerald-400' : 'text-red-400'}>
                    Decision: {evaluation?.decision || 'PENDING'}
                  </span>
                </div>
              </>
            ) : (
              <div>
                <span className="text-3xl font-extrabold text-slate-400 tracking-tight block">
                  Pending Upload
                </span>
                <span className="text-xs text-amber-400 mt-2 block font-semibold">
                  Upload PDF resume to get your score
                </span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 pt-3 border-t border-slate-800 flex justify-between">
            <span>Raw ML Regressor: {hasResume && evaluation ? `${evaluation.raw_ml_score}%` : 'N/A'}</span>
            <span>Model: v1.0</span>
          </div>
        </div>

        {/* Anti-Fraud Inspection Card */}
        <div className="glass-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Anti-Fraud Inspection</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="my-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Fraud Risk Level:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                evaluation?.anti_fraud?.fraud_risk === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                evaluation?.anti_fraud?.fraud_risk === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                hasResume ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                {hasResume ? (evaluation?.anti_fraud?.fraud_risk || 'Low Risk') : 'Pending Scan'}
              </span>
            </div>
            
            <p className="text-xs text-slate-400">
              {evaluation?.anti_fraud?.explanation || (hasResume ? 'No white-text font anomalies detected.' : 'Upload PDF to run inspection.')}
            </p>

            {hasResume && evaluation?.anti_fraud?.penalty_score < 0 && (
              <div className="text-xs text-red-400 font-extrabold">
                Penalty Applied: {evaluation.anti_fraud.penalty_score}%
              </div>
            )}
          </div>

          {/* Upload Dropzone Button */}
          <label className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-xl p-3 text-center block transition bg-slate-900/50">
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} className="hidden" />
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-sky-400">
              <UploadCloud className="w-4 h-4" />
              {uploading ? 'Parsing PDF & Running OCR...' : (hasResume ? 'Re-Upload Resume PDF' : 'Upload Resume PDF')}
            </div>
          </label>
        </div>

        {/* GitHub Verification Card */}
        <div className="glass-card-hover p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">GitHub Proof-of-Work</span>
            <Github className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="my-4 space-y-2">
            {evaluation?.github?.valid ? (
              <>
                <div className="text-sm font-semibold text-white">
                  User: <span className="text-indigo-400 font-bold">@{evaluation.github.username}</span>
                </div>
                <div className="text-xs text-slate-300 flex justify-between">
                  <span>Public Repos: {evaluation.github.public_repos}</span>
                  <span className="text-emerald-400 font-bold">Bonus: +{evaluation.github.bonus_score}%</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {evaluation.github.tech_stack?.slice(0, 5).map((lang, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] border border-indigo-500/20 font-mono">
                      {lang}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400">
                Link public GitHub profile in settings to earn up to +10% bonus match score.
              </p>
            )}
          </div>

          <div className="text-xs text-slate-400 border-t border-slate-800 pt-3 flex justify-between">
            <span>Identity Verified:</span>
            <span className="text-white font-extrabold">{evaluation?.verification?.identity_verified ? 'Yes' : 'Pending'}</span>
          </div>
        </div>

      </div>

      {/* MODEL EXECUTION FLOW */}
      {evaluation?.flow?.length > 0 && (
        <div className="glass-card p-6 border-sky-500/30">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-sky-400" /> Model Execution Flow
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Latest run from main_ml_part, in execution order.
              </p>
            </div>
            <span className="badge-emerald">{evaluation.model_version || 'ML runtime'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {evaluation.flow.map((stage, index) => (
              <div key={`${stage.step}-${index}`} className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-extrabold text-sky-300">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white">{stage.step}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-wider text-emerald-400">{stage.status}</div>
                    <FlowDetails details={stage.details} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMBEDDED INTERACTIVE CODING ASSESSMENT MODULE */}
      <div className="glass-card p-6 border-indigo-500/30 glow-indigo">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Code className="w-6 h-6 text-indigo-400" /> Skill Assessment & Practice Questions
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Answer skill-matched technical questions right here to boost your ML score bonus (+15% score bonus).
            </p>
          </div>

          {quizResult && (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Latest Score: {quizResult.score_percentage}% ({quizResult.correct_count}/{quizResult.total_questions} Correct)
            </div>
          )}
        </div>

        {loadingQuestions ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading skill practice questions...</div>
        ) : (
          <form onSubmit={handleQuizSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {questions.map((q, idx) => {
                const resItem = quizResult?.breakdown?.find((b) => String(b.question_id) === String(q.id));

                return (
                  <div key={q.id} className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                        Q{idx + 1}. {q.topic}
                      </span>
                      
                      {resItem && (
                        <span className={`text-xs font-extrabold flex items-center gap-1 ${
                          resItem.is_correct ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {resItem.is_correct ? (
                            <><CheckCircle2 className="w-4 h-4" /> Correct</>
                          ) : (
                            <><XCircle className="w-4 h-4" /> Expected: '{resItem.expected}'</>
                          )}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-white">{q.question}</p>

                    {q.code_snippet && (
                      <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300 font-mono text-xs overflow-x-auto">
                        <code>{q.code_snippet}</code>
                      </pre>
                    )}

                    <div>
                      <input
                        type="text"
                        required
                        value={quizAnswers[q.id] || ''}
                        onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                        placeholder="Enter answer / code output..."
                        className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={quizSubmitting}
              className="w-full py-3 rounded-xl font-extrabold text-white bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
            >
              {quizSubmitting ? 'Evaluating Answers...' : <><Send className="w-4 h-4" /> Submit Coding Assessment Answers</>}
            </button>
          </form>
        )}
      </div>

      {/* EXPLAINABILITY & SKILL GUIDANCE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="glass-card p-6">
          <h3 className="text-md font-bold text-white flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Detected Profile Strengths
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {evaluation?.explainability?.strengths?.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span>{item}</span>
              </li>
            )) || <li className="text-slate-500 text-xs">Run evaluation to view strengths.</li>}
          </ul>
        </div>

        {/* Missing Skills / Recommendations */}
        <div className="glass-card p-6">
          <h3 className="text-md font-bold text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Skill Deficits & Guidance
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {evaluation?.explainability?.gaps?.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <span>{item}</span>
              </li>
            )) || <li className="text-slate-500 text-xs">No missing skill gaps flagged.</li>}
          </ul>
        </div>

      </div>

      {/* RECOMMENDED JOBS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-sky-400" /> Skill-Matched Open Positions
          </h3>
          <span className="text-xs text-slate-400">{recommendations.length} Matching Jobs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="glass-card-hover p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">{rec.company_name}</span>
                  <span className="badge-sky">
                    {rec.match_score}% Match
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">{rec.job_role}</h4>
                <p className="text-xs text-slate-400 mt-1">{rec.location} • {rec.salary_range}</p>
                
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 block tracking-wider">Matching Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {rec.matching_skills?.map((sk, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20 font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleApplyPosition(rec.job_id, rec.company_name, rec.job_role)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" /> Apply to Position
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
