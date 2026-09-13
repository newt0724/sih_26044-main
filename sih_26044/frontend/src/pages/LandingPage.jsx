import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../services/api';
import { 
  GraduationCap, 
  Briefcase, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  FileSearch,
  Search,
  Code
} from 'lucide-react';

export const LandingPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    analyticsApi.getOverview()
      .then(res => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation ML Placement Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Bridging <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Academia & Industry</span> with AI Precision
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal">
            Real ML models, automated resume anti-fraud inspection, dynamic candidate-job matching, institutional syllabus gap analysis, and placement cell analytics.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-xl font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all"
            >
              Sign In to Portal
            </Link>
          </div>

          {/* DYNAMIC BACKEND METRICS COUNTER */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-card p-4">
              <span className="block text-3xl font-extrabold text-sky-400">
                {stats ? stats.users.students : '1000+'}
              </span>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Candidates Evaluated</span>
            </div>
            <div className="glass-card p-4">
              <span className="block text-3xl font-extrabold text-indigo-400">
                {stats ? stats.platform.active_jobs : '15+'}
              </span>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Active Recruiter Jobs</span>
            </div>
            <div className="glass-card p-4">
              <span className="block text-3xl font-extrabold text-emerald-400">
                {stats ? stats.platform.shortlisted_applications : '850+'}
              </span>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Shortlisted Profiles</span>
            </div>
            <div className="glass-card p-4">
              <span className="block text-3xl font-extrabold text-amber-400">
                98.8%
              </span>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Classifier ROC-AUC</span>
            </div>
          </div>

        </div>
      </section>

      {/* ROLE PORTALS SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">4 Dynamic Platform Roles</h2>
          <p className="text-slate-400 mt-2">Empowering every stakeholder across the talent ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Student */}
          <div className="glass-card-hover p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Students & Candidates</h3>
              <p className="text-sm text-slate-400 mt-2">
                Upload resume, get instant ML candidate match score, missing skills guidance, coding assessments, and GitHub profile proof-of-work bonus.
              </p>
            </div>
            <Link to="/register?role=student" className="mt-6 text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Join as Candidate <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Teacher */}
          <div className="glass-card-hover p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Teachers & Faculty</h3>
              <p className="text-sm text-slate-400 mt-2">
                Monitor student skill benchmarks, identify batch weaknesses, and run Institutional Syllabus Gap Analysis against industry standards.
              </p>
            </div>
            <Link to="/register?role=teacher" className="mt-6 text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
              Teacher Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Recruiter */}
          <div className="glass-card-hover p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Recruiters & Companies</h3>
              <p className="text-sm text-slate-400 mt-2">
                Post jobs, automatically rank candidates by ML match score, filter verified profiles, and view anti-fraud resume audit results.
              </p>
            </div>
            <Link to="/register?role=recruiter" className="mt-6 text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Post Jobs & Hire <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* TPO */}
          <div className="glass-card-hover p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">TPO & Placement Cell</h3>
              <p className="text-sm text-slate-400 mt-2">
                Verify student registrations, view employability heatmaps, audit resume fraud risks, and export pre-screened talent lists.
              </p>
            </div>
            <Link to="/register?role=tpo" className="mt-6 text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
              TPO Analytics <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* CORE FEATURES LIST */}
      <section className="py-16 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Production Engine Features</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6">
              <Cpu className="w-8 h-8 text-sky-400 mb-4" />
              <h4 className="text-lg font-bold text-white">Gradient Boosting ML Pipeline</h4>
              <p className="text-sm text-slate-400 mt-2">
                Trained Gradient Boosting Regressor (0–100 score) & Gradient Boosting Classifier (95% Accuracy, 0.988 AUC) built from candidate datasets.
              </p>
            </div>

            <div className="glass-card p-6">
              <FileSearch className="w-8 h-8 text-indigo-400 mb-4" />
              <h4 className="text-lg font-bold text-white">pdfplumber + OCR Anti-Fraud</h4>
              <p className="text-sm text-slate-400 mt-2">
                Detects hidden white-text keyword stuffing, tiny fonts (&lt;3.0pt), scanned image fallback via Tesseract OCR, and regex candidate identity verification.
              </p>
            </div>

            <div className="glass-card p-6">
              <Code className="w-8 h-8 text-emerald-400 mb-4" />
              <h4 className="text-lg font-bold text-white">GitHub API Proof-of-Work</h4>
              <p className="text-sm text-slate-400 mt-2">
                Queries official GitHub REST API to verify public repos, star count, and programming language tech stack for genuine candidate validation.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
