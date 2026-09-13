import React, { useState, useEffect } from 'react';
import { govtApi } from '../services/api';
import { 
  Building2, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Briefcase, 
  Globe, 
  Award, 
  BookOpen, 
  TrendingUp,
  Mail,
  Sparkles,
  Search
} from 'lucide-react';

export const GovtDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 9-Field College Accreditation Form State
  const [collegeForm, setCollegeForm] = useState({
    full_legal_name: 'National Institute of Technology',
    institute_type: 'Institute of National Importance',
    district_and_state: 'Kurnool, Andhra Pradesh',
    ugc_recognition_no: 'UGC-2f-2011',
    aicte_approval_no: '1-9319586590',
    affiliated_university: 'Jawaharlal Nehru Technological University',
    year_of_establishment: 1980,
    gst_or_cin_no: '37AAAAA0000A1Z5',
    official_email_domain: 'nit.edu'
  });
  const [accredResult, setAccredResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Suggestion Modal State
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [suggestionSubject, setSuggestionSubject] = useState('');
  const [suggestionText, setSuggestionText] = useState('');
  const [sending, setSending] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState('');

  const loadData = async () => {
    try {
      const res = await govtApi.getAnalytics();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyCollege = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setAccredResult(null);
    try {
      const res = await govtApi.verifyCollege(collegeForm);
      setAccredResult(res.data);
    } catch (err) {
      setAccredResult({
        access_granted: false,
        accreditation_status: 'ERROR',
        message: 'Verification failed against CSV datasets.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const openSuggestionModal = (college) => {
    setSelectedCollege(college);
    setSuggestionSubject(`Government Academic Quality Directive: Curriculum Enhancement Recommendation for ${college.college_name}`);
    setSuggestionText(
      `Dear Academic Committee / TPO of ${college.college_name},\n\n` +
      `Based on the National Industry Skill Deficit Analysis, your current syllabus has been flagged for gaps in high-demand industry skills including PyTorch & Deep Learning, Distributed System Design, and Docker/Kubernetes DevOps.\n\n` +
      `We strongly recommend incorporating 15-20 hours of practical lab modules into your 5th & 6th semester CS/IT curriculum to improve batch employability.\n\n` +
      `Regards,\nMinistry of Education & National Accreditation Authority`
    );
    setSuggestionMessage('');
  };

  const handleSendSuggestion = async (e) => {
    e.preventDefault();
    if (!selectedCollege) return;
    setSending(true);
    try {
      const res = await govtApi.sendSuggestion({
        college_name: selectedCollege.college_name,
        official_email: selectedCollege.official_email,
        subject: suggestionSubject,
        suggestion_text: suggestionText,
        missing_skills_highlighted: 'PyTorch, System Design, Vector DBs, DevOps'
      });
      setSuggestionMessage(res.data.message);
      setTimeout(() => setSelectedCollege(null), 3000);
    } catch (err) {
      setSuggestionMessage('Failed to dispatch suggestion directive.');
    } finally {
      setSending(false);
    }
  };

  const filteredDirectory = data?.colleges_directory?.filter(c => 
    c.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.official_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.district_state.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* GOVERNMENT PORTAL HEADER */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 shadow-2xl shadow-amber-500/10">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
                <Globe className="w-3.5 h-3.5" /> National Higher Education Authority
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AICTE / UGC Accredited Inspection Console
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-2 flex items-center gap-2">
              <Building2 className="w-8 h-8 text-amber-400" /> Government Accreditation & Curriculum Intelligence Portal
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              National college accreditation verification against AICTE/UGC datasets, syllabus gap analytics, and college placement ratios.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-right">
              <span className="text-xs font-bold text-amber-300 uppercase block">Govt Clearance Status</span>
              <span className="text-sm font-extrabold text-emerald-400 flex items-center gap-1 justify-end">
                <ShieldCheck className="w-4 h-4" /> Active Inspector
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NATIONAL MACRO METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-amber-500/30 bg-gradient-to-b from-slate-900 to-amber-950/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Colleges</span>
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <span className="block text-3xl font-extrabold text-white">{data?.total_colleges || 0}</span>
          <span className="text-[11px] text-amber-400 font-semibold mt-1 block">Accreditation Verified</span>
        </div>

        <div className="glass-card p-5 border-sky-500/30 bg-gradient-to-b from-slate-900 to-sky-950/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Recruiters</span>
            <Briefcase className="w-5 h-5 text-sky-400" />
          </div>
          <span className="block text-3xl font-extrabold text-white">{data?.total_recruiters || 0}</span>
          <span className="text-[11px] text-sky-400 font-semibold mt-1 block">Active Industry Hiring</span>
        </div>

        <div className="glass-card p-5 border-indigo-500/30 bg-gradient-to-b from-slate-900 to-indigo-950/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Enrolled Candidates</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="block text-3xl font-extrabold text-white">{data?.total_students || 0}</span>
          <span className="text-[11px] text-indigo-400 font-semibold mt-1 block">Encrypted Identity Profiles</span>
        </div>

        <div className="glass-card p-5 border-emerald-500/30 bg-gradient-to-b from-slate-900 to-emerald-950/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">National Placement Ratio</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="block text-3xl font-extrabold text-emerald-400">{data?.overall_placement_ratio || 78.5}%</span>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">Employability Benchmark</span>
        </div>
      </div>

      {/* SECTION 1: 9-FIELD GOVERNMENT COLLEGE ACCREDITATION VERIFICATION ENGINE */}
      <div className="glass-card p-6 md:p-8 border-amber-500/30 shadow-xl">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" /> Government 9-Field College Accreditation Engine
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Verify institution accreditation credentials against 3 Government CSV datasets (<code className="text-amber-300">AICTE CLOSED COLLEGES</code>, <code className="text-emerald-300">AICTE COLLEGES APPROVED</code>, <code className="text-sky-300">UGC APPROVED COLLEGES</code>).
            </p>
          </div>
        </div>

        {accredResult && (
          <div className={`mb-6 p-4 rounded-xl border-2 text-sm space-y-2 ${
            accredResult.accreditation_status === 'BLOCKED_CLOSED_COLLEGE'
              ? 'bg-red-500/20 border-red-500 text-red-300'
              : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2 font-bold text-base">
              {accredResult.accreditation_status === 'BLOCKED_CLOSED_COLLEGE' ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
              <span>Accreditation Status: {accredResult.accreditation_status}</span>
            </div>
            <p className="text-xs">{accredResult.message}</p>
            {accredResult.matched_dataset && (
              <span className="inline-block px-2.5 py-1 rounded text-xs uppercase font-extrabold bg-slate-900 text-amber-300 border border-amber-500/30">
                Matched Govt Dataset: {accredResult.matched_dataset}
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleVerifyCollege} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">1. Full Legal Institute Name</label>
            <input
              type="text"
              required
              value={collegeForm.full_legal_name}
              onChange={(e) => setCollegeForm({ ...collegeForm, full_legal_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">2. Type of Institute</label>
            <select
              value={collegeForm.institute_type}
              onChange={(e) => setCollegeForm({ ...collegeForm, institute_type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-amber-500"
            >
              <option value="State">State University</option>
              <option value="Central">Central University</option>
              <option value="Private">Private / Self Financing</option>
              <option value="Deemed">Deemed University</option>
              <option value="Open">Open University</option>
              <option value="Institute of National Importance">Institute of National Importance</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">3. District & State</label>
            <input
              type="text"
              required
              value={collegeForm.district_and_state}
              onChange={(e) => setCollegeForm({ ...collegeForm, district_and_state: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">4. UGC Recognition No / 2(f)</label>
            <input
              type="text"
              value={collegeForm.ugc_recognition_no}
              onChange={(e) => setCollegeForm({ ...collegeForm, ugc_recognition_no: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">5. AICTE Approval No (e.g. 1-9319586590)</label>
            <input
              type="text"
              value={collegeForm.aicte_approval_no}
              onChange={(e) => setCollegeForm({ ...collegeForm, aicte_approval_no: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">6. Affiliated University Name</label>
            <input
              type="text"
              value={collegeForm.affiliated_university}
              onChange={(e) => setCollegeForm({ ...collegeForm, affiliated_university: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">7. Year of Establishment</label>
            <input
              type="number"
              value={collegeForm.year_of_establishment}
              onChange={(e) => setCollegeForm({ ...collegeForm, year_of_establishment: parseInt(e.target.value) || 2000 })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">8. GST / CIN Number</label>
            <input
              type="text"
              value={collegeForm.gst_or_cin_no}
              onChange={(e) => setCollegeForm({ ...collegeForm, gst_or_cin_no: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">9. Official Email Domain</label>
            <input
              type="text"
              required
              value={collegeForm.official_email_domain}
              onChange={(e) => setCollegeForm({ ...collegeForm, official_email_domain: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-3 mt-2">
            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 rounded-xl font-extrabold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              {verifying ? 'Verifying 9 Legal Fields Against AICTE & UGC Datasets...' : 'Run Government 9-Field Accreditation Verification'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: NATIONAL INDUSTRY VS COLLEGE SYLLABUS SKILL DEFICIT HEATMAP */}
      <div className="glass-card p-6 border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-400" /> National Skill Deficit & Syllabus vs Industry Gap Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Identifies top skills mostly lacking among students compared to current market demand across registered colleges.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Real-Time Industry AI Gap Radar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.national_skill_deficits?.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" /> {item.skill}
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                  item.deficit_percentage >= 60 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {item.market_demand_status}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>National Skill Deficit Rate:</span>
                  <span className="text-red-400 font-extrabold">{item.deficit_percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.deficit_percentage >= 60 ? 'bg-red-500' : 'bg-amber-500'}`} 
                    style={{ width: `${item.deficit_percentage}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                <span className="font-semibold text-amber-300">Govt Syllabus Directive:</span> {item.recommended_syllabus_addition}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: COLLEGE PLACEMENT RATIO & BEST COLLEGES LEADERBOARD */}
      <div className="glass-card p-6 border-emerald-500/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-400" /> Institution Placement Benchmark & Leaderboard
            </h3>
            <p className="text-xs text-slate-400">Colleges performing best in graduate placement ratios & employability index.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Institution Name</th>
                <th className="p-3">Location</th>
                <th className="p-3">Students</th>
                <th className="p-3">Avg Employability</th>
                <th className="p-3">Placement Ratio</th>
                <th className="p-3">Govt Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.colleges_leaderboard?.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-900/60 transition">
                  <td className="p-3 font-extrabold text-amber-400">#{col.rank}</td>
                  <td className="p-3 font-bold text-white">
                    {col.college_name}
                    <span className="block text-[11px] font-normal text-slate-400">{col.official_email}</span>
                  </td>
                  <td className="p-3 text-xs text-slate-400">{col.district_state}</td>
                  <td className="p-3 font-bold">{col.student_count}</td>
                  <td className="p-3 font-extrabold text-sky-400">{col.avg_employability_score}%</td>
                  <td className="p-3 font-extrabold text-emerald-400">{col.placement_ratio}%</td>
                  <td className="p-3 text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      {col.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: OFFICIAL COLLEGE DIRECTORY & 1-CLICK SYLLABUS QUALITY SUGGESTION TOOL */}
      <div className="glass-card p-6 border-sky-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-sky-400" /> College Official Directory & Quality Improvement Directive Dispatcher
            </h3>
            <p className="text-xs text-slate-400">
              Dispatches official Government syllabus recommendations directly to college TPOs & Academic committees.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search college email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDirectory.map((col) => (
            <div key={col.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-white">{col.college_name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                    {col.aicte_status}
                  </span>
                </div>
                <div className="text-xs text-sky-400 font-mono mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" /> {col.official_email}
                </div>
                <p className="text-xs text-slate-400 mt-1">{col.district_state} • Syllabus Version: {col.syllabus_version}</p>
              </div>

              <button
                onClick={() => openSuggestionModal(col)}
                className="w-full py-2 rounded-lg font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Syllabus Improvement Directive
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SUGGESTION DISPATCH MODAL */}
      {selectedCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card max-w-xl w-full p-6 border-amber-500/40 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Send Official Government Quality Directive
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              To: <strong className="text-sky-300">{selectedCollege.official_email}</strong> ({selectedCollege.college_name})
            </p>

            {suggestionMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {suggestionMessage}
              </div>
            )}

            <form onSubmit={handleSendSuggestion} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase">Directive Subject</label>
                <input
                  type="text"
                  required
                  value={suggestionSubject}
                  onChange={(e) => setSuggestionSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1 uppercase">Syllabus Quality Recommendation Body</label>
                <textarea
                  rows="6"
                  required
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCollege(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex items-center gap-1.5"
                >
                  {sending ? 'Dispatching Email...' : <><Send className="w-4 h-4" /> Dispatch Official Directive</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
