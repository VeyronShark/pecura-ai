import apiClient from './client.js';
import productsData from '../mock/products.json';
import skinTypesData from '../mock/skinTypes.json';
import quizData from '../mock/quizQuestions.json';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// Simple skin type logic matching the backend model's q1-q4 keys
function mockPredictSkinType(responses) {
  const { q1, q2, q3, q4 } = responses;
  let scores = { Dry: 0, Oily: 0, Combination: 0, Sensitive: 0, Normal: 0 };

  if (q1 === 'tight_dry') { scores.Dry += 3; scores.Sensitive += 1; }
  else if (q1 === 'oily_shiny') { scores.Oily += 3; }
  else if (q1 === 'irritated') { scores.Sensitive += 3; }
  else { scores.Normal += 2; scores.Combination += 1; }

  if (q2 === 'frequently' || q2 === 'constantly') { scores.Oily += 2; }
  else if (q2 === 'never') { scores.Normal += 1; scores.Dry += 1; }

  if (q3 === 'very_oily') { scores.Oily += 2; }
  else if (q3 === 'slightly_oily') { scores.Combination += 2; }
  else if (q3 === 'dry_tight') { scores.Dry += 2; }
  else { scores.Normal += 1; }

  if (q4 === 'strong_reaction' || q4 === 'very_sensitive') { scores.Sensitive += 3; }
  else if (q4 === 'mild_reaction') { scores.Sensitive += 1; }

  const skinType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = total > 0 ? Math.min(0.95, scores[skinType] / total + 0.4) : 0.75;
  const info = skinTypesData.skinTypes.find(s => s.type === skinType);

  return { skin_type: skinType, confidence: parseFloat(confidence.toFixed(2)), description: info?.description || '' };
}

export const skincareAPI = {
  async predictSkinType(responses) {
    if (USE_MOCK) { await delay(); return mockPredictSkinType(responses); }
    const res = await apiClient.post('/predict/skin-type', { responses });
    return res.data;
  },

  async getRecommendationsBySkinType(skinType, topN = 8) {
    if (USE_MOCK) {
      await delay();
      const skinKeywords = {
        Oily: ['niacinamide', 'salicylic acid', 'zinc', 'clay'],
        Dry: ['hyaluronic acid', 'ceramide', 'glycerin', 'shea'],
        Combination: ['niacinamide', 'glycerin', 'hyaluronic acid'],
        Sensitive: ['centella', 'allantoin', 'aloe', 'ceramide', 'panthenol'],
        Normal: ['vitamin c', 'retinol', 'glycerin', 'niacinamide'],
      };
      const keywords = skinKeywords[skinType] || [];
      const scored = productsData.map(p => {
        const ingStr = p.ingredients.join(' ').toLowerCase();
        const score = keywords.filter(k => ingStr.includes(k)).length;
        return { ...p, score: parseFloat((0.5 + score * 0.1 + Math.random() * 0.2).toFixed(2)) };
      }).sort((a, b) => b.score - a.score);
      return scored.slice(0, topN);
    }
    const res = await apiClient.get(`/recommend/skin-type/${skinType}?top_n=${topN}`);
    return res.data.recommendations || [];
  },

  async getRecommendations(productId, topN = 5) {
    if (USE_MOCK) {
      await delay();
      const others = productsData.filter(p => p.product_id !== productId);
      return others.slice(0, topN).map((p, i) => ({
        ...p,
        score: parseFloat((0.9 - i * 0.08).toFixed(2)),
        matching_ingredients: p.ingredients.slice(0, 2),
      }));
    }
    const res = await apiClient.get(`/recommend/${productId}?top_n=${topN}`);
    return res.data.recommendations || [];
  },

  async analyzeIngredients(ingredients) {
    if (USE_MOCK) {
      await delay();
      const CONFLICTS = [
        { pair: ['retinol', 'vitamin c'],        message: 'Can cause irritation when combined. Use retinol at night and vitamin C in the morning.' },
        { pair: ['retinol', 'glycolic acid'],     message: 'Over-exfoliation risk. Use on alternate nights.' },
        { pair: ['retinol', 'lactic acid'],       message: 'Over-exfoliation risk. Use on alternate nights.' },
        { pair: ['retinol', 'salicylic acid'],    message: 'Over-exfoliation risk. Use on alternate nights.' },
        { pair: ['retinol', 'aha'],               message: 'Over-exfoliation risk. Use on alternate nights.' },
        { pair: ['retinol', 'bha'],               message: 'Over-exfoliation risk. Use on alternate nights.' },
        { pair: ['niacinamide', 'vitamin c'],     message: 'May reduce each other\'s efficacy at high concentrations. Apply separately or use a lower concentration.' },
        { pair: ['salicylic acid', 'benzoyl peroxide'], message: 'Excessive drying and irritation. Use at different times of day.' },
        { pair: ['glycolic acid', 'salicylic acid'],    message: 'Combining AHA and BHA can be too harsh. Patch test and use on alternate days.' },
        { pair: ['lactic acid', 'salicylic acid'],      message: 'Combining AHA and BHA can be too harsh. Patch test and use on alternate days.' },
        { pair: ['glycolic acid', 'lactic acid'],       message: 'Using multiple AHAs together increases irritation risk. Choose one at a time.' },
        { pair: ['aha', 'bha'],                         message: 'Can be too harsh combined. Patch test recommended.' },
        { pair: ['vitamin c', 'niacinamide'],     message: 'May reduce each other\'s efficacy. Apply separately or use a lower concentration.' },
        { pair: ['benzoyl peroxide', 'vitamin c'], message: 'Benzoyl peroxide can oxidise and deactivate vitamin C. Use at different times of day.' },
        { pair: ['retinol', 'benzoyl peroxide'],  message: 'Can cause excessive dryness and irritation. Use at different times of day.' },
      ];
      const ings = ingredients.map(i => i.toLowerCase().trim());
      const warnings = [];
      for (const c of CONFLICTS) {
        const [a, b] = c.pair;
        if (ings.some(i => i.includes(a)) && ings.some(i => i.includes(b))) {
          // avoid duplicate warnings for the same ingredient pair
          const alreadyAdded = warnings.some(w =>
            w.ingredients.includes(a) && w.ingredients.includes(b)
          );
          if (!alreadyAdded) {
            warnings.push({ ingredients: c.pair, message: c.message });
          }
        }
      }
      return { analyzed: ings, warnings, safe: warnings.length === 0 };
    }
    const res = await apiClient.post('/analyze/ingredients', { ingredients });
    return res.data;
  },

  async getProduct(productId) {
    if (USE_MOCK) {
      await delay(200);
      const p = productsData.find(p => p.product_id === productId);
      if (!p) throw new Error('Product not found');
      return p;
    }
    const res = await apiClient.get(`/product/${productId}`);
    return res.data;
  },

  async getProducts(filters = {}) {
    if (USE_MOCK) {
      await delay(300);
      let list = [...productsData];
      if (filters.type) list = list.filter(p => p.type.toLowerCase() === filters.type.toLowerCase());
      if (filters.brand) list = list.filter(p => p.brand.toLowerCase().includes(filters.brand.toLowerCase()));
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.ingredients.some(i => i.toLowerCase().includes(q))
        );
      }
      return { products: list, total: list.length, total_pages: 1, page: 1 };
    }
    const res = await apiClient.get('/products', { params: { limit: 50, ...filters } });
    return res.data;
  },

  async getQuizQuestions() {
    await delay(100);
    return quizData.questions;
  },

  getSkinTypeInfo(skinType) {
    return skinTypesData.skinTypes.find(s => s.type === skinType) || null;
  },

  getAllSkinTypes() {
    return skinTypesData.skinTypes;
  },
};
