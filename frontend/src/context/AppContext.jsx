import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [skinProfile, setSkinProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pecura_skin_profile')) || null; } catch { return null; }
  });

  const [routine, setRoutine] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pecura_routine')) || { morning: [], evening: [] };
    } catch { return { morning: [], evening: [] }; }
  });

  const [savedProducts, setSavedProducts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pecura_saved')) || []; } catch { return []; }
  });

  useEffect(() => {
    if (skinProfile) localStorage.setItem('pecura_skin_profile', JSON.stringify(skinProfile));
  }, [skinProfile]);

  useEffect(() => {
    localStorage.setItem('pecura_routine', JSON.stringify(routine));
  }, [routine]);

  useEffect(() => {
    localStorage.setItem('pecura_saved', JSON.stringify(savedProducts));
  }, [savedProducts]);

  const addToRoutine = (product, slot) => {
    setRoutine(prev => {
      const list = prev[slot];
      if (list.some(p => p.product_id === product.product_id)) return prev;
      return { ...prev, [slot]: [...list, { ...product, addedAt: new Date().toISOString() }] };
    });
  };

  const removeFromRoutine = (productId, slot) => {
    setRoutine(prev => ({ ...prev, [slot]: prev[slot].filter(p => p.product_id !== productId) }));
  };

  const reorderRoutine = (slot, fromIdx, toIdx) => {
    setRoutine(prev => {
      const list = [...prev[slot]];
      const [item] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, item);
      return { ...prev, [slot]: list };
    });
  };

  const toggleSaved = (product) => {
    setSavedProducts(prev => {
      const exists = prev.some(p => p.product_id === product.product_id);
      return exists ? prev.filter(p => p.product_id !== product.product_id) : [...prev, product];
    });
  };

  const isSaved = (productId) => savedProducts.some(p => p.product_id === productId);

  const clearProfile = () => {
    setSkinProfile(null);
    setRoutine({ morning: [], evening: [] });
    setSavedProducts([]);
    localStorage.removeItem('pecura_skin_profile');
    localStorage.removeItem('pecura_routine');
    localStorage.removeItem('pecura_saved');
  };

  return (
    <AppContext.Provider value={{
      skinProfile, setSkinProfile,
      routine, addToRoutine, removeFromRoutine, reorderRoutine,
      savedProducts, toggleSaved, isSaved,
      clearProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
