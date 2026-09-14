import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi, tpoApi } from '../services/api';
import { GraduationCap, UserPlus, AlertCircle, ShieldCheck, CheckCircle2, Lock, Building2, Home } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') || 'student');
  const selectedRole = searchParams.get('role');
  const roleLabels = {
    student: 'Chhatra',
    recruiter: 'Karyah',
    teacher: 'Guru',
    tpo: 'Gurukul',
    govt: 'Rajya'
  };
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [cin, setCin] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [collegeLegalName, setCollegeLegalName] = useState('');
  const [instituteType, setInstituteType] = useState('State');
  const [districtAndState, setDistrictAndState] = useState('');
  const [ugcRecognitionNumber, setUgcRecognitionNumber] = useState('');
  const [aicteApprovalNumber, setAicteApprovalNumber] = useState('');
  const [affiliatedUniversity, setAffiliatedUniversity] = useState('');
  const [establishmentYear, setEstablishmentYear] = useState(2000);
  const [collegeGstCin, setCollegeGstCin] = useState('');
  const [officialEmailDomain, setOfficialEmailDomain] = useState('');
  const [govtDepartment, setGovtDepartment] = useState('');
  const [govtAuthorityId, setGovtAuthorityId] = useState('');
  const [govtDesignation, setGovtDesignation] = useState('');
  const [govtJurisdiction, setGovtJurisdiction] = useState('');
  const [officialGovtEmail, setOfficialGovtEmail] = useState('');
  const [govtOfficeAddress, setGovtOfficeAddress] = useState('');

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
      college_email: collegeEmail || email,
      company_name: companyName,
      company_registration_number: companyRegistrationNumber,
      gstin,
      cin,
      company_website: companyWebsite,
      company_address: companyAddress,
      govt_department: govtDepartment,
      govt_authority_id: govtAuthorityId,
      govt_designation: govtDesignation,
      govt_jurisdiction: govtJurisdiction,
      official_govt_email: officialGovtEmail,
      govt_office_address: govtOfficeAddress
    };

    try {
      await authApi.register(payload);
      if (role === 'tpo') {
        await tpoApi.verifyCollege({
          full_legal_name: collegeLegalName,
          institute_type: instituteType,
          district_and_state: districtAndState,
          ugc_recognition_no: ugcRecognitionNumber,
          aicte_approval_no: aicteApprovalNumber,
          affiliated_university: affiliatedUniversity,
          year_of_establishment: parseInt(establishmentYear) || 2000,
          gst_or_cin_no: collegeGstCin,
          official_email_domain: officialEmailDomain
        });
      }
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate(`/login?role=${role}`);
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
    <div className={`auth-entry-layout min-h-[85vh] px-4 py-8 ${selectedRole ? `role-selected role-${selectedRole}` : 'role-picker-only'}`}>
      {!selectedRole && <div className="login-character-panel">
        <p className="game-font text-[9px] text-sky-400 tracking-widest">CHOOSE YOUR PORTAL</p>
        <h2 className="game-heading mt-3 text-3xl font-bold text-white">Select your champion</h2>
        <p className="mt-2 text-sm text-slate-400">Pick a role to create its account.</p>
        <div className="login-character-grid">
          <Link to="/register?role=student" className="login-character-card login-character-student"><div className="login-mini-character"><span className="login-mini-head" /><span className="login-mini-body" /><span className="login-mini-prop">L</span></div><strong>Chhatra</strong><small>Student</small></Link>
          <Link to="/register?role=teacher" className="login-character-card login-character-teacher"><div className="login-mini-character"><span className="login-mini-head" /><span className="login-mini-body" /><span className="login-mini-prop">ID</span></div><strong>Guru</strong><small>Teacher</small></Link>
          <Link to="/register?role=recruiter" className="login-character-card login-character-recruiter"><div className="login-mini-character"><span className="login-mini-head" /><span className="login-mini-body" /><span className="login-mini-prop">B</span></div><strong>Karyah</strong><small>Recruiter</small></Link>
          <Link to="/register?role=tpo" className="login-character-card login-character-gurukul"><div className="login-mini-character"><span className="login-mini-head" /><span className="login-mini-body" /><span className="login-mini-prop">P</span></div><strong>Gurukul</strong><small>TPO</small></Link>
          <Link to="/register?role=govt" className="login-character-card login-character-government"><div className="login-mini-character"><span className="login-mini-head" /><span className="login-mini-body" /><span className="login-mini-prop">R</span></div><strong>Rajya</strong><small>Government</small></Link>
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
        <div className="selected-character-caption"><span className="character-kicker">ACTIVE PORTAL CHARACTER</span><strong>{roleLabels[role]}</strong><span>{selectedRole === 'student' ? 'Laptop runner' : selectedRole === 'teacher' ? 'Faculty mentor' : selectedRole === 'recruiter' ? 'Talent hunter' : selectedRole === 'tpo' ? 'Principal · campus leader' : 'Realm overseer'}</span></div>
      </div>}
      {selectedRole && <div className="login-form-panel register-form-panel glass-card max-w-xl w-full p-8 shadow-2xl relative overflow-hidden glow-sky">
        
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="text-center flex-1 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/25">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <span className="login-selected-badge">{roleLabels[role]} PORTAL // PLAYER READY</span>
          <p className="text-sm text-slate-400">Set up your {roleLabels[role]} portal access.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white" title="Return to home">
            <Home className="h-4 w-4" /> Home
          </Link>
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
                  to={selectedRole ? `/login?role=${selectedRole}` : '/login'}
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

          {!selectedRole && <div>
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
          </div>}

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

          {role === 'recruiter' && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
              <div className="text-xs font-extrabold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-indigo-400" /> Company Verification Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Legal Company Name</label>
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Karyah Technologies Pvt. Ltd." className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">GSTIN</label>
                  <input type="text" required value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" pattern="[0-9A-Z]{15}" title="Enter a valid 15-character GSTIN" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs uppercase" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">CIN</label>
                  <input type="text" required value={cin} onChange={(e) => setCin(e.target.value.toUpperCase())} placeholder="U72900DL2020PTC000001" pattern="[A-Z0-9]{21}" title="Enter a valid 21-character CIN" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs uppercase" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company Registration Number</label>
                  <input type="text" required value={companyRegistrationNumber} onChange={(e) => setCompanyRegistrationNumber(e.target.value)} placeholder="REG-2020-000001" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company Website</label>
                  <input type="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://company.example" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Registered Company Address</label>
                  <textarea required value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Registered office address" rows="2" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs resize-none" />
                </div>
              </div>
              <div className="text-[10px] text-indigo-300 flex items-center gap-1 font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> Details are stored for recruiter verification and government review.</div>
            </div>
          )}

          {role === 'tpo' && (
            <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/30 space-y-3">
              <div className="text-xs font-extrabold text-sky-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-sky-400" /> College Accreditation Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Full Legal College Name</label>
                  <input type="text" required value={collegeLegalName} onChange={(e) => setCollegeLegalName(e.target.value)} placeholder="National Institute of Technology" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Institute Type</label>
                  <select required value={instituteType} onChange={(e) => setInstituteType(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs">
                    <option>State</option><option>Central</option><option>Private</option><option>Deemed</option><option>Open</option><option>Institute of National Importance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">District and State</label>
                  <input type="text" required value={districtAndState} onChange={(e) => setDistrictAndState(e.target.value)} placeholder="Hyderabad, Telangana" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">UGC Recognition Number</label>
                  <input type="text" value={ugcRecognitionNumber} onChange={(e) => setUgcRecognitionNumber(e.target.value)} placeholder="UGC-2f-2011" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">AICTE Approval Number</label>
                  <input type="text" value={aicteApprovalNumber} onChange={(e) => setAicteApprovalNumber(e.target.value)} placeholder="1-9319586590" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Affiliated University</label>
                  <input type="text" value={affiliatedUniversity} onChange={(e) => setAffiliatedUniversity(e.target.value)} placeholder="Jawaharlal Nehru Technological University" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Year of Establishment</label>
                  <input type="number" required min="1800" max="2026" value={establishmentYear} onChange={(e) => setEstablishmentYear(parseInt(e.target.value) || 2000)} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">GST / CIN Number</label>
                  <input type="text" value={collegeGstCin} onChange={(e) => setCollegeGstCin(e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5 / U12345..." className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs uppercase" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Official Email Domain</label>
                  <input type="text" required value={officialEmailDomain} onChange={(e) => setOfficialEmailDomain(e.target.value.toLowerCase())} placeholder="nit.edu or tpo@nit.edu" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
              </div>
              <div className="text-[10px] text-sky-300 flex items-center gap-1 font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> These nine fields are matched against UGC and AICTE accreditation records.</div>
            </div>
          )}

          {role === 'govt' && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-3">
              <div className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Government Authority Verification
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Department / Ministry</label>
                  <input type="text" required value={govtDepartment} onChange={(e) => setGovtDepartment(e.target.value)} placeholder="Department of Higher Education" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Designation</label>
                  <input type="text" required value={govtDesignation} onChange={(e) => setGovtDesignation(e.target.value)} placeholder="Accreditation Officer" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Authority / Employee ID</label>
                  <input type="text" required value={govtAuthorityId} onChange={(e) => setGovtAuthorityId(e.target.value.toUpperCase())} placeholder="GOV-EDU-2026-001" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs uppercase" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Jurisdiction</label>
                  <input type="text" required value={govtJurisdiction} onChange={(e) => setGovtJurisdiction(e.target.value)} placeholder="Telangana State" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Official Government Email</label>
                  <input type="email" required value={officialGovtEmail} onChange={(e) => setOfficialGovtEmail(e.target.value.toLowerCase())} placeholder="officer@education.gov.in" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Official Office Address</label>
                  <textarea required value={govtOfficeAddress} onChange={(e) => setGovtOfficeAddress(e.target.value)} placeholder="Department office address" rows="2" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs resize-none" />
                </div>
              </div>
              <div className="text-[10px] text-amber-300 flex items-center gap-1 font-semibold"><ShieldCheck className="w-3.5 h-3.5" /> Official authority details are stored for government access verification.</div>
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

        {!selectedRole && (
          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:underline font-bold">
              Sign In Directly
            </Link>
          </p>
        )}

      </div>}
    </div>
  );
};
