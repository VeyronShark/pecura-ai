import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { skincareAPI } from '../api/skincare.js';
import { useApp } from '../context/AppContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

/* Each question gets its own full-screen colour */
const STEP_BG = [
  'var(--c-primary)',
  'var(--c-secondary)',
  'var(--c-tertiary)',
  'var(--c-accent1)',
  'var(--c-accent2)',
];

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
  const bg = STEP_BG[current % STEP_BG.length];

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
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--c-primary)' }}>
        <LoadingSpinner size="lg" text="Loading quiz..." />
      </div>
    );
  }

  return (
    /* Full-screen split layout */
    <div className="fixed inset-0 flex" style={{ transition: 'background 0.5s ease' }}>

      {/* Left panel — colour block with question number */}
      <div className="hidden md:flex w-2/5 flex-col justify-between p-12 relative overflow-hidden noise"
        style={{ background: bg, transition: 'background 0.5s ease' }}>
        {/* Big step number watermark */}
        <div className="absolute bottom-8 right-8 text-[12rem] font-black text-white opacity-[0.07] leading-none select-none">
          {String(current + 1).padStart(2, '0')}
        </div>

        <div>
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Skin Quiz</p>
          <p className="text-white font-bold text-lg">Pecura AI</p>
        </div>

        <div>
          <p className="text-white/40 text-sm mb-2">Question {current + 1} of {questions.length}</p>
          {/* Step dots */}
          <div className="flex gap-2">
            {questions.map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{
                  height: '4px',
                  flex: i === current ? 2 : 1,
                  background: i <= current ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
                }} />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — white, question + options */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: 'var(--c-surface)' }}>

        {/* Mobile progress bar */}
        <div className="md:hidden h-1.5 w-full" style={{ background: 'var(--c-border)' }}>
          <div className="h-full transition-all duration-500"
            style={{ width: `${((current + 1) / questions.length) * 100}%`, background: bg }} />
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 md:px-14 py-12 max-w-xl">
          {q && (
            <div className="animate-fade-in" key={current}>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-6"
                style={{ background: bg }}>
                {current + 1} / {questions.length}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-snug" style={{ color: 'var(--c-text)' }}>
                {q.question}
              </h2>
              {q.hint && <p className="text-sm mb-8" style={{ color: 'var(--c-muted)' }}>{q.hint}</p>}
              {!q.hint && <div className="mb-8" />}

              <div className="space-y-3">
                {q.options.map(opt => {
                  const selected = q.type === 'multiple'
                    ? (answers[q.id] || []).includes(opt.value)
                    : answers[q.id] === opt.value;

                  return (
                    <button key={opt.value}
                      onClick={() => handleAnswer(q.id, opt.value, q.type)}
                      className="w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 flex items-center justify-between group"
                      style={{
                        background: selected ? bg : 'var(--c-surface)',
                        borderColor: selected ? bg : 'var(--c-border)',
                        color: selected ? '#fff' : 'var(--c-text)',
                      }}>
                      <div className="flex items-center gap-3">
                        {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
                        <span className="font-medium">{opt.label}</span>
                      </div>
                      {selected
                        ? <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
                        : <div className="w-5 h-5 rounded-full border-2 shrink-0" style={{ borderColor: 'var(--c-border)' }} />
                      }
                    </button>
                  );
                })}
              </div>

              {q.type === 'multiple' && (
                <p className="text-xs mt-3" style={{ color: 'var(--c-muted)' }}>Select all that apply</p>
              )}
            </div>
          )}
        </div>

        {/* Nav footer */}
        <div className="px-8 md:px-14 py-6 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--c-border)' }}>
          <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-25"
            style={{ background: 'var(--c-border)', color: 'var(--c-muted)' }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button onClick={handleNext} disabled={!canProceed() || submitting}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 hover:opacity-90 text-white"
            style={{ background: bg }}>
            {submitting
              ? <LoadingSpinner size="sm" text="" />
              : <>{current === questions.length - 1 ? 'Get My Results' : 'Next'}<ChevronRight className="w-4 h-4" /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
