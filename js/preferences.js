/**
 * Simple Slides - Preferences Manager
 * Handles localStorage persistence for user preferences
 */

const Preferences = {
  STORAGE_KEY: 'simple-slides-preferences',

  defaults: {
    theme: 'light',
    consoleHeight: 150,
    consoleFilters: { log: true, warn: true, error: true },
    codeWidth: 65,
    lastSlide: 0
  },

  /**
   * Load all preferences from localStorage
   * @returns {Object} Merged defaults with saved preferences
   */
  load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...this.defaults, ...parsed };
      }
      return { ...this.defaults };
    } catch (e) {
      console.warn('Preferences: Could not load from localStorage', e);
      return { ...this.defaults };
    }
  },

  /**
   * Save preferences to localStorage
   * @param {Object} prefs - Preferences to merge and save
   */
  save(prefs) {
    try {
      const current = this.load();
      const updated = { ...current, ...prefs };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Preferences: Could not save to localStorage', e);
    }
  },

  /**
   * Get a single preference value
   * @param {string} key - Preference key
   * @returns {*} Preference value or default
   */
  get(key) {
    const prefs = this.load();
    return prefs[key] !== undefined ? prefs[key] : this.defaults[key];
  },

  /**
   * Set a single preference value
   * @param {string} key - Preference key
   * @param {*} value - Value to set
   */
  set(key, value) {
    this.save({ [key]: value });
  },

  /**
   * Reset all preferences to defaults
   */
  reset() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('Preferences: Could not reset localStorage', e);
    }
  }
};

/**
 * Theme Manager - Handles dark/light mode switching
 */
const ThemeManager = {
  /**
   * Initialize theme from saved preference or system preference
   */
  init() {
    const savedTheme = Preferences.get('theme');

    // Check system preference if no saved theme
    if (!localStorage.getItem(Preferences.STORAGE_KEY)) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light', false);
    } else {
      this.setTheme(savedTheme, false);
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const manuallySet = localStorage.getItem(Preferences.STORAGE_KEY);
      if (!manuallySet) {
        this.setTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  },

  /**
   * Set the theme
   * @param {string} theme - 'light' or 'dark'
   * @param {boolean} save - Whether to save preference (default: true)
   */
  setTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);

    if (save) {
      Preferences.set('theme', theme);
    }

    // Update theme toggle button icon
    this.updateToggleIcon(theme);

    // Update CodeMirror instances
    this.updateCodeMirrorTheme(theme);

    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  },

  /**
   * Toggle between light and dark themes
   */
  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  },

  /**
   * Get current theme
   * @returns {string} Current theme ('light' or 'dark')
   */
  getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  /**
   * Update the toggle button icon
   * @param {string} theme - Current theme
   */
  updateToggleIcon(theme) {
    const toggleBtn = document.querySelector('#theme-toggle i');
    if (toggleBtn) {
      toggleBtn.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  },

  /**
   * Update CodeMirror editor themes
   * @param {string} theme - Current theme
   */
  updateCodeMirrorTheme(theme) {
    const cmTheme = theme === 'dark' ? 'material-darker' : 'default';

    // Update all CodeMirror instances
    document.querySelectorAll('.CodeMirror').forEach(el => {
      if (el.CodeMirror) {
        el.CodeMirror.setOption('theme', cmTheme);
      }
    });
  }
};

// Export for global access
window.Preferences = Preferences;
window.ThemeManager = ThemeManager;
