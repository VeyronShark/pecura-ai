import apiClient from './client.js';
import productsData from '../mock/products.json';
import skinTypesData from '../mock/skinTypes.json';
import quizData from '../mock/quizQuestions.json';

// Mock mode flag - set to false when backend is ready
const USE_MOCK_DATA = true;

// Simulate API delay for realistic UX
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const skincareAPI = {
  // Skin type prediction
  async predictSkinType(responses) {
    if (USE_MOCK_DATA) {
      await mockDelay();
      // Simple mock logic based on responses
      const skinTypeMap = {
        'tight_dry': 'Dry',
        'comfortable': 'Normal', 
        'oily_shiny': 'Oily',
        'irritated': 'Sensitive'
      };
      
      const primaryResponse = responses.q1;
      const skinType = skinTypeMap[primaryResponse] || 'Combination';
      
      return {
        skin_type: skinType,
        confidence: 0.85 + Math.random() * 0.1,
        description: skinTypesData.skinTypes.find(st => st.type === skinType)?.description
      };
    }
    
    try {
      const response = await apiClient.post('/predict/skin-type', { responses });
      return response.data;
    } catch (error) {
      console.error('Error predicting skin type:', error);
      throw error;
    }
  },

  // Product recommendations
  async getRecommendations(productId, topN = 5) {
    if (USE_MOCK_DATA) {
      await mockDelay();
      // Return random products as recommendations
      const shuffled = [...productsData].sort(() => 0.5 - Math.random());
      const recommendations = shuffled.slice(0, topN).map((product, index) => ({
        ...product,
        score: 0.9 - (index * 0.1),
        match_reason: `Similar ingredients: ${product.ingredients.slice(0, 2).join(', ')}`
      }));
      
      return {
        product_id: productId,
        recommendations
      };
    }
    
    try {
      const response = await apiClient.get(`/recommend/${productId}?top_n=${topN}`);
      return response.data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  },

  // Ingredient analysis
  async analyzeIngredients(ingredients) {
    if (USE_MOCK_DATA) {
      await mockDelay();
      // Mock ingredient conflicts
      const conflicts = [];
      if (ingredients.includes('retinol') && ingredients.includes('salicylic acid')) {
        conflicts.push({
          type: 'warning',
          message: 'Retinol and Salicylic Acid may cause irritation when used together',
          ingredients: ['retinol', 'salicylic acid']
        });
      }
      
      return {
        warnings: conflicts,
        safety: conflicts.length === 0 ? ['No known conflicts detected'] : []
      };
    }
    
    try {
      const response = await apiClient.post('/analyze/ingredients', { ingredients });
      return response.data;
    } catch (error) {
      console.error('Error analyzing ingredients:', error);
      throw error;
    }
  },

  // Get product details
  async getProduct(productId) {
    if (USE_MOCK_DATA) {
      await mockDelay();
      const product = productsData.find(p => p.product_id === productId);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    }
    
    try {
      const response = await apiClient.get(`/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  // Get all products (for browsing)
  async getProducts(filters = {}) {
    if (USE_MOCK_DATA) {
      await mockDelay();
      let filtered = [...productsData];
      
      if (filters.type) {
        filtered = filtered.filter(p => p.type.toLowerCase() === filters.type.toLowerCase());
      }
      if (filters.brand) {
        filtered = filtered.filter(p => p.brand.toLowerCase().includes(filters.brand.toLowerCase()));
      }
      
      return filtered;
    }
    
    try {
      const response = await apiClient.get('/products', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Get quiz questions
  async getQuizQuestions() {
    if (USE_MOCK_DATA) {
      await mockDelay(200);
      return quizData.questions;
    }
    
    try {
      const response = await apiClient.get('/quiz/questions');
      return response.data;
    } catch (error) {
      console.error('Error getting quiz questions:', error);
      throw error;
    }
  },

  // Get skin type information
  async getSkinTypes() {
    if (USE_MOCK_DATA) {
      await mockDelay(200);
      return skinTypesData.skinTypes;
    }
    
    try {
      const response = await apiClient.get('/skin-types');
      return response.data;
    } catch (error) {
      console.error('Error getting skin types:', error);
      throw error;
    }
  }
};