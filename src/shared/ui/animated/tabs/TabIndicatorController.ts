import {Controller} from '@react-spring/core';
import {makeAutoObservable} from 'mobx';
import {
    stiffSpring,
    INDICATOR_INITIAL,
    type IndicatorState,
    type TabItem,
} from './tab-indicator.config';

// Re-export TabItem for consumers
export type {TabItem};

// ============================================================================
// Tab Indicator Controller (with MobX state)
// ============================================================================

export class TabIndicatorController {
    // ─────────────────────────────────────────────────────────────────────────
    // MobX Observable State
    // ─────────────────────────────────────────────────────────────────────────

    activeTabId = '';

    // ─────────────────────────────────────────────────────────────────────────
    // Internal State
    // ─────────────────────────────────────────────────────────────────────────

    private ctrl: Controller<IndicatorState>;
    private tabs: TabItem[] = [];
    private tabElements = new Map<string, HTMLButtonElement>();
    private containerElement: HTMLElement | null = null;

    constructor(tabs: TabItem[] = [], defaultTabId?: string) {
        this.tabs = tabs;
        this.activeTabId = defaultTabId || tabs[0]?.id || '';

        this.ctrl = new Controller({
            ...INDICATOR_INITIAL,
            config: stiffSpring,
        });

        makeAutoObservable<this, 'ctrl' | 'tabs' | 'tabElements' | 'containerElement'>(
            this,
            {
                ctrl: false,
                tabs: false,
                tabElements: false,
                containerElement: false,
            },
            {autoBind: true}
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Computed
    // ─────────────────────────────────────────────────────────────────────────

    get currentIndex() {
        return this.tabs.findIndex((t) => t.id === this.activeTabId);
    }

    get canGoNext() {
        const nextIndex = this.currentIndex + 1;
        return nextIndex < this.tabs.length && !this.tabs[nextIndex]?.disabled;
    }

    get canGoPrev() {
        const prevIndex = this.currentIndex - 1;
        return prevIndex >= 0 && !this.tabs[prevIndex]?.disabled;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Animated Values
    // ─────────────────────────────────────────────────────────────────────────

    get springs() {
        return this.ctrl.springs;
    }

    get x() {
        return this.ctrl.springs.x;
    }

    get width() {
        return this.ctrl.springs.width;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tab Registration
    // ─────────────────────────────────────────────────────────────────────────

    setContainer(element: HTMLElement | null) {
        this.containerElement = element;
    }

    registerTab(id: string, element: HTMLButtonElement | null) {
        if (element) {
            this.tabElements.set(id, element);
            // Initialize indicator position if this is the active tab
            if (id === this.activeTabId) {
                requestAnimationFrame(() => this.updateIndicator());
            }
        } else {
            this.tabElements.delete(id);
        }
    }

    setTabs(tabs: TabItem[]) {
        this.tabs = tabs;
        // Reset to first tab if current doesn't exist
        if (!tabs.find((t) => t.id === this.activeTabId)) {
            this.activeTabId = tabs[0]?.id || '';
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Navigation
    // ─────────────────────────────────────────────────────────────────────────

    switchTo(tabId: string) {
        const tab = this.tabs.find((t) => t.id === tabId);
        if (!tab || tab.disabled) return false;

        this.activeTabId = tabId;
        this.updateIndicator();
        return true;
    }

    next() {
        const nextIndex = (this.currentIndex + 1) % this.tabs.length;
        const nextTab = this.tabs[nextIndex];
        if (nextTab && !nextTab.disabled) {
            return this.switchTo(nextTab.id);
        }
        return false;
    }

    prev() {
        const prevIndex = (this.currentIndex - 1 + this.tabs.length) % this.tabs.length;
        const prevTab = this.tabs[prevIndex];
        if (prevTab && !prevTab.disabled) {
            return this.switchTo(prevTab.id);
        }
        return false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Indicator Animation
    // ─────────────────────────────────────────────────────────────────────────

    private updateIndicator() {
        const button = this.tabElements.get(this.activeTabId);
        const container = this.containerElement;
        if (!button || !container) return;

        const containerRect = container.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();

        this.ctrl.start({
            x: buttonRect.left - containerRect.left,
            width: buttonRect.width,
            config: stiffSpring,
        });
    }

    /** Force update indicator position (e.g., after resize) */
    refresh() {
        this.updateIndicator();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    dispose() {
        this.ctrl.stop();
        this.tabElements.clear();
    }
}
