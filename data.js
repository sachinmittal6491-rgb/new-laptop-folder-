/**
 * VESPERA LEDGER - DATA & STORAGE LAYER
 * Handles state persistence, currencies, sample seed data, and export utilities.
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'vespera_transactions_v1',
  CURRENCY: 'vespera_currency_v1',
  THEME: 'vespera_theme_v1'
};

// Supported Currencies
const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, locale: 'en-GB' },
  INR: { code: 'INR', symbol: '₹', rate: 84.5, locale: 'en-IN' },
  JPY: { code: 'JPY', symbol: '¥', rate: 154.0, locale: 'ja-JP' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 1.38, locale: 'en-CA' }
};

// Master Categories Definition
const CATEGORIES = {
  food: { name: 'Food & Dining', emoji: '🥑', color: '#10B981', budget: 600, type: 'expense' },
  housing: { name: 'Housing & Rent', emoji: '🏠', color: '#6366F1', budget: 1500, type: 'expense' },
  transport: { name: 'Transportation', emoji: '🚆', color: '#06B6D4', budget: 180, type: 'expense' },
  tech: { name: 'Tech & SaaS', emoji: '⚡', color: '#8B5CF6', budget: 120, type: 'expense' },
  health: { name: 'Health & Fitness', emoji: '💪', color: '#EC4899', budget: 150, type: 'expense' },
  entertainment: { name: 'Entertainment', emoji: '🎬', color: '#F59E0B', budget: 120, type: 'expense' },
  utilities: { name: 'Utilities', emoji: '💡', color: '#F97316', budget: 200, type: 'expense' },
  shopping: { name: 'Shopping', emoji: '🛍️', color: '#14B8A6', budget: 220, type: 'expense' },
  salary: { name: 'Salary & Wages', emoji: '💼', color: '#10B981', budget: 0, type: 'income' },
  freelance: { name: 'Freelance Work', emoji: '💻', color: '#06B6D4', budget: 0, type: 'income' },
  investments: { name: 'Investments', emoji: '📈', color: '#8B5CF6', budget: 0, type: 'income' },
  other: { name: 'Miscellaneous', emoji: '🏷️', color: '#64748B', budget: 100, type: 'expense' }
};

/**
 * Returns a date formatted as YYYY-MM-DD relative to today
 */
function getRelativeDate(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

/**
 * Rich Initial Seed Data
 */
function generateSeedTransactions() {
  return [
    {
      id: 'tx_seed_1',
      title: 'Senior Product Design Retainer',
      amount: 4250.00,
      type: 'income',
      category: 'salary',
      date: getRelativeDate(1),
      method: 'Direct Deposit',
      notes: '#payroll #monthly'
    },
    {
      id: 'tx_seed_2',
      title: 'Monthly Loft Apartment Rent',
      amount: 1450.00,
      type: 'expense',
      category: 'housing',
      date: getRelativeDate(2),
      method: 'Bank Transfer',
      notes: '#essential #living'
    },
    {
      id: 'tx_seed_3',
      title: 'Whole Foods Market Essentials',
      amount: 128.50,
      type: 'expense',
      category: 'food',
      date: getRelativeDate(3),
      method: 'Credit Card',
      notes: '#groceries #organic'
    },
    {
      id: 'tx_seed_4',
      title: 'Design Sprint Client Bonus',
      amount: 1650.00,
      type: 'income',
      category: 'freelance',
      date: getRelativeDate(5),
      method: 'Bank Transfer',
      notes: '#consulting #design'
    },
    {
      id: 'tx_seed_5',
      title: 'Equinox Fitness Club Membership',
      amount: 110.00,
      type: 'expense',
      category: 'health',
      date: getRelativeDate(6),
      method: 'Debit Card',
      notes: '#wellness'
    },
    {
      id: 'tx_seed_6',
      title: 'Figma Pro & GitHub Copilot Cloud',
      amount: 44.00,
      type: 'expense',
      category: 'tech',
      date: getRelativeDate(8),
      method: 'Credit Card',
      notes: '#tools #dev'
    },
    {
      id: 'tx_seed_7',
      title: 'Metro Express Transit Pass',
      amount: 85.00,
      type: 'expense',
      category: 'transport',
      date: getRelativeDate(10),
      method: 'Apple Pay',
      notes: '#commute'
    },
    {
      id: 'tx_seed_8',
      title: 'Vanguard Index Fund Dividend',
      amount: 142.30,
      type: 'income',
      category: 'investments',
      date: getRelativeDate(12),
      method: 'Brokerage',
      notes: '#passive #vti'
    },
    {
      id: 'tx_seed_9',
      title: 'ConEd Green Power & High-Speed Fiber',
      amount: 115.80,
      type: 'expense',
      category: 'utilities',
      date: getRelativeDate(14),
      method: 'Bank Transfer',
      notes: '#home #utilities'
    },
    {
      id: 'tx_seed_10',
      title: 'Omakase Sushi & Artisan Dinner',
      amount: 94.20,
      type: 'expense',
      category: 'food',
      date: getRelativeDate(16),
      method: 'Credit Card',
      notes: '#dining #celebration'
    },
    {
      id: 'tx_seed_11',
      title: 'Bose QuietComfort Noise Canceling',
      amount: 189.00,
      type: 'expense',
      category: 'shopping',
      date: getRelativeDate(18),
      method: 'Credit Card',
      notes: '#electronics #gear'
    },
    {
      id: 'tx_seed_12',
      title: 'IMAX Cinema Premiere & Lounge',
      amount: 42.50,
      type: 'expense',
      category: 'entertainment',
      date: getRelativeDate(21),
      method: 'Apple Pay',
      notes: '#weekend #movies'
    }
  ];
}

// Data Store Class
class DataStore {
  constructor() {
    this.transactions = this.loadTransactions();
    this.activeCurrency = this.loadCurrency();
  }

  loadTransactions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage error reading transactions:', e);
    }
    const seeds = generateSeedTransactions();
    this.saveTransactions(seeds);
    return seeds;
  }

  saveTransactions(list) {
    this.transactions = list;
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  add(transaction) {
    const item = {
      ...transaction,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
    };
    this.transactions.unshift(item);
    this.saveTransactions(this.transactions);
    return item;
  }

  update(id, updatedFields) {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.transactions[idx] = { ...this.transactions[idx], ...updatedFields };
      this.saveTransactions(this.transactions);
      return this.transactions[idx];
    }
    return null;
  }

  delete(id) {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      const [deleted] = this.transactions.splice(idx, 1);
      this.saveTransactions(this.transactions);
      return deleted;
    }
    return null;
  }

  get(id) {
    return this.transactions.find(t => t.id === id) || null;
  }

  getAll() {
    return [...this.transactions];
  }

  resetDefault() {
    const seeds = generateSeedTransactions();
    this.saveTransactions(seeds);
    return seeds;
  }

  clearAll() {
    this.saveTransactions([]);
    return [];
  }

  // Currency Handling
  loadCurrency() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (stored && CURRENCIES[stored]) {
        return stored;
      }
    } catch (e) {
      // ignore
    }
    return 'USD';
  }

  setCurrency(code) {
    if (CURRENCIES[code]) {
      this.activeCurrency = code;
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENCY, code);
      } catch (e) {
        // ignore
      }
    }
  }

  getCurrencyInfo() {
    return CURRENCIES[this.activeCurrency] || CURRENCIES.USD;
  }

  /**
   * Format numbers to the active currency string
   */
  formatAmount(amount, showSign = false, type = null) {
    const curr = this.getCurrencyInfo();
    const converted = amount * curr.rate;
    
    // Format based on locale
    const formatted = new Intl.NumberFormat(curr.locale, {
      style: 'currency',
      currency: curr.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(converted));

    if (showSign) {
      if (type === 'income' || amount > 0) return `+${formatted}`;
      if (type === 'expense' || amount < 0) return `-${formatted}`;
    }
    return formatted;
  }

  /**
   * Compute total figures
   */
  getSummaryMetrics(filteredList = null) {
    const list = filteredList || this.transactions;
    let income = 0;
    let expense = 0;

    for (const item of list) {
      const val = parseFloat(item.amount) || 0;
      if (item.type === 'income') {
        income += val;
      } else {
        expense += val;
      }
    }

    const net = income - expense;
    const savingsRate = income > 0 ? Math.max(0, ((income - expense) / income) * 100) : 0;

    return {
      income,
      expense,
      net,
      savingsRate: savingsRate.toFixed(1),
      count: list.length
    };
  }

  /**
   * Category spending totals (only for expenses)
   */
  getCategorySpending() {
    const totals = {};
    for (const key of Object.keys(CATEGORIES)) {
      totals[key] = 0;
    }

    for (const item of this.transactions) {
      if (item.type === 'expense') {
        const cat = item.category || 'other';
        totals[cat] = (totals[cat] || 0) + (parseFloat(item.amount) || 0);
      }
    }

    return totals;
  }

  /**
   * Export all data as CSV
   */
  exportCSV() {
    const headers = ['ID', 'Date', 'Title', 'Type', 'Category', 'Amount (USD)', 'Payment Method', 'Notes'];
    const rows = this.transactions.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.type}"`,
      `"${CATEGORIES[t.category]?.name || t.category}"`,
      t.amount.toFixed(2),
      `"${t.method || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vespera_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export all data as JSON
   */
  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.transactions, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `vespera_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Global data store instance
window.dataStore = new DataStore();
