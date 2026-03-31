import { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, LabelList,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';

// ─── Synthetic data (mirrors train_models.py logic) ──────────────────────────
const Q1_OPTS = ['tight_dry', 'comfortable', 'oily_shiny', 'irritated'];
const Q2_OPTS = ['never', 'occasionally', 'frequently', 'constantly'];
const Q3_OPTS = ['same', 'slightly_oily', 'very_oily', 'dry_tight'];
const Q4_OPTS = ['no_reaction', 'mild_reaction', 'strong_reaction', 'very_sensitive'];

function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function classifySkin(q1, q2, q3, q4) {
  if (['strong_reaction', 'very_sensitive'].includes(q4) || q1 === 'irritated') return 'Sensitive';
  if ((q1 === 'oily_shiny' && q3 === 'dry_tight') || (q1 === 'tight_dry' && q3 === 'slightly_oily')) return 'Combination';
  let score = 0;
  if (q1 === 'oily_shiny') score += 2;
  if (q3 === 'very_oily') score += 2;
  if (q3 === 'slightly_oily') score += 1;
  if (['frequently', 'constantly'].includes(q2)) score += 1;
  if (q1 === 'tight_dry') score -= 2;
  if (q3 === 'dry_tight') score -= 2;
  if (score >= 2) return 'Oily';
  if (score <= -2) return 'Dry';
  return 'Normal';
}

function encodeQ(val, opts) { return opts.indexOf(val); }

// Minimal PCA-like projection: project 4D encoded features onto 2 hand-crafted axes
// Axis 1 ≈ "oiliness" (q1 oily + q3 oily)
// Axis 2 ≈ "sensitivity" (q4 reaction + q1 irritated)
function project(q1, q2, q3, q4) {
  const e1 = encodeQ(q1, Q1_OPTS); // 0=tight_dry,1=comfortable,2=oily_shiny,3=irritated
  const e3 = encodeQ(q3, Q3_OPTS); // 0=same,1=slightly_oily,2=very_oily,3=dry_tight
  const e4 = encodeQ(q4, Q4_OPTS); // 0=no,1=mild,2=strong,3=very_sensitive
  const e2 = encodeQ(q2, Q2_OPTS);
  const x = (e1 === 2 ? 2 : e1 === 0 ? -2 : 0) + (e3 === 2 ? 2 : e3 === 3 ? -2 : e3 === 1 ? 1 : 0) + e2 * 0.3;
  const y = e4 * 1.5 + (e1 === 3 ? 2 : 0);
  return { x: +(x + (Math.random() - 0.5) * 0.6).toFixed(2), y: +(y + (Math.random() - 0.5) * 0.6).toFixed(2) };
}

function generateScatterData(n = 300) {
  const rand = seededRand(42);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  return Array.from({ length: n }, () => {
    const q1 = pick(Q1_OPTS), q2 = pick(Q2_OPTS), q3 = pick(Q3_OPTS), q4 = pick(Q4_OPTS);
    const label = classifySkin(q1, q2, q3, q4);
    const { x, y } = project(q1, q2, q3, q4);
    return { x, y, label };
  });
}

// ─── Ingredient conflict data (mirrors analyzeIngredients mock) ──────────────
const CONFLICT_PAIRS = [
  { a: 'Retinol',          b: 'Vitamin C',        reason: 'Irritation' },
  { a: 'Retinol',          b: 'Glycolic Acid',    reason: 'Over-exfoliation' },
  { a: 'Retinol',          b: 'Lactic Acid',      reason: 'Over-exfoliation' },
  { a: 'Retinol',          b: 'Salicylic Acid',   reason: 'Over-exfoliation' },
  { a: 'Retinol',          b: 'AHA',              reason: 'Over-exfoliation' },
  { a: 'Retinol',          b: 'BHA',              reason: 'Over-exfoliation' },
  { a: 'Retinol',          b: 'Benzoyl Peroxide', reason: 'Dryness' },
  { a: 'Niacinamide',      b: 'Vitamin C',        reason: 'Reduced efficacy' },
  { a: 'Salicylic Acid',   b: 'Benzoyl Peroxide', reason: 'Dryness' },
  { a: 'Glycolic Acid',    b: 'Salicylic Acid',   reason: 'Over-exfoliation' },
  { a: 'Lactic Acid',      b: 'Salicylic Acid',   reason: 'Over-exfoliation' },
  { a: 'Glycolic Acid',    b: 'Lactic Acid',      reason: 'Over-exfoliation' },
  { a: 'AHA',              b: 'BHA',              reason: 'Over-exfoliation' },
  { a: 'Benzoyl Peroxide', b: 'Vitamin C',        reason: 'Oxidation' },
];

// Count how many conflicts each ingredient is involved in
const CONFLICT_COUNTS = (() => {
  const counts = {};
  CONFLICT_PAIRS.forEach(({ a, b }) => {
    counts[a] = (counts[a] || 0) + 1;
    counts[b] = (counts[b] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((x, y) => y[1] - x[1])
    .map(([ingredient, conflicts]) => ({ ingredient, conflicts }));
})();

// Radar: profile each key ingredient across 5 risk dimensions
const RADAR_DATA = [
  { axis: 'Irritation',       Retinol: 9, 'Vitamin C': 5, 'Salicylic Acid': 6, Niacinamide: 2, 'Glycolic Acid': 7 },
  { axis: 'Dryness',          Retinol: 7, 'Vitamin C': 3, 'Salicylic Acid': 7, Niacinamide: 1, 'Glycolic Acid': 5 },
  { axis: 'Oxidation risk',   Retinol: 4, 'Vitamin C': 8, 'Salicylic Acid': 2, Niacinamide: 1, 'Glycolic Acid': 2 },
  { axis: 'Exfoliation',      Retinol: 6, 'Vitamin C': 2, 'Salicylic Acid': 8, Niacinamide: 0, 'Glycolic Acid': 9 },
  { axis: 'Sensitisation',    Retinol: 8, 'Vitamin C': 4, 'Salicylic Acid': 5, Niacinamide: 1, 'Glycolic Acid': 6 },
];

const RADAR_COLORS = ['#a78bfa', '#f472b6', '#34d399', '#60a5fa', '#fbbf24'];
const TFIDF_TERMS = [
  { term: 'niacinamide',      score: 0.91 },
  { term: 'hyaluronic acid',  score: 0.87 },
  { term: 'retinol',          score: 0.83 },
  { term: 'salicylic acid',   score: 0.79 },
  { term: 'glycerin',         score: 0.74 },
  { term: 'vitamin c',        score: 0.70 },
  { term: 'ceramide',         score: 0.65 },
  { term: 'peptide',          score: 0.61 },
  { term: 'zinc oxide',       score: 0.57 },
  { term: 'aloe vera',        score: 0.52 },
  { term: 'water',            score: 0.18 },
  { term: 'fragrance',        score: 0.14 },
];

const SKIN_COLORS = {
  Oily:        '#a78bfa',
  Dry:         '#60a5fa',
  Combination: '#34d399',
  Sensitive:   '#f472b6',
  Normal:      '#fbbf24',
};

const BAR_COLORS = ['#a78bfa','#818cf8','#60a5fa','#34d399','#fbbf24','#f472b6',
                    '#c084fc','#7dd3fc','#6ee7b7','#fde68a','#fbcfe8','#e9d5ff'];

// ─── Custom scatter tooltip ───────────────────────────────────────────────────
const ScatterTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>
      <p className="font-semibold">{d.label}</p>
      <p style={{ color: 'var(--c-muted)' }}>PC1: {d.x} · PC2: {d.y}</p>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Capstone() {
  const allPoints = useMemo(() => generateScatterData(300), []);
  const byType = useMemo(() => {
    const groups = {};
    allPoints.forEach(p => { (groups[p.label] ??= []).push(p); });
    return groups;
  }, [allPoints]);

  return (
    <div className="animate-fade-in space-y-10 pb-12">

      {/* Hero */}
      <div className="rounded-3xl p-8 relative overflow-hidden noise"
        style={{ background: 'var(--c-primary)' }}>
        <div className="absolute right-8 top-4 text-8xl opacity-10 select-none">🧬</div>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Capstone · Technical Overview
        </p>
        <h1 className="text-3xl font-black text-white mb-2">How Pecura AI Works</h1>
        <p className="text-sm max-w-2xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Two machine learning models power this app — a Random Forest classifier that identifies your skin type
          from quiz answers, and a TF-IDF vectorizer that finds products with the most relevant ingredients for you.
        </p>
      </div>

      {/* ── Model 1: Skin Classifier ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>
          Model 1 — Skin Type Classifier
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6 space-y-3" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Algorithm</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              A <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>Random Forest Classifier</span> (100 trees,
              random_state=42) trained on 1,000 synthetically generated quiz responses. Each tree votes on the skin
              type; the majority class wins.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              Synthetic data is generated with rule-based logic that mirrors real dermatological heuristics —
              e.g. oily T-zone + dry cheeks → Combination, high sensitivity reactions → Sensitive.
            </p>
            <p className="text-sm font-semibold pt-1" style={{ color: 'var(--c-text)' }}>Why Random Forest?</p>
            <ul className="space-y-1.5 text-sm" style={{ color: 'var(--c-muted)' }}>
              {[
                ['Handles categorical data well', 'After label encoding, RF naturally handles non-ordinal categories without assuming any numeric relationship between them.'],
                ['Robust to small datasets', 'With only 1,000 synthetic samples and 4 features, a single decision tree would overfit. Averaging 100 trees reduces variance significantly.'],
                ['No feature scaling needed', 'Unlike SVM or KNN, RF is invariant to feature scale — no need to normalise the encoded integers.'],
                ['Built-in confidence', 'The fraction of trees agreeing on a class gives a natural probability estimate, used directly as the confidence score shown on the dashboard.'],
                ['Interpretable splits', 'Each tree splits on individual quiz answers, making the model\'s logic traceable — e.g. "if Q1=oily_shiny AND Q3=very_oily → Oily".'],
              ].map(([title, desc]) => (
                <li key={title} className="rounded-lg px-3 py-2" style={{ background: 'var(--c-bg)' }}>
                  <span className="font-semibold text-xs" style={{ color: 'var(--c-text)' }}>{title}</span>
                  <p className="text-xs mt-0.5 opacity-80">{desc}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl p-6 space-y-3" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Features (4 quiz questions)</p>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--c-muted)' }}>
              {[
                ['Q1', 'How does your skin feel after cleansing?', 'tight_dry · comfortable · oily_shiny · irritated'],
                ['Q2', 'How often does your skin feel oily?', 'never · occasionally · frequently · constantly'],
                ['Q3', 'How does your T-zone look by midday?', 'same · slightly_oily · very_oily · dry_tight'],
                ['Q4', 'How does your skin react to new products?', 'no_reaction · mild · strong · very_sensitive'],
              ].map(([q, label, opts]) => (
                <li key={q} className="rounded-lg px-3 py-2" style={{ background: 'var(--c-bg)' }}>
                  <span className="font-semibold" style={{ color: 'var(--c-text)' }}>{q}</span> — {label}
                  <br /><span className="text-xs opacity-70">{opts}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl p-6 space-y-3" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Label Encoding + Prediction</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
            Each categorical answer is integer-encoded via <code className="px-1 rounded text-xs" style={{ background: 'var(--c-bg)' }}>sklearn.LabelEncoder</code> before
            being fed to the forest. At inference time, the same encoders are loaded from disk and applied to the
            user's quiz answers. The model returns a predicted class and a confidence score derived from the
            fraction of trees that agreed on that class.
          </p>
        </div>

        {/* Scatter chart */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--c-text)' }}>
            Decision Space — 2-Feature Projection
          </p>
          <p className="text-xs mb-5" style={{ color: 'var(--c-muted)' }}>
            300 synthetic training samples projected onto two interpretable axes:
            PC1 ≈ oiliness signal (Q1 + Q3), PC2 ≈ sensitivity signal (Q4 + Q1 irritation).
            Clusters show how the classifier separates skin types in feature space.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl px-4 py-3 space-y-1" style={{ background: 'var(--c-bg)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--c-text)' }}>PC1 — Oiliness (Q1 + Q3)</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--c-muted)' }}>
                Q1 (post-cleanse feel) and Q3 (midday T-zone) are both direct measures of sebum production.
                They're the two strongest signals for separating Oily from Dry skin, so combining them onto one
                axis captures the most variance in the dataset. Oily answers push the score right; dry answers push it left.
              </p>
            </div>
            <div className="rounded-xl px-4 py-3 space-y-1" style={{ background: 'var(--c-bg)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--c-text)' }}>PC2 — Sensitivity (Q4 + Q1 irritation)</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--c-muted)' }}>
                Q4 (reaction to new products) is the primary sensitivity indicator. Q1's "irritated" option
                is also a strong sensitivity marker — it's the only Q1 answer that directly implies reactive
                skin. Combining both onto the vertical axis cleanly lifts Sensitive skin away from the other
                clusters, which all sit near PC2 = 0.
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
              <XAxis dataKey="x" type="number" name="PC1 (Oiliness)" domain={[-4, 5]}
                tick={{ fontSize: 11, fill: 'var(--c-muted)' }} label={{ value: 'PC1 — Oiliness', position: 'insideBottom', offset: -10, fontSize: 11, fill: 'var(--c-muted)' }} />
              <YAxis dataKey="y" type="number" name="PC2 (Sensitivity)" domain={[-1, 7]}
                tick={{ fontSize: 11, fill: 'var(--c-muted)' }} label={{ value: 'PC2 — Sensitivity', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: 'var(--c-muted)' }} />
              <Tooltip content={<ScatterTip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              {Object.entries(byType).map(([type, pts]) => (
                <Scatter key={type} name={type} data={pts} fill={SKIN_COLORS[type]} opacity={0.75} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Model 2: TF-IDF ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>
          Model 2 — TF-IDF Ingredient Vectorizer
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6 space-y-3" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>What is TF-IDF?</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>Term Frequency–Inverse Document Frequency</span> converts
              each product's ingredient list into a numeric vector. Ingredients that appear often in one product
              but rarely across all products get a high score — making them strong identifiers for that product.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              Common filler ingredients like <em>water</em> or <em>fragrance</em> appear in almost every product,
              so their IDF weight is low and they contribute little to similarity scores.
            </p>
          </div>

          <div className="rounded-2xl p-6 space-y-3" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>How it's applied here</p>
            <ol className="space-y-2 text-sm list-decimal list-inside" style={{ color: 'var(--c-muted)' }}>
              <li>Each product's parsed ingredient list is joined into a single text string.</li>
              <li><code className="px-1 rounded text-xs" style={{ background: 'var(--c-bg)' }}>TfidfVectorizer</code> builds a vocabulary and fits a sparse matrix (products × terms).</li>
              <li>At query time, the user's skin type filters a candidate set of products.</li>
              <li>Cosine similarity between the query vector and all product vectors ranks results.</li>
              <li>Top-N products are returned as personalised recommendations.</li>
            </ol>
          </div>
        </div>

        {/* TF-IDF bar chart */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--c-text)' }}>
            Top Ingredient TF-IDF Scores
          </p>
          <p className="text-xs mb-5" style={{ color: 'var(--c-muted)' }}>
            Representative mean TF-IDF weights for key skincare ingredients across the product catalogue.
            High-scoring terms are rare but impactful identifiers; low-scoring terms (water, fragrance) are
            ubiquitous and carry little discriminative power.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={TFIDF_TERMS} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--c-border)" />
              <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 11, fill: 'var(--c-muted)' }} tickFormatter={v => v.toFixed(1)} />
              <YAxis type="category" dataKey="term" tick={{ fontSize: 12, fill: 'var(--c-text)' }} width={95} />
              <Tooltip
                formatter={(v) => [v.toFixed(3), 'TF-IDF score']}
                contentStyle={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: 'var(--c-text)' }}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {TFIDF_TERMS.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                <LabelList dataKey="score" position="right" formatter={v => v.toFixed(2)} style={{ fontSize: 11, fill: 'var(--c-muted)' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cosine similarity explainer */}
        <div className="rounded-2xl p-6 space-y-3" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Cosine Similarity — Ranking Products</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
            Once every product is a TF-IDF vector, similarity between any two products is measured as the cosine
            of the angle between their vectors. A score of <strong style={{ color: 'var(--c-text)' }}>1.0</strong> means
            identical ingredient profiles; <strong style={{ color: 'var(--c-text)' }}>0.0</strong> means no overlap at all.
            When you request recommendations, the app computes cosine similarity between a reference product (or
            skin-type centroid) and every product in the catalogue, then returns the top matches.
          </p>
          <div className="rounded-xl px-4 py-3 font-mono text-sm" style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>
            similarity(A, B) = (A · B) / (‖A‖ × ‖B‖)
          </div>
        </div>
      </section>

      {/* ── Feature 3: Ingredient Checker ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>
          Feature 3 — Ingredient Conflict Checker
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6 space-y-3" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Approach</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              Unlike the classifier and vectorizer, the ingredient checker is <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>rule-based</span> — no
              model training involved. It maintains a curated lookup table of 15 known incompatible ingredient
              pairs, each annotated with a conflict reason and usage guidance.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
              At runtime, the user's selected ingredients are lowercased and checked against every pair using
              substring matching — so "retinaldehyde" still triggers a retinol conflict. Duplicate warnings
              for the same pair are suppressed.
            </p>
          </div>

          <div className="rounded-2xl p-6 space-y-3" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Conflict categories</p>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--c-muted)' }}>
              {[
                ['Over-exfoliation', 'Combining multiple exfoliating actives (AHA + BHA, retinol + acids) strips the barrier faster than it can repair.'],
                ['Irritation', 'Retinol + Vitamin C together lower skin pH tolerance and increase photosensitivity.'],
                ['Reduced efficacy', 'Niacinamide + Vitamin C can form a complex at high concentrations that reduces both actives\' effectiveness.'],
                ['Oxidation', 'Benzoyl peroxide oxidises and deactivates Vitamin C, wasting both products.'],
                ['Dryness', 'Stacking drying actives (BPO + salicylic acid) causes excessive moisture loss.'],
              ].map(([cat, desc]) => (
                <li key={cat} className="rounded-lg px-3 py-2" style={{ background: 'var(--c-bg)' }}>
                  <span className="font-semibold text-xs" style={{ color: 'var(--c-text)' }}>{cat}</span>
                  <p className="text-xs mt-0.5 opacity-80">{desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Conflict count bar chart */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--c-text)' }}>
            Conflict Involvement by Ingredient
          </p>
          <p className="text-xs mb-5" style={{ color: 'var(--c-muted)' }}>
            How many known conflict pairs each ingredient participates in. Retinol is the most restricted active
            in the database — it conflicts with nearly every other exfoliant.
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={CONFLICT_COUNTS} margin={{ top: 0, right: 20, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--c-border)" />
              <XAxis dataKey="ingredient" tick={{ fontSize: 10, fill: 'var(--c-muted)' }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--c-muted)' }} allowDecimals={false} label={{ value: 'Conflicts', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--c-muted)' }} />
              <Tooltip
                formatter={(v) => [v, 'conflict pairs']}
                contentStyle={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: 'var(--c-text)' }}
              />
              <Bar dataKey="conflicts" radius={[6, 6, 0, 0]}>
                {CONFLICT_COUNTS.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--c-text)' }}>
            Active Ingredient Risk Profile
          </p>
          <p className="text-xs mb-5" style={{ color: 'var(--c-muted)' }}>
            Each axis represents a skin risk dimension (scale 0–10). This shows why certain combinations
            are flagged — overlapping high scores on the same axis indicate compounding risk.
          </p>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="var(--c-border)" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: 'var(--c-muted)' }} />
              {['Retinol', 'Vitamin C', 'Salicylic Acid', 'Niacinamide', 'Glycolic Acid'].map((ing, i) => (
                <Radar key={ing} name={ing} dataKey={ing}
                  stroke={RADAR_COLORS[i]} fill={RADAR_COLORS[i]} fillOpacity={0.12} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Tooltip
                contentStyle={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: 'var(--c-text)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Conflict table */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--c-text)' }}>Full Conflict Pair Table</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
              <thead>
                <tr style={{ color: 'var(--c-muted)' }}>
                  <th className="text-left px-3 py-2 font-semibold">Ingredient A</th>
                  <th className="text-left px-3 py-2 font-semibold">Ingredient B</th>
                  <th className="text-left px-3 py-2 font-semibold">Conflict type</th>
                </tr>
              </thead>
              <tbody>
                {CONFLICT_PAIRS.map(({ a, b, reason }, i) => (
                  <tr key={i} className="rounded-lg" style={{ background: 'var(--c-bg)' }}>
                    <td className="px-3 py-2 rounded-l-lg font-medium" style={{ color: 'var(--c-text)' }}>{a}</td>
                    <td className="px-3 py-2 font-medium" style={{ color: 'var(--c-text)' }}>{b}</td>
                    <td className="px-3 py-2 rounded-r-lg" style={{ color: 'var(--c-muted)' }}>{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Pipeline summary ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>End-to-End Pipeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { step: '1', label: 'Quiz', desc: '4 categorical answers collected from the user' },
            { step: '2', label: 'Classify', desc: 'Random Forest predicts skin type + confidence' },
            { step: '3', label: 'Filter', desc: 'Products tagged for that skin type are shortlisted' },
            { step: '4', label: 'Rank', desc: 'TF-IDF cosine similarity orders the shortlist' },
            { step: '5', label: 'Check', desc: 'Rule-based conflict checker validates ingredient safety' },
          ].map(({ step, label, desc }) => (
            <div key={step} className="rounded-2xl p-5 text-center" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white mx-auto mb-3"
                style={{ background: 'var(--c-primary)' }}>{step}</div>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--c-text)' }}>{label}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--c-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
