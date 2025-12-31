// ============================================================================
// Settings Store - UI Settings & Persistence
// ============================================================================

import { makeAutoObservable } from 'mobx';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'caas_settings';

interface SettingsData {
  showNetworkBadge: boolean;
  showFpsMonitor: boolean;
}

const DEFAULT_SETTINGS: SettingsData = {
  showNetworkBadge: true,
  showFpsMonitor: false,
};

// ============================================================================
// SettingsStore
// ============================================================================

class SettingsStore {
  /** Show network badge in header */
  showNetworkBadge = DEFAULT_SETTINGS.showNetworkBadge;

  /** Show FPS monitor overlay */
  showFpsMonitor = DEFAULT_SETTINGS.showFpsMonitor;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  /** Toggle network badge visibility */
  toggleNetworkBadge = () => {
    this.showNetworkBadge = !this.showNetworkBadge;
    this.saveToStorage();
  };

  /** Set network badge visibility */
  setShowNetworkBadge = (value: boolean) => {
    this.showNetworkBadge = value;
    this.saveToStorage();
  };

  /** Toggle FPS monitor visibility */
  toggleFpsMonitor = () => {
    this.showFpsMonitor = !this.showFpsMonitor;
    this.saveToStorage();
  };

  /** Set FPS monitor visibility */
  setShowFpsMonitor = (value: boolean) => {
    this.showFpsMonitor = value;
    this.saveToStorage();
  };

  /** Reset to defaults */
  resetToDefaults = () => {
    this.showNetworkBadge = DEFAULT_SETTINGS.showNetworkBadge;
    this.showFpsMonitor = DEFAULT_SETTINGS.showFpsMonitor;
    this.saveToStorage();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Persistence
  // ─────────────────────────────────────────────────────────────────────────

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as Partial<SettingsData>;
        if (typeof data.showNetworkBadge === 'boolean') {
          this.showNetworkBadge = data.showNetworkBadge;
        }
        if (typeof data.showFpsMonitor === 'boolean') {
          this.showFpsMonitor = data.showFpsMonitor;
        }
      }
    } catch (error) {
      console.warn('[SettingsStore] Failed to load from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const data: SettingsData = {
        showNetworkBadge: this.showNetworkBadge,
        showFpsMonitor: this.showFpsMonitor,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('[SettingsStore] Failed to save to storage:', error);
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const settingsStore = new SettingsStore();
