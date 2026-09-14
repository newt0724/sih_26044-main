import React, { useState, useEffect } from 'react';
import { candidateApi, resumeApi, jobApi } from '../services/api';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Github, 
  Linkedin, 
  Brain,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  Plus,
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

const skillCatalog = ['Python', 'SQL', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'FastAPI', 'Docker', 'Kubernetes', 'System Design', 'Git', 'React'];

const buildSkillGraph = (profile, evaluation) => {
  const profileSkills = String(profile?.skills || '').toLowerCase();
  const strengths = (evaluation?.explainability?.strengths || []).filter(Boolean).join(' ').toLowerCase();
  const gaps = (evaluation?.explainability?.gaps || []).filter(Boolean).join(' ').toLowerCase();
  const ownedText = [profileSkills, strengths].filter(Boolean).join(' ');
  const ownedSkills = skillCatalog.filter((skill) => ownedText.includes(skill.toLowerCase()));
  const learnSkills = skillCatalog.filter((skill) => gaps.includes(skill.toLowerCase()) && !ownedSkills.includes(skill));
  const fallbackOwned = ownedSkills.length ? ownedSkills : ['Python', 'SQL', 'Git'];
  const fallbackLearn = learnSkills.length ? learnSkills : ['Deep Learning', 'Docker', 'System Design'];
  return [...new Set([...fallbackOwned, ...fallbackLearn])].slice(0, 7).map((skill) => ({
    skill,
    owned: Math.min(100, (profileSkills.includes(skill.toLowerCase()) ? 60 : 0) + (strengths.includes(skill.toLowerCase()) ? 40 : 0)),
    learn: Math.min(100, (gaps.includes(skill.toLowerCase()) ? 70 : 0) + (!ownedText.includes(skill.toLowerCase()) ? 30 : 0))
  }));
};

export const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [applications, setApplications] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsViewed, setNotificationsViewed] = useState(false);

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

      const aRes = await jobApi.getMyApplications();
      setApplications(aRes.data || []);

      const evalRes = await candidateApi.evaluate();
      setEvaluation(evalRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
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

  const updateCertificateDecision = async (proofAvailable, declined, file = null) => {
    try {
      if (file) await candidateApi.uploadCertificateProof(file);
      await candidateApi.updateProfile({ has_certification_proof: proofAvailable, certificate_upload_declined: declined });
      setMessage(proofAvailable ? 'Certificate proof marked as available. Re-run evaluation to update your score.' : 'Certificate proof declined. A strict -2.5% penalty will be applied on the next evaluation.');
      await handleRunEvaluation();
    } catch (err) {
      setError('Could not update certificate verification status.');
    }
  };

  const hasResume = evaluation?.has_uploaded_resume || profile?.has_uploaded_resume;
  const flags = evaluation?.flags || evaluation?.anti_fraud?.flags || [];
  const skillGraph = buildSkillGraph(profile, evaluation);

  return (
    <div className={`student-game-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${notificationsOpen ? 'notification-mode-open' : ''}`}>
      
      {/* HEADER SECTION */}
      <div className="glass-card player-header p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden glow-sky">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="game-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Brain className="w-8 h-8 text-sky-400" /> Chhatra Command Center
            </h1>
            <span className={profile?.is_verified_by_tpo ? 'badge-emerald' : 'badge-amber'}>
              <ShieldCheck className="w-3.5 h-3.5" />
              TPO: {profile?.tpo_status || 'Pending Verification'}
            </span>
            {profile?.college_verified && (
              <span className="badge-emerald"><ShieldCheck className="w-3.5 h-3.5" /> College / Placement Cell Verified</span>
            )}
            <span className="badge-indigo">
              Roll No: {profile?.roll_number || 'NIT2026-CSE01'}
            </span>
          </div>
          <p className="game-font text-[9px] text-emerald-400 tracking-widest mb-2">PLAYER HUD // CHHATRA QUESTLINE</p>
          <p className="text-slate-400 text-sm max-w-2xl">
            Level up your profile with ML scoring, resume shields, coding quests, GitHub proof-of-work, and live career missions.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="player-level-hud"><span>LEVEL 04</span><strong>{Math.round(profile?.final_match_score || evaluation?.final_match_score || 0)} XP</strong></div>
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

      <button
        type="button"
        className="notification-bell"
        onClick={() => {
          setNotificationsViewed(true);
          setNotificationsOpen(true);
        }}
        aria-label={applications.length && !notificationsViewed ? `Open notifications, ${applications.length} notifications` : 'Open notifications'}
      >
        <span className="notification-bell-icon">⌕</span><span>NOTIFICATIONS</span>
        {applications.length > 0 && !notificationsViewed && <strong>{applications.length}</strong>}
      </button>

      {notificationsOpen && <>
        <button type="button" className="notification-backdrop" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications" />
        <section className="notification-sheet" aria-label="Career notifications">
          <div className="notification-sheet-handle" />
          <div className="flex items-center justify-between gap-3">
            <div><span className="game-font text-[8px] text-sky-400 tracking-widest">INCOMING TRANSMISSIONS</span><h3 className="game-heading mt-2 text-xl font-extrabold text-white">Career notifications</h3></div>
            <button type="button" className="notification-close" onClick={() => setNotificationsOpen(false)}>CLOSE</button>
          </div>
          <div className="notification-strip">
            {applications.length > 0 ? applications.map((application) => {
              const isFinal = application.status !== 'Under Review';
              return <article key={application.id} className="notification-card"><span className="notification-card-dot" /><b>{application.job?.job_role || 'Job application'}</b><span className="notification-status">{application.status}</span><p>{isFinal ? (application.explainability?.decision_reason || 'The recruiter recorded a final decision.') : 'Your application is under recruiter review.'}</p></article>;
            }) : <article className="notification-card"><span className="notification-card-dot" /><b>No transmissions yet</b><p>Your career mission updates will appear here.</p></article>}
          </div>
        </section>
      </>}

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

      {evaluation?.certificate_verification?.upload_required && (
        <div className="certificate-proof-panel">
          <div><p className="game-font text-[8px] text-amber-300 tracking-widest">VERIFICATION QUEST</p><h3>Certificate proof required</h3><p>Your resume mentions a certification, but no proof is linked. Upload it to protect your score, or decline and accept a strict -2.5% penalty.</p></div>
          <div className="certificate-proof-actions"><label className="certificate-upload-button"><input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => updateCertificateDecision(true, false, event.target.files?.[0])} /> Upload proof</label><button type="button" onClick={() => updateCertificateDecision(false, true)}>Decline (-2.5%)</button></div>
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

          <div className="text-xs text-slate-400 border-t border-slate-800 pt-3 space-y-2">
            <div className="flex justify-between gap-3">
              <span>Identity Verified:</span>
              <span className={`font-extrabold ${evaluation?.verification?.identity_verified ? 'text-emerald-400' : 'text-red-400'}`}>
                {evaluation ? (evaluation.verification?.identity_verified ? 'Yes' : 'Mismatch') : 'Pending'}
              </span>
            </div>
            {evaluation?.verification?.reason && !evaluation.verification.identity_verified && (
              <p className="text-[11px] leading-relaxed text-amber-300">
                {evaluation.verification.reason}
              </p>
            )}
          </div>
        </div>

      </div>

      <div className="skill-graph-panel quest-panel glass-card p-5 border-emerald-500/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="game-font text-[8px] tracking-widest text-emerald-400">SKILL MAP // PLAYER PROGRESSION</p>
            <h3 className="game-heading mt-2 text-xl font-extrabold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-400" /> Owned vs Learn Next</h3>
            <p className="mt-1 text-xs text-slate-400">Your current build compared with the skills that unlock the next career level.</p>
          </div>
          <div className="skill-graph-legend"><span><i className="skill-dot skill-dot-owned" /> Owned</span><span><i className="skill-dot skill-dot-learn" /> Learn next</span></div>
        </div>
        <div className="skill-pie-stage" role="img" aria-label="Skill pie chart comparing owned skills and skills to learn next">
          <div className="skill-pie-beam" /><div className="skill-pie-labels">
            {skillGraph.map(({ skill, owned, learn }, index) => <span className={`skill-float-tag skill-float-${index % 4}`} key={skill}><b>{skill}</b><small>{owned > learn ? `OWNED ${owned}%` : `LEARN NEXT ${learn}%`}</small></span>)}
          </div>
          <div className="skill-pie-wrap"><div className="skill-pie" style={{ background: `conic-gradient(#34d399 0 ${Math.round((skillGraph.filter(({ owned, learn }) => owned > learn).length / skillGraph.length) * 100)}%, #fbbf24 ${Math.round((skillGraph.filter(({ owned, learn }) => owned > learn).length / skillGraph.length) * 100)}% 100%)` }}><div className="skill-pie-core"><strong>{skillGraph.filter(({ owned, learn }) => owned > learn).length}</strong><span>READY</span></div></div><span className="skill-pie-caption">SKILL CORE // LEVEL UP</span></div>
        </div>
      </div>

      {/* MODEL EXECUTION FLOW */}
      {evaluation?.flow?.length > 0 && (
        <div className="glass-card quest-panel p-6 border-sky-500/30">
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

      {/* EXPLAINABILITY & SKILL GUIDANCE SECTION */}
      <div className="student-skill-summary grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Strengths */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Detected Profile Strengths
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {evaluation?.explainability?.strengths?.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span>{item}</span>
              </li>
            )) || <li className="text-slate-500 text-xs">Run evaluation to view strengths.</li>}
          </ul>
        </div>

        {/* Missing Skills / Recommendations */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Skill Deficits & Guidance
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {evaluation?.explainability?.gaps?.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <span>{item}</span>
              </li>
            )) || <li className="text-slate-500 text-xs">No missing skill gaps flagged.</li>}
          </ul>
        </div>

      </div>

      <div className="project-quest-panel quest-panel glass-card p-5 border-indigo-500/30">
        <p className="game-font text-[8px] text-indigo-300 tracking-widest">PROJECT QUEST BOARD</p>
        <h3 className="game-heading mt-2 text-xl font-extrabold text-white">Build these to raise your acceptance odds</h3>
        <div className="project-quest-grid">
          {(evaluation?.project_suggestions || ['Build an end-to-end portfolio project with a deployed demo and clear README.']).map((project, index) => <div className="project-quest" key={`${project}-${index}`}><span>QUEST 0{index + 1}</span><p>{project}</p><small>PORTFOLIO XP +++</small></div>)}
        </div>
      </div>

    </div>
  );
};
