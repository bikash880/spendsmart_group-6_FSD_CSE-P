import { useState, useEffect, useCallback } from 'react';

const TRANSACTIONS_KEY = 'spendsmart_transactions';
const BUDGETS_KEY = 'spendsmart_budgets';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TRANSACTIONS_KEY);
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever transactions change
  const saveToStorage = useCallback((data) => {
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data));
      setTransactions(data);
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }, []);

  const addTransaction = useCallback((transaction) => {
    const newTransaction = {
      id: Date.now(),
      ...transaction,
      created_at: new Date().toISOString(),
    };
    const updated = [...transactions, newTransaction];
    saveToStorage(updated);
    return newTransaction;
  }, [transactions, saveToStorage]);

  const deleteTransaction = useCallback((id) => {
    const updated = transactions.filter((t) => t.id !== id);
    saveToStorage(updated);
  }, [transactions, saveToStorage]);

  const updateTransaction = useCallback((id, updates) => {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    saveToStorage(updated);
  }, [transactions, saveToStorage]);

  const getFiltered = useCallback((filters = {}) => {
    let filtered = [...transactions];

    if (filters.search) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter((t) => t.transaction_type === filters.type);
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    if (filters.month_year) {
      filtered = filtered.filter((t) => {
        const txMonth = t.transaction_date.substring(0, 7);
        return txMonth === filters.month_year;
      });
    }

    return filtered.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }, [transactions]);

  return {
    transactions,
    isLoading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getFiltered,
  };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BUDGETS_KEY);
      if (stored) {
        setBudgets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever budgets change
  const saveToStorage = useCallback((data) => {
    try {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(data));
      setBudgets(data);
    } catch (error) {
      console.error('Error saving budgets:', error);
    }
  }, []);

  const addBudget = useCallback((budget) => {
    const newBudget = {
      id: Date.now(),
      ...budget,
      created_at: new Date().toISOString(),
    };
    const updated = [...budgets, newBudget];
    saveToStorage(updated);
    return newBudget;
  }, [budgets, saveToStorage]);

  const upsertBudget = useCallback((category, amount, month_year) => {
    const index = budgets.findIndex((b) => b.category === category && b.month_year === month_year);
    let updated;

    if (index === -1) {
      const newBudget = {
        id: Date.now(),
        category,
        amount,
        month_year,
        created_at: new Date().toISOString(),
      };
      updated = [...budgets, newBudget];
    } else {
      updated = budgets.map((b, i) =>
        i === index ? { ...b, amount } : b
      );
    }

    saveToStorage(updated);
    return updated[updated.length - 1];
  }, [budgets, saveToStorage]);

  const deleteBudget = useCallback((id) => {
    const updated = budgets.filter((b) => b.id !== id);
    saveToStorage(updated);
  }, [budgets, saveToStorage]);

  const getFiltered = useCallback((filters = {}) => {
    let filtered = [...budgets];

    if (filters.month_year) {
      filtered = filtered.filter((b) => b.month_year === filters.month_year);
    }

    return filtered.sort((a, b) => a.category.localeCompare(b.category));
  }, [budgets]);

  return {
    budgets,
    isLoading,
    addBudget,
    upsertBudget,
    deleteBudget,
    getFiltered,
  };
}
