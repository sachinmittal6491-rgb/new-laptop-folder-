/**
 * VESPERA LEDGER - UI CONTROLLER
 * Theme toggle, mobile navigation, toast alerts, modals, and micro-interactions.
 */

class UIController {
  constructor() {
    this.initTheme();
    this.initNavigation();
    this.initScrollEffects();
    this.initModals();
  }

  /* ------------------------------------------------------------------------
     1. Theme Management (Dark / Light)
     ------------------------------------------------------------------------ */
  initTheme() {
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.themeIconSun = document.getElementById('themeIconSun');
    this.themeIconMoon = document.getElementById('themeIconMoon');

    // Retrieve saved theme or system preference
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initialTheme = savedTheme || (prefersLight ? 'light' : 'dark');

    this.setTheme(initialTheme);

    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
      });
    }

    // Listen to OS system theme changes
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
        this.setTheme(e.matches ? 'light' : 'dark');
      }
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);

    if (this.themeIconSun && this.themeIconMoon) {
      if (theme === 'light') {
        this.themeIconSun.style.display = 'none';
        this.themeIconMoon.style.display = 'block';
        this.themeToggleBtn?.setAttribute('aria-label', 'Switch to dark mode');
      } else {
        this.themeIconSun.style.display = 'block';
        this.themeIconMoon.style.display = 'none';
        this.themeToggleBtn?.setAttribute('aria-label', 'Switch to light mode');
      }
    }
  }

  /* ------------------------------------------------------------------------
     2. Mobile Menu & Navigation
     ------------------------------------------------------------------------ */
  initNavigation() {
    this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    this.mobileDrawer = document.getElementById('mobileDrawer');
    this.mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (this.mobileMenuBtn && this.mobileDrawer) {
      this.mobileMenuBtn.addEventListener('click', () => {
        const isExpanded = this.mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        this.toggleMobileMenu(!isExpanded);
      });

      // Close on backdrop click
      this.mobileDrawer.addEventListener('click', (e) => {
        if (e.target === this.mobileDrawer) {
          this.toggleMobileMenu(false);
        }
      });

      // Close when clicking any nav link
      this.mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.toggleMobileMenu(false);
        });
      });

      // ESC key closes drawer
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.mobileMenuBtn.getAttribute('aria-expanded') === 'true') {
          this.toggleMobileMenu(false);
        }
      });
    }

    // Back to top smooth scroll
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  toggleMobileMenu(open) {
    if (!this.mobileMenuBtn || !this.mobileDrawer) return;

    this.mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      this.mobileDrawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      this.mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  /* ------------------------------------------------------------------------
     3. Scroll Effects & Section Spy
     ------------------------------------------------------------------------ */
  initScrollEffects() {
    const header = document.querySelector('.site-header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      // Sticky header shadow
      if (window.scrollY > 20) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }

      // Active section spy
      let currentSectionId = '';
      const scrollPos = window.scrollY + 120;

      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     4. Toast Notifications System
     ------------------------------------------------------------------------ */
  showToast(message, type = 'info', action = null) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '✦';
    if (type === 'success') icon = '✓';
    if (type === 'danger') icon = '🗑️';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <div class="toast-message-wrap">
        <span class="toast-icon">${icon}</span>
        <span>${message}</span>
      </div>
    `;

    if (action && action.label && typeof action.callback === 'function') {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'toast-action-btn';
      actionBtn.textContent = action.label;
      actionBtn.addEventListener('click', () => {
        action.callback();
        this.dismissToast(toast);
      });
      toast.appendChild(actionBtn);
    }

    container.appendChild(toast);

    // Auto dismiss after 4.5 seconds
    const timer = setTimeout(() => {
      this.dismissToast(toast);
    }, 4500);

    toast.dataset.timer = timer;
  }

  dismissToast(toast) {
    if (!toast || toast.classList.contains('hiding')) return;
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }

  /* ------------------------------------------------------------------------
     5. Modals Management (e.g. Edit Transaction)
     ------------------------------------------------------------------------ */
  initModals() {
    this.editModal = document.getElementById('editTransactionModal');
    this.modalCloseBtn = document.getElementById('modalCloseBtn');

    if (this.editModal) {
      // Backdrop click
      this.editModal.addEventListener('click', (e) => {
        if (e.target === this.editModal) {
          this.closeEditModal();
        }
      });

      // Close button
      this.modalCloseBtn?.addEventListener('click', () => {
        this.closeEditModal();
      });

      // ESC key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.editModal.classList.contains('open')) {
          this.closeEditModal();
        }
      });
    }
  }

  openEditModal(transaction) {
    if (!this.editModal) return;
    const form = document.getElementById('editTransactionForm');
    if (!form) return;

    // Populate form fields
    form.querySelector('#editId').value = transaction.id;
    form.querySelector('#editTitle').value = transaction.title;
    form.querySelector('#editAmount').value = transaction.amount;
    form.querySelector('#editCategory').value = transaction.category;
    form.querySelector('#editDate').value = transaction.date;
    form.querySelector('#editMethod').value = transaction.method || 'Credit Card';
    form.querySelector('#editNotes').value = transaction.notes || '';
    
    // Set type toggle
    const typeRadios = form.querySelectorAll('input[name="editType"]');
    typeRadios.forEach(r => {
      r.checked = (r.value === transaction.type);
    });

    this.editModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeEditModal() {
    if (!this.editModal) return;
    this.editModal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Global UI instance
window.uiController = new UIController();
