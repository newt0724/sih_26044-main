import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, DoorOpen, GraduationCap, KeyRound, LockKeyhole, LogIn, UserPlus } from 'lucide-react';

const books = [
  { title: 'ML', color: 'bg-emerald-400', style: { left: '8%', top: '22%', animationDelay: '0s' } },
  { title: 'AI', color: 'bg-sky-400', style: { left: '82%', top: '18%', animationDelay: '1.2s' } },
  { title: 'SQL', color: 'bg-amber-400', style: { left: '17%', top: '65%', animationDelay: '2.4s' } },
  { title: 'UX', color: 'bg-rose-400', style: { left: '76%', top: '70%', animationDelay: '0.8s' } },
  { title: 'CV', color: 'bg-indigo-400', style: { left: '50%', top: '12%', animationDelay: '1.8s' } },
  { title: 'CODE', color: 'bg-violet-400', style: { left: '91%', top: '48%', animationDelay: '3s' } },
];

export const CollegeGate = ({ compact = false }) => {
  const [inside, setInside] = useState(false);

  return (
    <section className={`college-gate ${inside ? 'college-gate-inside' : ''} ${compact ? 'college-gate-compact' : ''}`}>
      <div className="college-gate-sky" />
      <div className="college-gate-grid" />
      {books.map((book) => (
        <div key={book.title} className={`college-book ${book.color}`} style={book.style}>
          <BookOpen className="h-3 w-3" /> {book.title}
        </div>
      ))}

      {!inside ? (
        <div className="college-building" aria-label="Academia Industry college building">
          <div className="college-building-roof" />
          <div className="college-building-name"><GraduationCap className="h-5 w-5" /> ACADEMIA ↔ INDUSTRY HOUSE</div>
          <div className="college-building-columns">
            <span /><span /><span /><span /><span />
          </div>
          <button type="button" className="college-gate-door" onClick={() => setInside(true)}>
            <span className="college-gate-knob" />
            <DoorOpen className="h-7 w-7" />
            <strong>Open the college gate</strong>
            <small>Enter the learning commons</small>
          </button>
          <div className="college-building-steps"><i /><i /><i /></div>
        </div>
      ) : (
        <div className="college-interior" onMouseLeave={() => setInside(false)}>
          <div className="college-interior-header">
            <button type="button" onClick={() => setInside(false)} className="college-back-link">← Back to gate</button>
            <span className="college-key"><KeyRound className="h-5 w-5" /> ACCESS KEY</span>
          </div>
          <div className="college-interior-room">
            <div className="college-room-window"><span /><span /><span /><span /></div>
            <div className="college-room-sign">THE ACADEMIA ↔ INDUSTRY COMMONS</div>
            <div className="college-portals">
              <Link to="/login" className="college-portal-card college-portal-login">
                <div className="college-portal-icon"><LogIn className="h-6 w-6" /></div>
                <span className="college-portal-kicker">RETURNING MEMBER</span>
                <strong>Sign in</strong>
                <p>Unlock your personal portal and continue the journey.</p>
                <span className="college-portal-action">Use your key <ArrowRight className="h-4 w-4" /></span>
              </Link>
              <Link to="/register" className="college-portal-card college-portal-register">
                <div className="college-portal-icon"><UserPlus className="h-6 w-6" /></div>
                <span className="college-portal-kicker">NEW MEMBER</span>
                <strong>Register</strong>
                <p>Choose your role and join the academia-industry network.</p>
                <span className="college-portal-action">Create your key <ArrowRight className="h-4 w-4" /></span>
              </Link>
            </div>
            <div className="college-room-floor" />
          </div>
        </div>
      )}
    </section>
  );
};
