import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../services/api';
import { CollegeGate } from '../components/CollegeGate';
import { 
  GraduationCap, 
  Briefcase, 
  BookOpen, 
  ShieldCheck, 
  Landmark,
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
      <CollegeGate />
      
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5" /> ACADEMIA QUEST // CAREER REALM
          </div>

          <h1 className="game-heading text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Choose your <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">career champion</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal">
            Five playable roles. One connected world. Use real AI placement tools to level up learners, mentors, employers, placement cells, and public institutions.
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
          <p className="game-font text-[10px] text-sky-400 tracking-widest">SELECT YOUR CHARACTER</p>
          <h2 className="game-heading mt-4 text-3xl font-bold text-white">Five paths. Infinite progression.</h2>
          <p className="text-slate-400 mt-3">Every character unlocks a different command center in the Academia Quest.</p>
        </div>

        <div className="character-roster">
          <Link to="/register?role=student" className="character-scene character-scene-student">
            <div className="scene-platform" /><div className="anime-character"><div className="anime-hair" /><div className="anime-head" /><div className="anime-body" /><div className="anime-arm anime-arm-left" /><div className="anime-arm anime-arm-right" /><div className="anime-leg anime-leg-left" /><div className="anime-leg anime-leg-right" /><div className="anime-prop laptop-prop" /></div>
            <div className="scene-label"><span className="character-kicker">STUDENT // ANIME HERO</span><strong>Chhatra</strong><span>Laptop runner</span></div>
          </Link>

          <Link to="/register?role=teacher" className="character-scene character-scene-teacher">
            <div className="scene-platform" /><div className="anime-character"><div className="anime-hair" /><div className="anime-head" /><div className="anime-body" /><div className="anime-arm anime-arm-left" /><div className="anime-arm anime-arm-right" /><div className="anime-leg anime-leg-left" /><div className="anime-leg anime-leg-right" /><div className="anime-prop id-card-prop">ID</div></div>
            <div className="scene-label"><span className="character-kicker">TEACHER // ANIME HERO</span><strong>Guru</strong><span>Faculty mentor</span></div>
          </Link>

          <Link to="/register?role=recruiter" className="character-scene character-scene-recruiter">
            <div className="scene-platform" /><div className="anime-character"><div className="anime-hair" /><div className="anime-head" /><div className="anime-body" /><div className="anime-arm anime-arm-left" /><div className="anime-arm anime-arm-right" /><div className="anime-leg anime-leg-left" /><div className="anime-leg anime-leg-right" /><div className="anime-prop briefcase-prop" /></div>
            <div className="scene-label"><span className="character-kicker">RECRUITER // ANIME HERO</span><strong>Karyah</strong><span>Talent hunter</span></div>
          </Link>

          <Link to="/register?role=tpo" className="character-scene character-scene-gurukul">
            <div className="scene-room"><div className="scene-table" /><div className="scene-lamp" /></div><div className="anime-character anime-character-principal"><div className="anime-hair" /><div className="anime-head" /><div className="anime-body" /><div className="anime-arm anime-arm-left" /><div className="anime-arm anime-arm-right" /><div className="anime-leg anime-leg-left" /><div className="anime-leg anime-leg-right" /><div className="anime-prop principal-badge">P</div></div>
            <div className="scene-label"><span className="character-kicker">TPO // GURUKUL</span><strong>Gurukul</strong><span>Principal · campus leader</span></div>
          </Link>

          <Link to="/register?role=govt" className="character-scene character-scene-government">
            <div className="scene-platform" /><div className="anime-character"><div className="anime-hair" /><div className="anime-head" /><div className="anime-body" /><div className="anime-arm anime-arm-left" /><div className="anime-arm anime-arm-right" /><div className="anime-leg anime-leg-left" /><div className="anime-leg anime-leg-right" /><div className="anime-prop tablet-prop" /></div>
            <div className="scene-label"><span className="character-kicker">GOVERNMENT // ANIME HERO</span><strong>Rajya</strong><span>Realm overseer</span></div>
          </Link>
        </div>
      </section>

      {/* PRODUCTION QUEST BOARD */}
      <section className="quest-board-section py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="game-font text-[10px] text-emerald-400 tracking-widest">LIVE SYSTEMS // XP BOARD</p>
              <h2 className="game-heading mt-4 text-3xl font-bold text-white">Production quest board</h2>
              <p className="mt-3 max-w-2xl text-slate-400">Unlock the systems powering every character portal. Three core quests are online and ready for deployment.</p>
            </div>
            <div className="quest-rank"><span className="quest-rank-label">REALM STATUS</span><strong>ONLINE</strong><span className="quest-online-dot" /></div>
          </div>

          <div className="quest-grid">
            <div className="quest-card quest-card-sky">
              <div className="quest-card-top"><span className="quest-number">01</span><span className="quest-state">ACTIVE QUEST</span></div>
              <div className="quest-icon"><Cpu className="w-7 h-7" /></div>
              <h4 className="game-heading mt-5 text-xl font-bold text-white">AI Score Forge</h4>
              <p className="text-sm text-slate-400 mt-2">
                Trained Gradient Boosting Regressor (0–100 score) & Gradient Boosting Classifier (95% Accuracy, 0.988 AUC) built from candidate datasets.
              </p>
              <div className="quest-meta"><span>REWARD <b>+500 XP</b></span><span>LVL 04</span></div><div className="quest-progress"><span style={{ width: '88%' }} /></div>
            </div>

            <div className="quest-card quest-card-indigo">
              <div className="quest-card-top"><span className="quest-number">02</span><span className="quest-state">GUARDIAN MODE</span></div>
              <div className="quest-icon"><FileSearch className="w-7 h-7" /></div>
              <h4 className="game-heading mt-5 text-xl font-bold text-white">Resume Shield</h4>
              <p className="text-sm text-slate-400 mt-2">
                Detects hidden white-text keyword stuffing, tiny fonts (&lt;3.0pt), scanned image fallback via Tesseract OCR, and regex candidate identity verification.
              </p>
              <div className="quest-meta"><span>REWARD <b>+350 XP</b></span><span>LVL 03</span></div><div className="quest-progress"><span style={{ width: '76%' }} /></div>
            </div>

            <div className="quest-card quest-card-emerald">
              <div className="quest-card-top"><span className="quest-number">03</span><span className="quest-state">VERIFIED RUN</span></div>
              <div className="quest-icon"><Code className="w-7 h-7" /></div>
              <h4 className="game-heading mt-5 text-xl font-bold text-white">GitHub Relic Hunt</h4>
              <p className="text-sm text-slate-400 mt-2">
                Queries official GitHub REST API to verify public repos, star count, and programming language tech stack for genuine candidate validation.
              </p>
              <div className="quest-meta"><span>REWARD <b>+250 XP</b></span><span>LVL 02</span></div><div className="quest-progress"><span style={{ width: '64%' }} /></div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
