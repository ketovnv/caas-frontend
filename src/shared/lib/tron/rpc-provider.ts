// ============================================================================
// TRON RPC Provider Manager
// ============================================================================
// Manages multiple RPC providers with rate limiting, health checks, and fallback

import { TronWeb } from 'tronweb';
import { makeAutoObservable, runInAction } from 'mobx';

// ============================================================================
// Types
// ============================================================================

export interface RpcProviderConfig {
  /** Unique provider ID */
  id: string;
  /** Provider name for display */
  name: string;
  /** RPC endpoint URL */
  url: string;
  /** Max requests per second (0 = unlimited) */
  rateLimit: number;
  /** Priority (lower = higher priority) */
  priority: number;
  /** Is this provider enabled */
  enabled: boolean;
  /** API key if required */
  apiKey?: string;
}

export interface ProviderHealth {
  /** Provider ID */
  id: string;
  /** Is provider healthy */
  isHealthy: boolean;
  /** Last successful request timestamp */
  lastSuccess: number;
  /** Last error timestamp */
  lastError: number;
  /** Last error message */
  lastErrorMessage: string | null;
  /** Request count in current window */
  requestCount: number;
  /** Window start timestamp */
  windowStart: number;
  /** Average response time (ms) */
  avgResponseTime: number;
  /** Total requests made */
  totalRequests: number;
  /** Total errors */
  totalErrors: number;
}

export interface RpcProviderStats {
  /** Current active provider ID */
  activeProviderId: string;
  /** Provider health map */
  health: Map<string, ProviderHealth>;
  /** Total requests across all providers */
  totalRequests: number;
  /** Total errors across all providers */
  totalErrors: number;
}

// ============================================================================
// Default Providers
// ============================================================================

/** Nile Testnet providers */
export const NILE_TESTNET_PROVIDERS: RpcProviderConfig[] = [
  {
    id: 'trongrid-nile',
    name: 'TronGrid Nile',
    url: 'https://nile.trongrid.io',
    rateLimit: 15, // 15 req/sec for free tier
    priority: 1,
    enabled: true,
  },
  {
    id: 'nileex',
    name: 'NileEx',
    url: 'https://api.nileex.io',
    rateLimit: 10,
    priority: 2,
    enabled: true,
  },
];

/** Shasta Testnet providers */
export const SHASTA_TESTNET_PROVIDERS: RpcProviderConfig[] = [
  {
    id: 'trongrid-shasta',
    name: 'TronGrid Shasta',
    url: 'https://api.shasta.trongrid.io',
    rateLimit: 15,
    priority: 1,
    enabled: true,
  },
];

/** Mainnet providers */
export const MAINNET_PROVIDERS: RpcProviderConfig[] = [
  {
    id: 'trongrid-mainnet',
    name: 'TronGrid Mainnet',
    url: 'https://api.trongrid.io',
    rateLimit: 15,
    priority: 1,
    enabled: true,
  },
  // QuickNode can be added here with API key
];

// ============================================================================
// RpcProviderManager
// ============================================================================

class RpcProviderManager {
  /** Available providers */
  private _providers: RpcProviderConfig[] = [];

  /** Provider health status */
  private _health: Map<string, ProviderHealth> = new Map();

  /** TronWeb instances per provider */
  private _tronWebInstances: Map<string, TronWeb> = new Map();

  /** Currently active provider ID */
  private _activeProviderId: string | null = null;

  /** Rate limit window duration (ms) */
  private readonly RATE_LIMIT_WINDOW = 1000;

  /** Health check interval (ms) */
  private readonly HEALTH_CHECK_INTERVAL = 30000;

  /** Max consecutive errors before marking unhealthy */
  private readonly MAX_CONSECUTIVE_ERRORS = 3;

  /** Cooldown after provider marked unhealthy (ms) */
  private readonly UNHEALTHY_COOLDOWN = 60000;

  /** Health check timer */
  private _healthCheckTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    makeAutoObservable<RpcProviderManager, '_tronWebInstances' | '_healthCheckTimer'>(this, {
      _tronWebInstances: false,
      _healthCheckTimer: false,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────────────────────────────────

  /** Get all providers */
  get providers(): RpcProviderConfig[] {
    return this._providers;
  }

  /** Get enabled providers sorted by priority */
  get enabledProviders(): RpcProviderConfig[] {
    return this._providers
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /** Get current active provider */
  get activeProvider(): RpcProviderConfig | null {
    if (!this._activeProviderId) return null;
    return this._providers.find(p => p.id === this._activeProviderId) || null;
  }

  /** Get active provider ID */
  get activeProviderId(): string | null {
    return this._activeProviderId;
  }

  /** Get provider health map */
  get health(): Map<string, ProviderHealth> {
    return this._health;
  }

  /** Get stats for all providers */
  get stats(): RpcProviderStats {
    let totalRequests = 0;
    let totalErrors = 0;

    this._health.forEach(h => {
      totalRequests += h.totalRequests;
      totalErrors += h.totalErrors;
    });

    return {
      activeProviderId: this._activeProviderId || '',
      health: this._health,
      totalRequests,
      totalErrors,
    };
  }

  /** Check if we can make a request (within rate limits) */
  get canMakeRequest(): boolean {
    const provider = this.activeProvider;
    if (!provider) return false;

    const health = this._health.get(provider.id);
    if (!health || !health.isHealthy) return false;

    // Check rate limit
    if (provider.rateLimit > 0) {
      const now = Date.now();
      if (now - health.windowStart < this.RATE_LIMIT_WINDOW) {
        return health.requestCount < provider.rateLimit;
      }
    }

    return true;
  }

  /** Get remaining requests in current window */
  get remainingRequests(): number {
    const provider = this.activeProvider;
    if (!provider || provider.rateLimit === 0) return Infinity;

    const health = this._health.get(provider.id);
    if (!health) return 0;

    const now = Date.now();
    if (now - health.windowStart >= this.RATE_LIMIT_WINDOW) {
      return provider.rateLimit;
    }

    return Math.max(0, provider.rateLimit - health.requestCount);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initialize with providers
   */
  initialize(providers: RpcProviderConfig[] = NILE_TESTNET_PROVIDERS) {
    runInAction(() => {
      this._providers = [...providers];
      this._health.clear();
      this._tronWebInstances.clear();

      // Initialize health for each provider
      providers.forEach(p => {
        this._health.set(p.id, this.createInitialHealth(p.id));
        this._tronWebInstances.set(p.id, new TronWeb({ fullHost: p.url }));
      });

      // Set active to highest priority enabled provider
      const first = this.enabledProviders[0];
      this._activeProviderId = first?.id || null;
    });

    // Start health checks
    this.startHealthChecks();

    console.log('[RpcProviderManager] Initialized with providers:', providers.map(p => p.name));
  }

  /**
   * Add a custom provider (e.g., QuickNode)
   */
  addProvider(config: RpcProviderConfig) {
    runInAction(() => {
      // Remove existing with same ID
      this._providers = this._providers.filter(p => p.id !== config.id);
      this._providers.push(config);

      // Initialize health
      this._health.set(config.id, this.createInitialHealth(config.id));

      // Create TronWeb instance
      const tronWebConfig: any = { fullHost: config.url };
      if (config.apiKey) {
        tronWebConfig.headers = { 'TRON-PRO-API-KEY': config.apiKey };
      }
      this._tronWebInstances.set(config.id, new TronWeb(tronWebConfig));
    });

    console.log('[RpcProviderManager] Added provider:', config.name);
  }

  /**
   * Add QuickNode provider
   */
  addQuickNode(endpoint: string, apiKey?: string) {
    this.addProvider({
      id: 'quicknode',
      name: 'QuickNode',
      url: endpoint,
      rateLimit: 50, // QuickNode typically has higher limits
      priority: 0,   // Highest priority
      enabled: true,
      apiKey,
    });
  }

  private createInitialHealth(id: string): ProviderHealth {
    return {
      id,
      isHealthy: true,
      lastSuccess: 0,
      lastError: 0,
      lastErrorMessage: null,
      requestCount: 0,
      windowStart: Date.now(),
      avgResponseTime: 0,
      totalRequests: 0,
      totalErrors: 0,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TronWeb Access
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get TronWeb instance for active provider
   */
  getTronWeb(): TronWeb {
    const providerId = this._activeProviderId;
    if (!providerId) {
      throw new Error('No active RPC provider');
    }

    const instance = this._tronWebInstances.get(providerId);
    if (!instance) {
      throw new Error(`TronWeb instance not found for provider: ${providerId}`);
    }

    return instance;
  }

  /**
   * Get TronWeb instance with private key
   */
  getTronWebWithKey(privateKey: string): TronWeb {
    const provider = this.activeProvider;
    if (!provider) {
      throw new Error('No active RPC provider');
    }

    const config: any = {
      fullHost: provider.url,
      privateKey,
    };

    if (provider.apiKey) {
      config.headers = { 'TRON-PRO-API-KEY': provider.apiKey };
    }

    return new TronWeb(config);
  }

  /**
   * Execute a request with automatic rate limiting and fallback
   */
  async executeRequest<T>(
    request: (tronWeb: TronWeb) => Promise<T>,
    options?: { timeout?: number; retries?: number }
  ): Promise<T> {
    const { timeout = 10000, retries = 2 } = options || {};

    let lastError: Error | null = null;
    let attemptedProviders: string[] = [];

    // Try each provider in priority order
    for (const provider of this.enabledProviders) {
      if (attemptedProviders.includes(provider.id)) continue;

      const health = this._health.get(provider.id);
      if (!health) continue;

      // Skip unhealthy providers (with cooldown check)
      if (!health.isHealthy) {
        const cooldownExpired = Date.now() - health.lastError > this.UNHEALTHY_COOLDOWN;
        if (!cooldownExpired) continue;
        // Reset health to try again
        runInAction(() => {
          health.isHealthy = true;
        });
      }

      // Check rate limit
      if (!this.checkRateLimit(provider.id)) {
        console.log(`[RpcProviderManager] Rate limit reached for ${provider.name}, trying next...`);
        continue;
      }

      attemptedProviders.push(provider.id);

      // Switch to this provider
      runInAction(() => {
        this._activeProviderId = provider.id;
      });

      // Try request with retries
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const tronWeb = this._tronWebInstances.get(provider.id);
          if (!tronWeb) continue;

          // Record request start
          this.recordRequestStart(provider.id);
          const startTime = Date.now();

          // Execute with timeout
          const result = await Promise.race([
            request(tronWeb),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            ),
          ]);

          // Record success
          this.recordRequestSuccess(provider.id, Date.now() - startTime);

          return result;

        } catch (error) {
          lastError = error as Error;
          this.recordRequestError(provider.id, lastError.message);

          // Don't retry on certain errors
          if (this.isNonRetryableError(lastError)) {
            break;
          }

          // Wait before retry
          if (attempt < retries) {
            await this.delay(Math.pow(2, attempt) * 500);
          }
        }
      }
    }

    throw lastError || new Error('All RPC providers failed');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Rate Limiting
  // ─────────────────────────────────────────────────────────────────────────

  private checkRateLimit(providerId: string): boolean {
    const provider = this._providers.find(p => p.id === providerId);
    const health = this._health.get(providerId);

    if (!provider || !health) return false;
    if (provider.rateLimit === 0) return true; // Unlimited

    const now = Date.now();

    // Reset window if expired
    if (now - health.windowStart >= this.RATE_LIMIT_WINDOW) {
      runInAction(() => {
        health.windowStart = now;
        health.requestCount = 0;
      });
      return true;
    }

    return health.requestCount < provider.rateLimit;
  }

  private recordRequestStart(providerId: string) {
    const health = this._health.get(providerId);
    if (!health) return;

    const now = Date.now();

    runInAction(() => {
      // Reset window if needed
      if (now - health.windowStart >= this.RATE_LIMIT_WINDOW) {
        health.windowStart = now;
        health.requestCount = 1;
      } else {
        health.requestCount++;
      }
      health.totalRequests++;
    });
  }

  private recordRequestSuccess(providerId: string, responseTime: number) {
    const health = this._health.get(providerId);
    if (!health) return;

    runInAction(() => {
      health.isHealthy = true;
      health.lastSuccess = Date.now();
      // Rolling average
      health.avgResponseTime = health.avgResponseTime === 0
        ? responseTime
        : (health.avgResponseTime * 0.9 + responseTime * 0.1);
    });
  }

  private recordRequestError(providerId: string, errorMessage: string) {
    const health = this._health.get(providerId);
    if (!health) return;

    runInAction(() => {
      health.lastError = Date.now();
      health.lastErrorMessage = errorMessage;
      health.totalErrors++;

      // Mark unhealthy after consecutive errors
      const recentErrors = health.totalErrors;
      const timeSinceSuccess = Date.now() - health.lastSuccess;

      if (recentErrors >= this.MAX_CONSECUTIVE_ERRORS || timeSinceSuccess > 60000) {
        health.isHealthy = false;
        console.warn(`[RpcProviderManager] Provider ${providerId} marked unhealthy: ${errorMessage}`);
      }
    });
  }

  private isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes('invalid address') ||
      message.includes('invalid parameter') ||
      message.includes('contract not found')
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Health Checks
  // ─────────────────────────────────────────────────────────────────────────

  private startHealthChecks() {
    if (this._healthCheckTimer) {
      clearInterval(this._healthCheckTimer);
    }

    this._healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  private async performHealthChecks() {
    for (const provider of this._providers) {
      if (!provider.enabled) continue;

      const tronWeb = this._tronWebInstances.get(provider.id);
      if (!tronWeb) continue;

      try {
        const startTime = Date.now();
        await tronWeb.trx.getCurrentBlock();
        const responseTime = Date.now() - startTime;

        this.recordRequestSuccess(provider.id, responseTime);

      } catch (error) {
        this.recordRequestError(provider.id, (error as Error).message);
      }
    }
  }

  /**
   * Force health check for all providers
   */
  async checkHealth(): Promise<Map<string, ProviderHealth>> {
    await this.performHealthChecks();
    return this._health;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────────────────

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enable/disable a provider
   */
  setProviderEnabled(providerId: string, enabled: boolean) {
    runInAction(() => {
      const provider = this._providers.find(p => p.id === providerId);
      if (provider) {
        provider.enabled = enabled;

        // Switch active if current provider was disabled
        if (!enabled && this._activeProviderId === providerId) {
          const next = this.enabledProviders[0];
          this._activeProviderId = next?.id || null;
        }
      }
    });
  }

  /**
   * Set provider priority
   */
  setProviderPriority(providerId: string, priority: number) {
    runInAction(() => {
      const provider = this._providers.find(p => p.id === providerId);
      if (provider) {
        provider.priority = priority;
      }
    });
  }

  /**
   * Reset all health stats
   */
  resetStats() {
    runInAction(() => {
      this._health.forEach((health, id) => {
        Object.assign(health, this.createInitialHealth(id));
      });
    });
  }

  /**
   * Cleanup
   */
  dispose() {
    if (this._healthCheckTimer) {
      clearInterval(this._healthCheckTimer);
      this._healthCheckTimer = null;
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const rpcProviderManager = new RpcProviderManager();

// Initialize with default testnet providers
rpcProviderManager.initialize(NILE_TESTNET_PROVIDERS);
