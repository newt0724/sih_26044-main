import React, { useState, useEffect } from 'react';
import { teacherApi } from '../services/api';
import { BookOpen, UploadCloud, CheckCircle2, AlertTriangle, Users, Sparkles, FileText, Award } from 'lucide-react';

export const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [domain, setDomain] = useState('Machine Learning & AI');
  const [syllabusReport, setSyllabusReport] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    teacherApi.getStudents()
      .then((res) => setStudents(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSyllabusUpload = async (fileToUpload) => {
    const file = fileToUpload || selectedFile;
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const res = await teacherApi.analyzeSyllabusGap(domain, file);
      setSyllabusReport(res.data);
    } catch (err) {
      setError('Failed to analyze syllabus document. Please ensure PDF contains text or scanned pages.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleSyllabusUpload(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glow-amber">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-amber-400" /> Teacher & Faculty Portal
          </h1>
          <p className="text-slate-400 text-sm">
            Institutional Curriculum & Syllabus Gap Analysis, industry skill benchmark mapping, and student readiness matrix.
          </p>
        </div>

        <span className="badge-amber text-xs">
          <Award className="w-4 h-4" /> Academic Accreditation Sync Active
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm flex items-center gap-2 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SYLLABUS GAP ANALYZER SECTION */}
      <div className="glass-card p-6 border-amber-500/40 glow-amber space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Institutional Curriculum & Syllabus Gap Analyzer
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload college course syllabus PDF or image to extract taught modules and evaluate against industry benchmarks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Target Industry Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 font-semibold"
            >
              <option value="Machine Learning & AI">Machine Learning & AI</option>
              <option value="Full Stack Software Engineering">Full Stack Software Engineering</option>
              <option value="Data Engineering & Analytics">Data Engineering & Analytics</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-xl p-4 text-center block transition bg-slate-950/60">
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="hidden" />
              <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-amber-400">
                <UploadCloud className="w-5 h-5" />
                {uploading ? 'Parsing Syllabus PDF & Running OCR...' : (selectedFile ? `Selected: ${selectedFile.name}` : 'Click to Upload College Syllabus Document (PDF / Image)')}
              </div>
            </label>
          </div>
        </div>

        {/* SYLLABUS ANALYSIS REPORT OUTPUT */}
        {syllabusReport && (
          <div className="pt-6 border-t border-slate-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-xs uppercase font-extrabold text-slate-400 block">Syllabus File: {syllabusReport.filename}</span>
                <span className="text-sm font-bold text-white">Domain: {syllabusReport.domain_category}</span>
              </div>
              <div className="px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xl glow-amber">
                Curriculum Alignment: {syllabusReport.syllabus_alignment_score}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Covered Industry Skills ({syllabusReport.covered_skills?.length}):
                  </span>
                  <span className="badge-emerald">{syllabusReport.covered_skills_count}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {syllabusReport.covered_skills?.length > 0 ? (
                    syllabusReport.covered_skills.map((s, idx) => (
                      <span key={idx} className="badge-emerald font-mono">
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-xs italic">No benchmark skills detected in syllabus text.</span>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/80 border border-red-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Outdated / Missing Skills ({syllabusReport.missing_skills?.length}):
                  </span>
                  <span className="badge-red">{syllabusReport.missing_skills?.length} Deficits</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {syllabusReport.missing_skills?.map((s, idx) => (
                    <span key={idx} className="badge-red font-mono">
                      ✗ {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-xs font-extrabold uppercase text-amber-400 block tracking-wider">Curriculum Action Plan & Lab Recommendations:</span>
              <ul className="space-y-2 text-xs text-slate-300">
                {syllabusReport.recommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* STUDENT READINESS TABLE */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" /> Student Performance & Readiness Matrix
          </h3>
          <span className="text-xs text-slate-400">{students.length} Enrolled Students</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Branch & Batch</th>
                <th className="p-3">Skills</th>
                <th className="p-3">ML Match Score</th>
                <th className="p-3">Decision Status</th>
                <th className="p-3">TPO Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {students.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-900/60 transition">
                  <td className="p-3 font-semibold text-white">{s.full_name}</td>
                  <td className="p-3 text-xs text-slate-400">{s.branch} ({s.batch_year})</td>
                  <td className="p-3 text-xs max-w-xs truncate font-mono text-indigo-300">{s.skills}</td>
                  <td className="p-3 font-extrabold text-sky-400">{s.final_match_score}%</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold ${
                      s.decision === 'SHORTLIST' ? 'badge-emerald' : 'badge-red'
                    }`}>
                      {s.decision}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="badge-sky">
                      {s.tpo_status}
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
