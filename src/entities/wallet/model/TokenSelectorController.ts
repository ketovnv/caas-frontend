import { Controller, type SpringConfig } from '@react-spring/web';
import { reaction } from 'mobx';
import {
    ACTIVE_STATE,
    INACTIVE_STATE,
    TOKEN_BUTTON_CONFIG,
    type TokenButtonState,
} from '../config/token-selector.config';
import type { TokenId } from './types';

// ============================================================================
// Token Button Controller - Animation for individual token button
// ============================================================================

export class TokenButtonController {
    private ctrl: Controller<TokenButtonState>;
    private disposer: (() => void) | null = null;

    constructor(
        private tokenId: TokenId,
        private getSelectedToken: () => TokenId,
        config?: SpringConfig
    ) {
        const isActive = getSelectedToken() === tokenId;
        const initial = isActive ? ACTIVE_STATE : INACTIVE_STATE;

        this.ctrl = new Controller({
            ...initial,
            config: config ?? TOKEN_BUTTON_CONFIG,
        });

        // React to selection changes via MobX
        this.disposer = reaction(
            () => this.getSelectedToken() === this.tokenId,
            (isActive) => this.animateTo(isActive),
            { fireImmediately: false }
        );
    }

    // ─────────────────────────────────────────────────────────
    // Getters for animated values
    // ─────────────────────────────────────────────────────────

    get springs() {
        return this.ctrl.springs;
    }

    get transform() {
        return this.ctrl.springs.scale.to((s) => `scale(${s})`);
    }

    get opacity() {
        return this.ctrl.springs.opacity;
    }

    // ─────────────────────────────────────────────────────────
    // Animation methods
    // ─────────────────────────────────────────────────────────

    private setActive(config?: SpringConfig) {
        return this.ctrl.start({
            ...ACTIVE_STATE,
            config: config ?? TOKEN_BUTTON_CONFIG,
        });
    }

    private setInactive(config?: SpringConfig) {
        return this.ctrl.start({
            ...INACTIVE_STATE,
            config: config ?? TOKEN_BUTTON_CONFIG,
        });
    }

    private animateTo(isActive: boolean, config?: SpringConfig) {
        return isActive ? this.setActive(config) : this.setInactive(config);
    }

    // ─────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────

    dispose() {
        this.disposer?.();
        this.disposer = null;
        this.ctrl.stop();
    }
}

// ============================================================================
// Token Selector Store - Manages controllers for all token buttons
// ============================================================================

class TokenSelectorStore {
    private controllers = new Map<TokenId, TokenButtonController>();
    private getSelectedToken: () => TokenId;

    constructor(getSelectedToken: () => TokenId) {
        this.getSelectedToken = getSelectedToken;
    }

    /** Get or create controller for a token */
    getController(tokenId: TokenId): TokenButtonController {
        let ctrl = this.controllers.get(tokenId);
        if (!ctrl) {
            ctrl = new TokenButtonController(tokenId, this.getSelectedToken);
            this.controllers.set(tokenId, ctrl);
        }
        return ctrl;
    }

    /** Dispose all controllers */
    dispose() {
        this.controllers.forEach(ctrl => ctrl.dispose());
        this.controllers.clear();
    }
}

// Singleton - initialized lazily to avoid circular dependency
let _tokenSelectorStore: TokenSelectorStore | null = null;

export function getTokenSelectorStore(getSelectedToken: () => TokenId): TokenSelectorStore {
    if (!_tokenSelectorStore) {
        _tokenSelectorStore = new TokenSelectorStore(getSelectedToken);
    }
    return _tokenSelectorStore;
}
