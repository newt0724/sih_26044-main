import React, { useState, useEffect } from 'react';
import { assessmentApi } from '../services/api';
import { Code, CheckCircle2, XCircle, Award, Send } from 'lucide-react';

export const CodingAssessmentPage = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assessmentApi.getQuestions()
      .then((res) => setQuestions(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await assessmentApi.submitAnswers(answers);
      setResult(res.data);
    } catch (err) {
      alert('Failed to submit assessment answers.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Code className="w-6 h-6 text-indigo-400" /> Interactive Coding Assessment
          </h1>
          <p className="text-slate-400 text-sm mt-1">10 Skill-Matched Questions. Correct answers add bonus score to your candidate match score.</p>
        </div>

        {result && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm">
            Score: {result.score_percentage}% ({result.correct_count}/{result.total_questions} Correct)
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading coding questions bank...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => {
            const resItem = result?.breakdown?.find((b) => strEqual(b.question_id, q.id));

            return (
              <div key={q.id} className="glass-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                    Q{idx + 1}. {q.topic}
                  </span>
                  
                  {resItem && (
                    <span className={`text-xs font-extrabold flex items-center gap-1 ${
                      resItem.is_correct ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {resItem.is_correct ? <><CheckCircle2 className="w-4 h-4" /> Correct (+1 Mark)</> : <><XCircle className="w-4 h-4" /> Expected: '{resItem.expected}'</>}
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-white">{q.question}</p>

                {q.code_snippet && (
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-xs overflow-x-auto">
                    <code>{q.code_snippet}</code>
                  </pre>
                )}

                <div className="pt-2">
                  <input
                    type="text"
                    required
                    value={answers[q.id] || ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                    placeholder="Fill missing code blank..."
                    className="w-full sm:w-80 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            );
          })}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-400 hover:to-sky-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {submitting ? 'Evaluating Assessment...' : <><Send className="w-5 h-5" /> Submit Coding Assessment</>}
          </button>
        </form>
      )}

    </div>
  );
};

function strEqual(a, b) {
  return String(a) === String(b);
}
