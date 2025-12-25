import {makeAutoObservable, reaction, runInAction} from 'mobx';
import {App} from '@capacitor/app';
import type {
    Route,
    RouteParams,
    NavigateOptions,
    TransitionDirection,
    TransitionConfig,
} from 'app/router';
import {
    routeConfigs,
    getTransitionConfig,
    DEFAULT_ROUTE,
    AUTH_REDIRECT_ROUTE,
} from 'app/router/config';

/**
 * MobX Router Store with animation support and Capacitor integration
 *
 * Usage:
 *   import { router } from 'shared/lib/router';
 *   router.navigate('wallet');
 *   router.setAuthenticated(true);
 */
class RouterStore {
    // Current state
    currentRoute: Route = DEFAULT_ROUTE;
    previousRoute: Route | null = null;
    params: RouteParams = {};

    // Auth state (set from Web3Auth)
    isAuthenticated = false;

    // Animation state
    isTransitioning = false;
    transitionDirection: TransitionDirection = 'none';

    // History stack for mobile back navigation
    private historyStack: Route[] = [];
    private maxHistoryLength = 50;

    // Cleanup functions
    private disposers: Array<() => void> = [];

    constructor() {
        makeAutoObservable<RouterStore, 'historyStack' | 'disposers' | 'maxHistoryLength'>(this, {
            historyStack: false,
            disposers: false,
            maxHistoryLength: false,
        });

        this.initFromUrl();
    }


    private parseParamsFromUrl(): RouteParams {
        if (typeof window === 'undefined') return {};
        const searchParams = new URLSearchParams(window.location.search);
        const params: RouteParams = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }

    // ─────────────────────────────────────────────────────────────
    // Computed
    // ─────────────────────────────────────────────────────────────

    get transitionConfig(): TransitionConfig {
        return getTransitionConfig(this.previousRoute, this.currentRoute);
    }

    get canGoBack(): boolean {
        return this.historyStack.length > 1;
    }

    get currentRouteConfig() {
        return routeConfigs[this.currentRoute];
    }

    // ─────────────────────────────────────────────────────────────
    // Auth
    // ─────────────────────────────────────────────────────────────

    setAuthenticated(value: boolean) {
        this.isAuthenticated = value;
    }

    // ─────────────────────────────────────────────────────────────
    // Navigation
    // ─────────────────────────────────────────────────────────────

    navigate(route: Route, params: RouteParams = {}, options: NavigateOptions = {}) {
        if (route === this.currentRoute && this.paramsEqual(params)) {
            return;
        }

        // Check auth guard
        if (!this.canAccessRoute(route)) {
            const config = routeConfigs[route];
            const redirectTo = config.redirectTo ?? AUTH_REDIRECT_ROUTE;
            this.navigate(redirectTo, {}, {replace: true});
            return;
        }

        const direction = this.getDirection(route);

        runInAction(() => {
            this.previousRoute = this.currentRoute;
            this.currentRoute = route;
            this.params = params;
            this.transitionDirection = options.skipAnimation ? 'none' : direction;
            this.isTransitioning = !options.skipAnimation;

            if (options.replace && this.historyStack.length > 0) {
                this.historyStack[this.historyStack.length - 1] = route;
            } else {
                this.historyStack.push(route);
                if (this.historyStack.length > this.maxHistoryLength) {
                    this.historyStack.shift();
                }
            }
        });


        //опасное место, нужен императивный подход
        if (!options.skipAnimation) {
            setTimeout(() => {
                runInAction(() => {
                    this.isTransitioning = false;
                });
            }, this.transitionConfig.duration);
        }
    }

    back() {
        if (!this.canGoBack) return;

        this.historyStack.pop();
        const previousRoute = this.historyStack[this.historyStack.length - 1];

        if (previousRoute) {
            runInAction(() => {
                this.previousRoute = this.currentRoute;
                this.currentRoute = previousRoute;
                this.transitionDirection = 'back';
                this.isTransitioning = true;
            });

            setTimeout(() => {
                runInAction(() => {
                    this.isTransitioning = false;
                });
            }, this.transitionConfig.duration);
        }
    }

    replace(route: Route, params: RouteParams = {}) {
        this.navigate(route, params, {replace: true});
    }

    // ─────────────────────────────────────────────────────────────
    // Guards
    // ─────────────────────────────────────────────────────────────

    canAccessRoute(route: Route): boolean {
        const config = routeConfigs[route];
        if (!config) return true;

        if (config.requiresAuth && !this.isAuthenticated) {
            return false;
        }

        return true;
    }

    // ─────────────────────────────────────────────────────────────
    // Browser & Capacitor Sync
    // ─────────────────────────────────────────────────────────────

    /**
     * Setup browser history and Capacitor back button
     * Call once on app start
     */
    setup() {
        this.setupBrowserSync();
        this.setupCapacitorBackButton();
        return () => this.dispose();
    }

    dispose() {
        this.disposers.forEach((fn) => fn());
        this.disposers = [];
    }

    private setupBrowserSync() {
        if (typeof window === 'undefined') return;

        const disposeReaction = reaction(
            () => ({route: this.currentRoute, params: this.params}),
            ({route, params}) => {
                const url = this.buildUrl(route, params);

                if (this.transitionDirection === 'back') {
                    window.history.replaceState({route}, '', url);
                } else {
                    window.history.pushState({route}, '', url);
                }

                const config = routeConfigs[route];
                if (config?.title) {
                    document.title = config.title;
                }
            }
        );

        const handlePopState = (event: PopStateEvent) => {
            const route = event.state?.route || this.parseRouteFromUrl();
            if (route && route !== this.currentRoute) {
                runInAction(() => {
                    this.previousRoute = this.currentRoute;
                    this.currentRoute = route;
                    this.transitionDirection = 'back';
                    this.isTransitioning = true;

                    const index = this.historyStack.lastIndexOf(route);
                    if (index !== -1) {
                        this.historyStack = this.historyStack.slice(0, index + 1);
                    }
                });

                setTimeout(() => {
                    runInAction(() => {
                        this.isTransitioning = false;
                    });
                }, this.transitionConfig.duration);
            }
        };

        window.addEventListener('popstate', handlePopState);

        this.disposers.push(() => {
            disposeReaction();
            window.removeEventListener('popstate', handlePopState);
        });
    }

    private async setupCapacitorBackButton() {
        try {
            const handle = await App.addListener('backButton', () => {
                if (this.canGoBack) {
                    this.back();
                } else {
                    App.exitApp();
                }
            });
            this.disposers.push(() => handle.remove());
        } catch {
            // Not in Capacitor
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    private initFromUrl() {
        if (typeof window === 'undefined') return;

        const route = this.parseRouteFromUrl(); // Твоя логика (можно улучшить для /id)
        const params = this.parseParamsFromUrl(); // <--- Забираем параметры

        runInAction(() => {
            this.currentRoute = route;
            this.params = params; // <--- Сохраняем
            this.historyStack = [route];
        });

        // Синхроним обратно, чтобы URL был чистым
        window.history.replaceState({route}, '', this.buildUrl(route, params));
    }

    private parseRouteFromUrl(): Route {
        const path = window.location.pathname.slice(1) || DEFAULT_ROUTE;
        return path in routeConfigs ? (path as Route) : 'not-found';
    }

    private buildUrl(route: Route, params: RouteParams): string {
        const base = `/${route === DEFAULT_ROUTE ? '' : route}`;
        const query = this.buildQueryString(params);
        return base + query;
    }

    private buildQueryString(params: RouteParams): string {
        const entries = Object.entries(params);
        if (entries.length === 0) return '';
        return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    }

    private paramsEqual(params: RouteParams): boolean {
        const keys = Object.keys(this.params);
        if (keys.length !== Object.keys(params).length) return false;
        return keys.every((k) => this.params[k] === params[k]);
    }

    private getDirection(toRoute: Route): TransitionDirection {
        const index = this.historyStack.lastIndexOf(toRoute);
        return index !== -1 && index < this.historyStack.length - 1 ? 'back' : 'forward';
    }
}

// Singleton
export const router = new RouterStore();
