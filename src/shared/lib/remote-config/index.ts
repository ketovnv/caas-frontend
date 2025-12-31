// ============================================================================
// Remote Config Service
// ============================================================================
// Fetches constants from server with caching and fallback

import { makeAutoObservable, runInAction } from 'mobx';
import type { TronConstants } from '../tron/types';
import { DEFAULT_TRON_CONSTANTS } from '../tron/types';

// ============================================================================
// Types
// ============================================================================

export interface RemoteConfig {
  tron: TronConstants;
  version: string;
  updatedAt: number;
}

const DEFAULT_CONFIG: RemoteConfig = {
  tron: DEFAULT_TRON_CONSTANTS,
  version: '1.0.0',
  updatedAt: Date.now(),
};

// Cache key for localStorage
const CACHE_KEY = 'caas_remote_config';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// RemoteConfigStore
// ============================================================================

class RemoteConfigStore {
  config: RemoteConfig = DEFAULT_CONFIG;
  isLoading = false;
  error: string | null = null;
  lastFetchAt: number = 0;

  // Config endpoint (can be changed)
  private _endpoint: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadFromCache();
  }

  /** Set config endpoint URL */
  setEndpoint(url: string) {
    this._endpoint = url;
  }

  /** Get TRON constants */
  get tron(): TronConstants {
    return this.config.tron;
  }

  /** Check if config is stale */
  get isStale(): boolean {
    return Date.now() - this.lastFetchAt > CACHE_TTL;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Cache
  // ─────────────────────────────────────────────────────────────────────────

  private loadFromCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { config: RemoteConfig; fetchedAt: number };
        this.config = { ...DEFAULT_CONFIG, ...parsed.config };
        this.lastFetchAt = parsed.fetchedAt;
        console.log('[RemoteConfig] Loaded from cache, version:', this.config.version);
      }
    } catch (error) {
      console.warn('[RemoteConfig] Failed to load from cache:', error);
    }
  }

  private saveToCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        config: this.config,
        fetchedAt: this.lastFetchAt,
      }));
    } catch (error) {
      console.warn('[RemoteConfig] Failed to save to cache:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fetch config from server
   * @param force - Bypass cache TTL
   */
  async fetch(force = false): Promise<RemoteConfig> {
    // Skip if recently fetched (unless forced)
    if (!force && !this.isStale) {
      return this.config;
    }

    // No endpoint configured - use defaults
    if (!this._endpoint) {
      console.log('[RemoteConfig] No endpoint configured, using defaults');
      return this.config;
    }

    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const response = await fetch(this._endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      runInAction(() => {
        // Merge with defaults to ensure all fields exist
        this.config = {
          ...DEFAULT_CONFIG,
          ...data,
          tron: { ...DEFAULT_TRON_CONSTANTS, ...data.tron },
        };
        this.lastFetchAt = Date.now();
        this.isLoading = false;
      });

      this.saveToCache();
      console.log('[RemoteConfig] Fetched successfully, version:', this.config.version);

      return this.config;

    } catch (error) {
      runInAction(() => {
        this.error = (error as Error).message;
        this.isLoading = false;
      });

      console.error('[RemoteConfig] Fetch failed:', error);

      // Return cached/default config on error
      return this.config;
    }
  }

  /**
   * Update config manually (for testing or local overrides)
   */
  update(partial: Partial<RemoteConfig>) {
    this.config = {
      ...this.config,
      ...partial,
      tron: { ...this.config.tron, ...partial.tron },
      updatedAt: Date.now(),
    };
    this.saveToCache();
  }

  /**
   * Update TRON constants
   */
  updateTron(partial: Partial<TronConstants>) {
    this.config.tron = {
      ...this.config.tron,
      ...partial,
      updatedAt: Date.now(),
    };
    this.saveToCache();
  }

  /**
   * Reset to defaults
   */
  reset() {
    this.config = DEFAULT_CONFIG;
    this.lastFetchAt = 0;
    this.error = null;
    localStorage.removeItem(CACHE_KEY);
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const remoteConfigStore = new RemoteConfigStore();

// ============================================================================
// Initialization Helper
// ============================================================================

/**
 * Initialize remote config with endpoint
 * Call this in app initialization
 */
export function initRemoteConfig(endpoint?: string) {
  if (endpoint) {
    remoteConfigStore.setEndpoint(endpoint);
  }
  return remoteConfigStore.fetch();
}
