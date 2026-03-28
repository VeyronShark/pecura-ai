import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { skincareAPI } from '../api/skincare.js';
import { useApp } from '../context/AppContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const Quiz = () => {
  const navigate = useNavigate();
  const { setSkinProfile } = useApp();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    skincareAPI.getQuizQuestions().then(q => { setQuestions(q); setLoading(false); });
  }, []);

  const q = questions[current];
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;

  const handleAnswer = (qId, value, type) => {
    if (type === 'multiple') {
      const prev = answers[qId] || [];
      const next = prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value];
      setAnswers(a => ({ ...a, [qId]: next }));
    } else {
      setAnswers(a => ({ ...a, [qId]: value }));
    }
  };

  const canProceed = () => {
    if (!q) return false;
    const ans = answers[q.id];
    return q.type === 'multiple' ? ans?.length > 0 : ans !== undefined;
  };

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(c => c + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await skincareAPI.predictSkinType(answers);
      const profile = { ...result, concerns: answers.q5 || [], answeredAt: new Date().toISOString() };
      setSkinProfile(profile);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--c-primary)' }}>
        <LoadingSpinner size="lg" text="Loading quiz..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--c-primary)' }}>
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            <Sparkles className="w-3.5 h-3.5" /> Skin Type Quiz
          </div>
          <h1 className="text-2xl font-bold text-white">Discover your skin type</h1>
          <p className="text-white/60 text-sm mt-1">Answer honestly for the most accurate results</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-white/60 mb-1.5">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'var(--c-accent1)' }} />
          </div>
          <div className="flex justify-between mt-2">
            {questions.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i < current ? 'var(--c-accent1)' : i === current ? '#fff' : 'rgba(255,255,255,0.25)',
                  transform: i === current ? 'scale(1.3)' : 'scale(1)',
                }} />
            ))}
          </div>
        </div>

        {/* Question card */}
        {q && (
          <div className="rounded-2xl p-6 mb-6 animate-fade-in" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <h2 className="text-xl font-bold text-white mb-1">{q.question}</h2>
            {q.hint && <p className="text-sm text-white/60 mb-5">{q.hint}</p>}

            <div className="space-y-2.5">
              {q.options.map(opt => {
                const selected = q.type === 'multiple'
                  ? (answers[q.id] || []).includes(opt.value)
                  : answers[q.id] === opt.value;

                return (
                  <button key={opt.value}
                    onClick={() => handleAnswer(q.id, opt.value, q.type)}
                    className="w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-150 flex items-center justify-between"
                    style={{
                      background: selected ? 'var(--c-accent1)' : 'rgba(255,255,255,0.08)',
                      borderColor: selected ? 'var(--c-accent1)' : 'rgba(255,255,255,0.2)',
                      color: selected ? 'var(--c-accent1-fg)' : '#fff',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
                      <span className="font-medium text-sm">{opt.label}</span>
                    </div>
                    {selected && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {q.type === 'multiple' && <p className="text-xs text-white/50 mt-3">Select all that apply</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30"
            style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)' }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button onClick={handleNext} disabled={!canProceed() || submitting}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-40"
            style={{ background: 'var(--c-accent1)', color: 'var(--c-accent1-fg)' }}>
            {submitting ? <LoadingSpinner size="sm" text="" /> : (
              <>{current === questions.length - 1 ? 'Get My Results' : 'Next'}<ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
