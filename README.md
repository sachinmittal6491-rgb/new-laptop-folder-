# ✦ VESPERA LEDGER — Personal Expense & Cashflow Studio

A responsive, visually striking, multi-section personal wealth and expense tracking website crafted with **pure HTML5, modern CSS tokens, and vanilla JavaScript (zero build step)**.

Designed with a high-craft neo-bank editorial aesthetic, Vespera blends deep obsidian surfaces, glowing emerald and indigo accents, interactive pure-SVG data visualizations, real-time client-side validation, and instant multi-filter search.

---

## ⚡ Live Features

1. **Sticky Glassmorphic Navbar & Responsive Mobile Drawer**
   - Backdrop blur (`backdrop-filter: blur(16px)`) with scroll-reactive shadow.
   - Animated mobile hamburger button that morphs into a close icon.
   - Touch-friendly mobile slide-in drawer with navigation links and status indicators.
   - Keyboard accessible (`Esc` closes menus and modals).

2. **Bold Hero Section with 4 Live Metric Cards**
   - High-impact typography with a subtle background ambient glow mesh.
   - Real-time calculated cards:
     - **Net Liquidity**: Current net cash surplus/deficit.
     - **Total Inflow**: Aggregated income streams (salary, freelance, investments).
     - **Total Outflow**: Aggregated expenses (rent, dining, tech, shopping).
     - **Retention Rate**: Proportional percentage of income retained.
   - Quick action CTAs with smooth scrolling and one-click CSV export.

3. **Visual Allocation & Budget Intelligence**
   - **Interactive SVG Donut Chart**: Pure SVG donut with stroke calculation, hover segment scaling, category tooltips, and dynamic total display.
   - **Budget Threshold Gauges**: Visual spending meters comparing active expenditure against monthly category caps with automatic warning and danger color states (>75% warning, >90% danger).
   - **Cashflow Dynamics Bar Chart**: SVG ratio visualization comparing Inflow, Outflow, and Net Retained capital.

4. **Working Form with Real-Time Validation & Quick Presets**
   - Segmented toggle between **Expense** and **Income** with dynamic category options.
   - Real-time inline field validation:
     - **Merchant/Title**: Required, length constraints (2–80 chars).
     - **Amount**: Required, strictly positive number validation with live active currency prefix and dynamic submit button preview (`Record Expense ($45.00)`).
     - **Category & Date**: Required fields with clear inline error hints and shake animation on invalid submission.
   - **One-Tap Presets**: Instant sample chips (Coffee, Groceries, Fuel, Subscriptions, Freelance payout) that auto-fill the form.

5. **Searchable & Filterable Ledger**
   - **Live Instant Search**: Filter across merchant names, category labels, payment methods, and notes as you type (press `/` to focus instantly).
   - **Segmented Type Filter**: View *All*, *Expenses Only*, or *Income Only*.
   - **Category Filter**: Filter by any specific spending or earning category.
   - **Date Range Filter**: All time, This Month, Last 30 Days, Last 7 Days.
   - **Multi-criteria Sorting**: Date (Newest/Oldest), Amount (Highest/Lowest).
   - **Live Results Counter**: Shows filtered count and empty-state feedback with a one-click "Reset Filters" action.

6. **Interactive Ledger Management & Undo Toast**
   - **In-place Edit Modal**: Seamless modal dialog to adjust any existing transaction.
   - **Delete with Undo Toast**: Floating notification with an active **"Undo"** button that immediately restores accidentally deleted transactions.
   - **CSV & JSON Export**: One-click download of full transaction logs for Excel, Google Sheets, or local backups.
   - **Sample Data Restore**: Instantly re-seed or wipe clean with protective confirmation dialogs.

7. **Multi-Currency Converter**
   - Toggle instantly between **USD ($)**, **EUR (€)**, **GBP (£)**, **INR (₹)**, **JPY (¥)**, and **CAD (C$)**.
   - Automatically recalibrates all metric cards, donut charts, budget bars, input prefixes, and ledger tables using `Intl.NumberFormat` with tabular figures (`font-variant-numeric: tabular-nums`).

8. **Theme Toggle (Dark / Light Mode)**
   - Dark mode by default (Obsidian / Mint / Indigo).
   - High-contrast Light mode (Crisp porcelain / Emerald / Navy).
   - Persisted in `localStorage` and automatically detects OS `prefers-color-scheme`.

---

## 🎨 Design System & Distinctive Styling

Unlike generic template designs, Vespera uses an intentional fintech design language:

| Design Element | Choice | Purpose |
| :--- | :--- | :--- |
| **Heading Font** | `Plus Jakarta Sans` | Modern geometric sans with character and editorial weight |
| **Financial / Numeral Font** | `Space Grotesk` & Tabular Nums (`tnum`) | Digit alignment across tables, badges, and metrics |
| **Dark Theme Canvas** | `#080C15` / `#101726` | Deep obsidian surfaces with subtle glassmorphic elevation |
| **Light Theme Canvas** | `#F8FAFC` / `#FFFFFF` | Clean daylight porcelain with crisp borders and soft shadows |
| **Positive Accent** | Mint Emerald (`#10B981`) | Financial prosperity, growth, and positive inflow |
| **Negative Accent** | Rose Crimson (`#F43F5E`) | High-contrast outflow indicator without visual harshness |
| **Retention Accent** | Electric Indigo (`#6366F1`) | Capital preservation and savings milestones |

---

## 📁 Directory Structure

```
├── index.html            # Semantic HTML5 markup, accessible ARIA roles, sections
├── css/
│   └── style.css         # CSS tokens, light/dark themes, responsive grid, animations
├── js/
│   ├── data.js           # Storage layer, seed transactions, currencies, CSV/JSON export
│   ├── chart.js          # Pure SVG Donut, Cashflow Bars, and Budget meters
│   ├── ui.js             # Theme switcher, mobile drawer, toast manager, modal dialog
│   └── app.js            # Main controller, validation engine, search & multi-filter
├── assets/
│   ├── favicon.svg       # Custom geometric financial waveform favicon
│   └── logo.svg          # High-DPI SVG brand lockup
└── README.md             # Project documentation and guide
```

---

## ⌨️ Power-User Keyboard Shortcuts

- <kbd>/</kbd> — Jump focus to the Ledger Search input
- <kbd>N</kbd> or <kbd>n</kbd> — Scroll to and focus the "Add Transaction" description field
- <kbd>Esc</kbd> — Close any open modal dialog or mobile drawer menu

---

## 🚀 How to Run

No build step, npm install, or bundler is required:

1. Simply open `index.html` in any modern web browser (Google Chrome, Safari, Mozilla Firefox, Microsoft Edge, Brave, Opera).
2. Alternatively, serve with any local HTTP server:
   ```bash
   # Using Python:
   python -m http.server 8000

   # Or using Node:
   npx serve .
   ```
3. Open `http://localhost:8000` in your browser.

---

## 📱 Responsive Testing Matrix

Vespera has been tested and optimized across mobile, tablet, and desktop breakpoints:

- **Mobile Viewports (320px – 480px)**: 
  - Hamburger menu with full-screen slide-down drawer.
  - Summary metrics collapse cleanly to single-column cards.
  - Forms stack vertically with comfortable touch targets (min 44px).
  - Transaction items adapt to high-density stacked cards with touch-friendly action buttons.
  - Floating toast notifications anchor neatly to screen edges.
- **Tablet Viewports (768px – 1024px)**:
  - 2-column metrics grid.
  - Side-by-side or stacked analytics panels.
  - Sticky navigation bar remains fixed.
- **Desktop Viewports (1280px+)**:
  - Full 4-column metric panorama.
  - Dual-panel analytics with interactive SVG Donut and Budget Gauges.
  - 2-column form layout with quick presets and keyboard shortcut panels.
  - Spacious data table with tabular numeric alignment.

---

## 🔒 Privacy & Architecture

Vespera operates entirely client-side:
- **Zero Third-Party Telemetry**: Your financial figures are never transmitted to external servers.
- **LocalStorage Persistence**: Data persists between reloads in your browser sandbox.
- **Zero Dependencies**: Pure HTML, CSS, and modern ECMAScript standard libraries.
