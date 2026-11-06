/**
 * VESPERA LEDGER - CHARTS & VISUALIZATIONS
 * Pure SVG responsive Donut Chart, Cashflow Bars, and Budget meters.
 * Zero external libraries needed.
 */

class LedgerCharts {
  constructor() {
    this.donutSvg = document.getElementById('categoryDonutSvg');
    this.donutCenterValue = document.getElementById('donutCenterAmount');
    this.donutLegend = document.getElementById('donutLegend');
    this.budgetList = document.getElementById('budgetMetersList');
    this.cashflowWrapper = document.getElementById('cashflowChartWrapper');
  }

  /**
   * Render or update all visual charts
   */
  renderAll() {
    this.renderDonut();
    this.renderBudgetMeters();
    this.renderCashflowDynamics();
  }

  /**
   * Render SVG Donut Chart
   */
  renderDonut() {
    if (!this.donutSvg || !this.donutLegend) return;

    const spending = window.dataStore.getCategorySpending();
    let totalExpense = 0;
    const slices = [];

    for (const [key, amount] of Object.entries(spending)) {
      if (amount > 0) {
        totalExpense += amount;
        slices.push({
          key,
          amount,
          meta: CATEGORIES[key] || { name: key, color: '#94A3B8', emoji: '🏷️' }
        });
      }
    }

    // Sort slices by amount descending
    slices.sort((a, b) => b.amount - a.amount);

    // Update center total
    if (this.donutCenterValue) {
      this.donutCenterValue.textContent = window.dataStore.formatAmount(totalExpense);
    }

    // SVG geometry
    const size = 200;
    const center = size / 2;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    // Reset SVG content
    this.donutSvg.innerHTML = '';
    this.donutSvg.setAttribute('viewBox', `0 0 ${size} ${size}`);

    if (totalExpense === 0) {
      // Empty placeholder ring
      const emptyCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      emptyCircle.setAttribute('cx', center);
      emptyCircle.setAttribute('cy', center);
      emptyCircle.setAttribute('r', radius);
      emptyCircle.setAttribute('fill', 'none');
      emptyCircle.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
      emptyCircle.setAttribute('stroke-width', '24');
      this.donutSvg.appendChild(emptyCircle);

      this.donutLegend.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0;">No expense records yet to plot.</div>';
      return;
    }

    let accumulatedOffset = 0;
    this.donutLegend.innerHTML = '';

    slices.forEach((slice, idx) => {
      const percentage = (slice.amount / totalExpense) * 100;
      const strokeLength = (slice.amount / totalExpense) * circumference;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += strokeLength;

      // Create SVG Path / Circle segment
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', center);
      circle.setAttribute('cy', center);
      circle.setAttribute('r', radius);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', slice.meta.color);
      circle.setAttribute('stroke-width', '24');
      circle.setAttribute('stroke-dasharray', `${strokeLength} ${circumference}`);
      circle.setAttribute('stroke-dashoffset', strokeDashoffset);
      circle.setAttribute('class', 'chart-segment');
      circle.setAttribute('data-category', slice.meta.name);
      circle.setAttribute('data-percent', percentage.toFixed(1));
      circle.setAttribute('data-amount', window.dataStore.formatAmount(slice.amount));

      // Segment Hover Effects
      circle.addEventListener('mouseenter', () => {
        circle.setAttribute('stroke-width', '30');
        if (this.donutCenterValue) {
          this.donutCenterValue.innerHTML = `<span style="font-size:0.8em; color:${slice.meta.color};">${percentage.toFixed(0)}%</span><br/>${window.dataStore.formatAmount(slice.amount)}`;
        }
      });

      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('stroke-width', '24');
        if (this.donutCenterValue) {
          this.donutCenterValue.textContent = window.dataStore.formatAmount(totalExpense);
        }
      });

      this.donutSvg.appendChild(circle);

      // Add top 5 slices to Legend
      if (idx < 5) {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
          <div class="legend-item-left">
            <span class="legend-color-dot" style="background-color: ${slice.meta.color}"></span>
            <span class="legend-item-name">${slice.meta.emoji} ${slice.meta.name}</span>
          </div>
          <span class="legend-item-value tabular-nums">${percentage.toFixed(0)}%</span>
        `;
        
        legendItem.addEventListener('mouseenter', () => {
          circle.setAttribute('stroke-width', '30');
        });
        legendItem.addEventListener('mouseleave', () => {
          circle.setAttribute('stroke-width', '24');
        });

        this.donutLegend.appendChild(legendItem);
      }
    });
  }

  /**
   * Render Budget Health Meters
   */
  renderBudgetMeters() {
    if (!this.budgetList) return;

    const spending = window.dataStore.getCategorySpending();
    this.budgetList.innerHTML = '';

    // Select core budgeted categories
    const budgetCategories = ['housing', 'food', 'transport', 'tech', 'entertainment', 'shopping'];

    budgetCategories.forEach(catKey => {
      const meta = CATEGORIES[catKey];
      if (!meta || !meta.budget) return;

      const spent = spending[catKey] || 0;
      const budget = meta.budget;
      const actualPct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
      const barFillPct = Math.min(100, actualPct);

      let statusClass = 'normal';
      if (actualPct >= 90) statusClass = 'danger';
      else if (actualPct >= 75) statusClass = 'warning';

      const itemEl = document.createElement('div');
      itemEl.className = 'budget-item';
      itemEl.innerHTML = `
        <div class="budget-info-row">
          <div class="budget-category">
            <span class="budget-category-emoji">${meta.emoji}</span>
            <span>${meta.name}</span>
          </div>
          <div class="budget-numbers tabular-nums">
            <strong>${window.dataStore.formatAmount(spent)}</strong> / ${window.dataStore.formatAmount(budget)}
            <span style="margin-left: 0.4rem; font-weight:700; color:${statusClass === 'danger' ? 'var(--color-expense)' : statusClass === 'warning' ? 'var(--color-warning)' : 'var(--text-secondary)'};">(${actualPct}%)</span>
          </div>
        </div>
        <div class="budget-bar-track">
          <div class="budget-bar-fill ${statusClass}" style="width: ${barFillPct}%;"></div>
        </div>
      `;
      this.budgetList.appendChild(itemEl);
    });
  }

  /**
   * Render Monthly Cashflow Dynamics Bar Chart
   */
  renderCashflowDynamics() {
    if (!this.cashflowWrapper) return;

    const metrics = window.dataStore.getSummaryMetrics();
    const maxVal = Math.max(metrics.income, metrics.expense, 1);

    const incomeHeight = Math.max(12, Math.round((metrics.income / maxVal) * 110));
    const expenseHeight = Math.max(12, Math.round((metrics.expense / maxVal) * 110));
    const netHeight = Math.max(8, Math.round((Math.max(0, metrics.net) / maxVal) * 110));

    this.cashflowWrapper.innerHTML = `
      <svg class="cashflow-svg" viewBox="0 0 600 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10B981" />
            <stop offset="100%" stop-color="#059669" />
          </linearGradient>
          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F43F5E" />
            <stop offset="100%" stop-color="#BE123C" />
          </linearGradient>
          <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366F1" />
            <stop offset="100%" stop-color="#4F46E5" />
          </linearGradient>
        </defs>

        <!-- Base Gridlines -->
        <line x1="40" y1="30" x2="560" y2="30" stroke="var(--border-subtle)" stroke-dasharray="4 4" />
        <line x1="40" y1="80" x2="560" y2="80" stroke="var(--border-subtle)" stroke-dasharray="4 4" />
        <line x1="40" y1="130" x2="560" y2="130" stroke="var(--border-medium)" stroke-width="1.5" />

        <!-- Income Bar -->
        <g class="chart-bar-group">
          <rect x="90" y="${130 - incomeHeight}" width="80" height="${incomeHeight}" rx="8" fill="url(#incGrad)" opacity="0.9" />
          <text x="130" y="${120 - incomeHeight}" text-anchor="middle" fill="#10B981" font-size="12" font-weight="700">${window.dataStore.formatAmount(metrics.income)}</text>
          <text x="130" y="148" text-anchor="middle" fill="var(--text-secondary)" font-size="12" font-weight="600">Total Inflow</text>
        </g>

        <!-- Expense Bar -->
        <g class="chart-bar-group">
          <rect x="260" y="${130 - expenseHeight}" width="80" height="${expenseHeight}" rx="8" fill="url(#expGrad)" opacity="0.9" />
          <text x="300" y="${120 - expenseHeight}" text-anchor="middle" fill="#F43F5E" font-size="12" font-weight="700">${window.dataStore.formatAmount(metrics.expense)}</text>
          <text x="300" y="148" text-anchor="middle" fill="var(--text-secondary)" font-size="12" font-weight="600">Total Outflow</text>
        </g>

        <!-- Net Savings Bar -->
        <g class="chart-bar-group">
          <rect x="430" y="${130 - netHeight}" width="80" height="${netHeight}" rx="8" fill="url(#netGrad)" opacity="0.9" />
          <text x="470" y="${120 - netHeight}" text-anchor="middle" fill="#818CF8" font-size="12" font-weight="700">${window.dataStore.formatAmount(metrics.net)}</text>
          <text x="470" y="148" text-anchor="middle" fill="var(--text-secondary)" font-size="12" font-weight="600">Net Retained</text>
        </g>
      </svg>
    `;
  }
}

// Global charts instance
window.ledgerCharts = new LedgerCharts();
