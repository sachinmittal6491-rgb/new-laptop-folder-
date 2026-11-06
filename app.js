/**
 * VESPERA LEDGER - MAIN APPLICATION LOGIC
 * Connects data, validation engine, search/filter controls, and live updates.
 */

class VesperaApp {
  constructor() {
    this.currentFilters = {
      search: '',
      type: 'all',
      category: 'all',
      dateRange: 'all',
      sortBy: 'date-desc'
    };

    this.activeFormType = 'expense';
    this.lastDeletedItem = null;

    this.cacheElements();
    this.initCategoryDropdowns();
    this.initEventListeners();
    this.initKeyboardShortcuts();
    this.render();
  }

  cacheElements() {
    // Metrics
    this.metricNetBalance = document.getElementById('metricNetBalance');
    this.metricTotalIncome = document.getElementById('metricTotalIncome');
    this.metricTotalExpense = document.getElementById('metricTotalExpense');
    this.metricSavingsRate = document.getElementById('metricSavingsRate');

    // Forms
    this.addForm = document.getElementById('addTransactionForm');
    this.editForm = document.getElementById('editTransactionForm');
    this.formTypeExpenseBtn = document.getElementById('formTypeExpenseBtn');
    this.formTypeIncomeBtn = document.getElementById('formTypeIncomeBtn');
    this.formCurrencyPrefix = document.getElementById('formCurrencyPrefix');
    this.formSubmitBtn = document.getElementById('formSubmitBtn');

    // Ledger Controls
    this.searchInput = document.getElementById('ledgerSearchInput');
    this.searchClearBtn = document.getElementById('searchClearBtn');
    this.filterTypePills = document.querySelectorAll('.filter-pill');
    this.filterCategorySelect = document.getElementById('filterCategorySelect');
    this.filterDateSelect = document.getElementById('filterDateSelect');
    this.filterSortSelect = document.getElementById('filterSortSelect');
    this.resultsCountEl = document.getElementById('resultsCount');

    // Ledger List
    this.transactionsList = document.getElementById('transactionsList');
    this.emptyState = document.getElementById('ledgerEmptyState');
    this.resetFiltersBtn = document.getElementById('resetFiltersBtn');

    // Currency Switcher
    this.currencySelect = document.getElementById('currencySelector');

    // Bulk buttons
    this.exportCsvBtn = document.getElementById('exportCsvBtn');
    this.exportJsonBtn = document.getElementById('exportJsonBtn');
    this.resetDemoBtn = document.getElementById('resetDemoBtn');
    this.clearAllBtn = document.getElementById('clearAllBtn');

    // Smart Insights
    this.insightTopCategory = document.getElementById('insightTopCategory');
    this.insightSavingsHealth = document.getElementById('insightSavingsHealth');
    this.insightMaxExpense = document.getElementById('insightMaxExpense');
  }

  /**
   * Populate category selects based on CATEGORIES map
   */
  initCategoryDropdowns() {
    const addCategorySelect = document.getElementById('addCategory');
    const editCategorySelect = document.getElementById('editCategory');

    this.populateCategoryOptions(addCategorySelect, this.activeFormType);
    this.populateCategoryOptions(editCategorySelect, 'all');

    if (this.filterCategorySelect) {
      this.filterCategorySelect.innerHTML = '<option value="all">All Categories</option>';
      for (const [key, meta] of Object.entries(CATEGORIES)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = `${meta.emoji} ${meta.name}`;
        this.filterCategorySelect.appendChild(opt);
      }
    }
  }

  populateCategoryOptions(selectEl, filterType = 'all') {
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="" disabled selected>Select category...</option>';

    for (const [key, meta] of Object.entries(CATEGORIES)) {
      if (filterType !== 'all' && meta.type !== filterType && meta.budget === undefined && filterType === 'expense') {
        continue;
      }
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${meta.emoji} ${meta.name}`;
      selectEl.appendChild(opt);
    }
  }

  /**
   * Bind DOM event listeners
   */
  initEventListeners() {
    // Currency Selector
    if (this.currencySelect) {
      this.currencySelect.value = window.dataStore.activeCurrency;
      this.currencySelect.addEventListener('change', (e) => {
        window.dataStore.setCurrency(e.target.value);
        this.render();
        window.uiController.showToast(`Currency updated to ${e.target.value}`, 'success');
      });
    }

    // Add Form Type Toggles (Expense vs Income)
    this.formTypeExpenseBtn?.addEventListener('click', () => {
      this.setFormType('expense');
    });

    this.formTypeIncomeBtn?.addEventListener('click', () => {
      this.setFormType('income');
    });

    // Default form date to today
    const addDateInput = document.getElementById('addDate');
    if (addDateInput) {
      addDateInput.value = new Date().toISOString().split('T')[0];
    }

    // Dynamic submit button amount preview
    const addAmountInput = document.getElementById('addAmount');
    if (addAmountInput) {
      addAmountInput.addEventListener('input', () => {
        const val = parseFloat(addAmountInput.value) || 0;
        const typeLabel = this.activeFormType === 'expense' ? 'Expense' : 'Income';
        if (this.formSubmitBtn) {
          this.formSubmitBtn.textContent = val > 0 
            ? `Record ${typeLabel} (${window.dataStore.formatAmount(val)})`
            : `Record ${typeLabel}`;
        }
      });
    }

    // Add Transaction Form Submission & Real-time Validation
    if (this.addForm) {
      this.addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddTransaction();
      });

      this.addForm.addEventListener('reset', () => {
        setTimeout(() => {
          this.addForm.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('has-error');
            const errorEl = group.querySelector('.error-message');
            if (errorEl) errorEl.textContent = '';
          });
          const addDateInput = document.getElementById('addDate');
          if (addDateInput) {
            addDateInput.value = new Date().toISOString().split('T')[0];
          }
          this.setFormType('expense');
        }, 10);
      });

      // Clear error on input
      this.addForm.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', () => {
          this.clearFieldError(input);
        });
        input.addEventListener('blur', () => {
          this.validateSingleField(input);
        });
      });
    }

    // Edit Transaction Form Submission
    if (this.editForm) {
      this.editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEditTransaction();
      });
    }

    // Search input
    this.searchInput?.addEventListener('input', (e) => {
      this.currentFilters.search = e.target.value.trim().toLowerCase();
      if (this.searchClearBtn) {
        this.searchClearBtn.classList.toggle('visible', this.currentFilters.search.length > 0);
      }
      this.renderLedgerList();
    });

    this.searchClearBtn?.addEventListener('click', () => {
      if (this.searchInput) {
        this.searchInput.value = '';
        this.currentFilters.search = '';
        this.searchClearBtn.classList.remove('visible');
        this.renderLedgerList();
        this.searchInput.focus();
      }
    });

    // Filter pills (All, Expenses, Income)
    this.filterTypePills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.filterTypePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentFilters.type = pill.dataset.type;
        this.renderLedgerList();
      });
    });

    // Category filter
    this.filterCategorySelect?.addEventListener('change', (e) => {
      this.currentFilters.category = e.target.value;
      this.renderLedgerList();
    });

    // Date range filter
    this.filterDateSelect?.addEventListener('change', (e) => {
      this.currentFilters.dateRange = e.target.value;
      this.renderLedgerList();
    });

    // Sort order
    this.filterSortSelect?.addEventListener('change', (e) => {
      this.currentFilters.sortBy = e.target.value;
      this.renderLedgerList();
    });

    // Reset filters
    this.resetFiltersBtn?.addEventListener('click', () => {
      this.resetAllFilters();
    });

    // Preset quick chips
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const title = chip.dataset.title;
        const amount = chip.dataset.amount;
        const category = chip.dataset.category;
        const type = chip.dataset.type || 'expense';

        this.setFormType(type);
        if (title) document.getElementById('addTitle').value = title;
        if (amount) {
          const amtInput = document.getElementById('addAmount');
          amtInput.value = amount;
          amtInput.dispatchEvent(new Event('input'));
        }
        if (category) {
          const catSelect = document.getElementById('addCategory');
          catSelect.value = category;
        }

        // Smooth scroll to form
        document.getElementById('add-transaction')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Data Export & Reset Buttons
    this.exportCsvBtn?.addEventListener('click', () => {
      window.dataStore.exportCSV();
      window.uiController.showToast('Ledger exported as CSV', 'success');
    });

    document.getElementById('exportCsvBtnHero')?.addEventListener('click', () => {
      window.uiController.showToast('Ledger exported as CSV', 'success');
    });

    this.exportJsonBtn?.addEventListener('click', () => {
      window.dataStore.exportJSON();
      window.uiController.showToast('Backup exported as JSON', 'success');
    });

    this.resetDemoBtn?.addEventListener('click', () => {
      if (confirm('Reset ledger to default sample transactions? Any custom additions will be replaced.')) {
        window.dataStore.resetDefault();
        this.render();
        window.uiController.showToast('Reset to demo ledger data', 'success');
      }
    });

    this.clearAllBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all transactions? This action cannot be undone.')) {
        window.dataStore.clearAll();
        this.render();
        window.uiController.showToast('Ledger cleared', 'warning');
      }
    });
  }

  /**
   * Set add form active type (expense vs income)
   */
  setFormType(type) {
    this.activeFormType = type;
    if (type === 'expense') {
      this.formTypeExpenseBtn?.classList.add('active');
      this.formTypeIncomeBtn?.classList.remove('active');
    } else {
      this.formTypeIncomeBtn?.classList.add('active');
      this.formTypeExpenseBtn?.classList.remove('active');
    }

    const addCategorySelect = document.getElementById('addCategory');
    this.populateCategoryOptions(addCategorySelect, type);

    const amt = parseFloat(document.getElementById('addAmount')?.value) || 0;
    const typeLabel = type === 'expense' ? 'Expense' : 'Income';
    if (this.formSubmitBtn) {
      this.formSubmitBtn.textContent = amt > 0 
        ? `Record ${typeLabel} (${window.dataStore.formatAmount(amt)})`
        : `Record ${typeLabel}`;
    }
  }

  /**
   * Real-time form validation
   */
  validateSingleField(field) {
    const parent = field.closest('.form-group');
    if (!parent) return true;

    const errorEl = parent.querySelector('.error-message');
    let errorMessage = '';

    const val = field.value ? field.value.trim() : '';

    if (field.id === 'addTitle' || field.id === 'editTitle') {
      if (!val) {
        errorMessage = 'Please enter a description or merchant name.';
      } else if (val.length < 2) {
        errorMessage = 'Description must be at least 2 characters long.';
      } else if (val.length > 80) {
        errorMessage = 'Description is too long (max 80 characters).';
      }
    } else if (field.id === 'addAmount' || field.id === 'editAmount') {
      const num = parseFloat(val);
      if (!val) {
        errorMessage = 'Please enter an amount.';
      } else if (isNaN(num) || num <= 0) {
        errorMessage = 'Amount must be a positive number greater than 0.';
      } else if (num > 10000000) {
        errorMessage = 'Amount exceeds maximum allowable threshold.';
      }
    } else if (field.id === 'addCategory' || field.id === 'editCategory') {
      if (!val) {
        errorMessage = 'Please choose a category.';
      }
    } else if (field.id === 'addDate' || field.id === 'editDate') {
      if (!val) {
        errorMessage = 'Please select a valid date.';
      }
    }

    if (errorMessage) {
      parent.classList.add('has-error');
      if (errorEl) errorEl.textContent = errorMessage;
      return false;
    } else {
      parent.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  }

  clearFieldError(field) {
    const parent = field.closest('.form-group');
    if (parent) {
      parent.classList.remove('has-error');
      const errorEl = parent.querySelector('.error-message');
      if (errorEl) errorEl.textContent = '';
    }
  }

  /**
   * Handle Add Transaction
   */
  handleAddTransaction() {
    const titleInput = document.getElementById('addTitle');
    const amountInput = document.getElementById('addAmount');
    const categoryInput = document.getElementById('addCategory');
    const dateInput = document.getElementById('addDate');
    const methodInput = document.getElementById('addMethod');
    const notesInput = document.getElementById('addNotes');

    const fields = [titleInput, amountInput, categoryInput, dateInput];
    let allValid = true;
    let firstInvalid = null;

    fields.forEach(field => {
      const valid = this.validateSingleField(field);
      if (!valid) {
        allValid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (!allValid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const newTx = {
      title: titleInput.value.trim(),
      amount: parseFloat(amountInput.value),
      type: this.activeFormType,
      category: categoryInput.value,
      date: dateInput.value,
      method: methodInput ? methodInput.value : 'Credit Card',
      notes: notesInput ? notesInput.value.trim() : ''
    };

    const added = window.dataStore.add(newTx);

    // Reset Form
    titleInput.value = '';
    amountInput.value = '';
    notesInput.value = '';
    categoryInput.selectedIndex = 0;
    dateInput.value = new Date().toISOString().split('T')[0];
    this.setFormType('expense');

    this.render();

    window.uiController.showToast(
      `${newTx.type === 'income' ? 'Income' : 'Expense'} of ${window.dataStore.formatAmount(newTx.amount)} recorded!`,
      'success'
    );
  }

  /**
   * Handle Edit Transaction
   */
  handleEditTransaction() {
    const id = document.getElementById('editId').value;
    const titleInput = document.getElementById('editTitle');
    const amountInput = document.getElementById('editAmount');
    const categoryInput = document.getElementById('editCategory');
    const dateInput = document.getElementById('editDate');
    const methodInput = document.getElementById('editMethod');
    const notesInput = document.getElementById('editNotes');
    const type = document.querySelector('input[name="editType"]:checked')?.value || 'expense';

    const fields = [titleInput, amountInput, categoryInput, dateInput];
    let allValid = true;
    fields.forEach(f => {
      if (!this.validateSingleField(f)) allValid = false;
    });

    if (!allValid) return;

    window.dataStore.update(id, {
      title: titleInput.value.trim(),
      amount: parseFloat(amountInput.value),
      type,
      category: categoryInput.value,
      date: dateInput.value,
      method: methodInput.value,
      notes: notesInput.value.trim()
    });

    window.uiController.closeEditModal();
    this.render();
    window.uiController.showToast('Transaction successfully updated!', 'success');
  }

  /**
   * Filter and sort transactions
   */
  getFilteredTransactions() {
    let list = window.dataStore.getAll();

    // 1. Text Search
    if (this.currentFilters.search) {
      const q = this.currentFilters.search;
      list = list.filter(item => {
        const catName = (CATEGORIES[item.category]?.name || '').toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          catName.includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          (item.method && item.method.toLowerCase().includes(q))
        );
      });
    }

    // 2. Type Filter
    if (this.currentFilters.type !== 'all') {
      list = list.filter(item => item.type === this.currentFilters.type);
    }

    // 3. Category Filter
    if (this.currentFilters.category !== 'all') {
      list = list.filter(item => item.category === this.currentFilters.category);
    }

    // 4. Date Range Filter
    if (this.currentFilters.dateRange !== 'all') {
      const now = new Date();
      list = list.filter(item => {
        const txDate = new Date(item.date);
        if (isNaN(txDate.getTime())) return true;

        if (this.currentFilters.dateRange === 'month') {
          return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        } else if (this.currentFilters.dateRange === '30days') {
          const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 30;
        } else if (this.currentFilters.dateRange === '7days') {
          const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);
          return diffDays >= 0 && diffDays <= 7;
        }
        return true;
      });
    }

    // 5. Sorting
    list.sort((a, b) => {
      if (this.currentFilters.sortBy === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      } else if (this.currentFilters.sortBy === 'date-asc') {
        return new Date(a.date) - new Date(b.date);
      } else if (this.currentFilters.sortBy === 'amount-desc') {
        return b.amount - a.amount;
      } else if (this.currentFilters.sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return list;
  }

  /**
   * Render the transactions list DOM
   */
  renderLedgerList() {
    if (!this.transactionsList) return;

    const filtered = this.getFilteredTransactions();

    // Results Counter
    if (this.resultsCountEl) {
      const totalCount = window.dataStore.getAll().length;
      this.resultsCountEl.innerHTML = `Showing <strong>${filtered.length}</strong> of ${totalCount} transactions`;
    }

    // Empty State Toggle
    if (filtered.length === 0) {
      this.transactionsList.innerHTML = '';
      this.emptyState?.classList.add('visible');
      return;
    } else {
      this.emptyState?.classList.remove('visible');
    }

    this.transactionsList.innerHTML = '';

    filtered.forEach(item => {
      const meta = CATEGORIES[item.category] || { name: item.category, emoji: '🏷️', color: '#64748B' };
      const isIncome = item.type === 'income';

      const li = document.createElement('li');
      li.className = 'transaction-item';
      li.dataset.id = item.id;

      li.innerHTML = `
        <div class="transaction-cat-icon" style="color: ${meta.color}; border-color: ${meta.color}33; background: ${meta.color}15;">
          ${meta.emoji}
        </div>
        
        <div class="transaction-meta">
          <div class="transaction-title-row">
            <span class="transaction-title">${this.escapeHtml(item.title)}</span>
            ${item.method ? `<span class="transaction-method-badge">${this.escapeHtml(item.method)}</span>` : ''}
          </div>
          <div class="transaction-sub-row">
            <span>${meta.name}</span>
            <span>•</span>
            <span>${item.date}</span>
            ${item.notes ? `<span>•</span><span class="transaction-tag">${this.escapeHtml(item.notes)}</span>` : ''}
          </div>
        </div>

        <div class="transaction-amount-wrap">
          <span class="transaction-amount tabular-nums ${isIncome ? 'income' : 'expense'}">
            ${window.dataStore.formatAmount(item.amount, true, item.type)}
          </span>
          <span class="transaction-date-badge">${isIncome ? 'Credit' : 'Debit'}</span>
        </div>

        <div class="transaction-actions">
          <button type="button" class="item-action-btn edit-btn" aria-label="Edit transaction" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="item-action-btn delete-btn" aria-label="Delete transaction" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      // Event Listeners for Edit & Delete
      const editBtn = li.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        window.uiController.openEditModal(item);
      });

      const deleteBtn = li.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => {
        this.handleDeleteTransaction(item);
      });

      this.transactionsList.appendChild(li);
    });
  }

  /**
   * Delete transaction with Undo option
   */
  handleDeleteTransaction(item) {
    this.lastDeletedItem = item;
    window.dataStore.delete(item.id);
    this.render();

    window.uiController.showToast(
      `Deleted "${item.title}"`,
      'danger',
      {
        label: 'Undo',
        callback: () => {
          if (this.lastDeletedItem) {
            window.dataStore.add(this.lastDeletedItem);
            this.lastDeletedItem = null;
            this.render();
            window.uiController.showToast('Transaction restored', 'success');
          }
        }
      }
    );
  }

  /**
   * Reset all filter controls
   */
  resetAllFilters() {
    this.currentFilters = {
      search: '',
      type: 'all',
      category: 'all',
      dateRange: 'all',
      sortBy: 'date-desc'
    };

    if (this.searchInput) this.searchInput.value = '';
    this.searchClearBtn?.classList.remove('visible');

    this.filterTypePills.forEach(p => {
      p.classList.toggle('active', p.dataset.type === 'all');
    });

    if (this.filterCategorySelect) this.filterCategorySelect.value = 'all';
    if (this.filterDateSelect) this.filterDateSelect.value = 'all';
    if (this.filterSortSelect) this.filterSortSelect.value = 'date-desc';

    this.renderLedgerList();
  }

  /**
   * Update top hero metrics
   */
  renderMetrics() {
    const metrics = window.dataStore.getSummaryMetrics();
    const curr = window.dataStore.getCurrencyInfo();

    if (this.formCurrencyPrefix) {
      this.formCurrencyPrefix.textContent = curr.symbol;
    }

    if (this.metricNetBalance) {
      this.metricNetBalance.textContent = window.dataStore.formatAmount(metrics.net);
    }

    if (this.metricTotalIncome) {
      this.metricTotalIncome.textContent = window.dataStore.formatAmount(metrics.income);
    }

    if (this.metricTotalExpense) {
      this.metricTotalExpense.textContent = window.dataStore.formatAmount(metrics.expense);
    }

    if (this.metricSavingsRate) {
      this.metricSavingsRate.textContent = `${metrics.savingsRate}%`;
    }
  }

  /**
   * Dynamic automated financial intelligence cards
   */
  renderSmartInsights() {
    const spending = window.dataStore.getCategorySpending();
    const metrics = window.dataStore.getSummaryMetrics();

    // 1. Find top spending category
    let topCatKey = '';
    let topCatAmount = 0;
    for (const [key, amt] of Object.entries(spending)) {
      if (amt > topCatAmount) {
        topCatAmount = amt;
        topCatKey = key;
      }
    }

    if (this.insightTopCategory) {
      if (topCatKey && metrics.expense > 0) {
        const topMeta = CATEGORIES[topCatKey] || { name: topCatKey, emoji: '🏷️' };
        const pct = ((topCatAmount / metrics.expense) * 100).toFixed(0);
        this.insightTopCategory.innerHTML = `
          <div class="insight-top-row">
            <span class="insight-badge priority">Top Outflow</span>
            <span style="font-size: 1.25rem;">${topMeta.emoji}</span>
          </div>
          <h3>${topMeta.name} is your highest expense</h3>
          <p>Accounting for <strong>${pct}%</strong> (${window.dataStore.formatAmount(topCatAmount)}) of your total spending this period.</p>
        `;
      } else {
        this.insightTopCategory.innerHTML = `
          <div class="insight-top-row">
            <span class="insight-badge priority">Top Outflow</span>
            <span>⚡</span>
          </div>
          <h3>Expense Distribution Healthy</h3>
          <p>Add more categorized expenses to view proportional breakdown insights.</p>
        `;
      }
    }

    // 2. Savings health insight
    if (this.insightSavingsHealth) {
      const rate = parseFloat(metrics.savingsRate);
      let statusText = 'Exceptional savings trajectory! You are retaining well above the standard 20% benchmark.';
      if (rate < 15) {
        statusText = 'Savings rate is tight this cycle. Consider reviewing recurring subscriptions and dining.';
      } else if (rate < 30) {
        statusText = 'Solid savings discipline. Maintaining this rate builds consistent liquidity.';
      }

      this.insightSavingsHealth.innerHTML = `
        <div class="insight-top-row">
          <span class="insight-badge tip">Savings Velocity</span>
          <span>📈</span>
        </div>
        <h3>${metrics.savingsRate}% Retained Capital</h3>
        <p>${statusText}</p>
      `;
    }

    // 3. Largest single expense
    if (this.insightMaxExpense) {
      const expenses = window.dataStore.getAll().filter(t => t.type === 'expense');
      if (expenses.length > 0) {
        expenses.sort((a, b) => b.amount - a.amount);
        const biggest = expenses[0];
        this.insightMaxExpense.innerHTML = `
          <div class="insight-top-row">
            <span class="insight-badge trend">Peak Outflow</span>
            <span>💎</span>
          </div>
          <h3>${this.escapeHtml(biggest.title)}</h3>
          <p>Single largest recorded expense at <strong>${window.dataStore.formatAmount(biggest.amount)}</strong> on ${biggest.date}.</p>
        `;
      } else {
        this.insightMaxExpense.innerHTML = `
          <div class="insight-top-row">
            <span class="insight-badge trend">Peak Outflow</span>
            <span>✨</span>
          </div>
          <h3>Zero Outflows Recorded</h3>
          <p>Start recording your daily expenses to trace your peak expenditure trends.</p>
        `;
      }
    }
  }

  /**
   * Global Keyboard Shortcuts
   */
  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if user is typing inside an input/textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      // '/' to focus search
      if (e.key === '/') {
        e.preventDefault();
        this.searchInput?.focus();
        this.searchInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // 'n' or 'N' to start new transaction
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        const addTitleInput = document.getElementById('addTitle');
        addTitleInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        addTitleInput?.focus();
      }
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Re-render complete application
   */
  render() {
    this.renderMetrics();
    this.renderLedgerList();
    this.renderSmartInsights();
    window.ledgerCharts.renderAll();
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.vesperaApp = new VesperaApp();
});
