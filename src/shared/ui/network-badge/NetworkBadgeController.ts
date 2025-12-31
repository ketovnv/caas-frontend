import { makeAutoObservable, runInAction } from 'mobx';
import { Controller } from '@react-spring/web';
import { networkStore } from 'shared/model';
import type { NetworkId } from 'entities/wallet/config/networks.config';
import {
    DROPDOWN_HIDDEN,
    DROPDOWN_VISIBLE,
    PULSE_NORMAL,
    PULSE_SWITCHING,
    DROPDOWN_CONFIG,
    PULSE_CONFIG,
} from './network-badge.config';

// ============================================================================
// NetworkBadgeController - Manages dropdown state and animations
// ============================================================================

interface DropdownState {
    opacity: number;
    y: number;
}

interface PulseState {
    scale: number;
}

export class NetworkBadgeController {
    /** Dropdown open state */
    isOpen = false;

    /** Reference to container element for click-outside detection */
    private _containerEl: HTMLElement | null = null;

    /** Bound handler for click outside */
    private _handleClickOutside: ((e: MouseEvent) => void) | null = null;

    /** Dropdown animation controller */
    readonly dropdownCtrl = new Controller<DropdownState>(DROPDOWN_HIDDEN);

    /** Pulse animation controller */
    readonly pulseCtrl = new Controller<PulseState>(PULSE_NORMAL);

    constructor() {
        makeAutoObservable<NetworkBadgeController, '_containerEl' | '_handleClickOutside'>(this, {
            dropdownCtrl: false,
            pulseCtrl: false,
            _containerEl: false,
            _handleClickOutside: false,
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Getters for animated styles
    // ─────────────────────────────────────────────────────────────────────────

    /** Dropdown style object */
    get dropdownStyle() {
        return {
            opacity: this.dropdownCtrl.springs.opacity,
            transform: this.dropdownCtrl.springs.y.to(y => `translateY(${y}px)`),
        };
    }

    /** Button scale transform */
    get buttonTransform() {
        return this.pulseCtrl.springs.scale.to(s => `scale(${s})`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Actions
    // ─────────────────────────────────────────────────────────────────────────

    /** Set container element reference */
    setContainerRef = (el: HTMLElement | null) => {
        this._containerEl = el;
    };

    /** Toggle dropdown */
    toggle = () => {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    };

    /** Open dropdown */
    open = () => {
        runInAction(() => {
            this.isOpen = true;
        });
        this.dropdownCtrl.start({ ...DROPDOWN_VISIBLE, config: DROPDOWN_CONFIG });
        this._addClickOutsideListener();
    };

    /** Close dropdown */
    close = () => {
        runInAction(() => {
            this.isOpen = false;
        });
        this.dropdownCtrl.start({ ...DROPDOWN_HIDDEN, config: DROPDOWN_CONFIG });
        this._removeClickOutsideListener();
    };

    /** Handle network selection */
    selectNetwork = async (networkId: NetworkId) => {
        this.close();
        await networkStore.setNetwork(networkId);
    };

    /** Update pulse animation based on switching state */
    updatePulse = (isSwitching: boolean) => {
        const target = isSwitching ? PULSE_SWITCHING : PULSE_NORMAL;
        this.pulseCtrl.start({ ...target, config: PULSE_CONFIG });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Click Outside Handling
    // ─────────────────────────────────────────────────────────────────────────

    private _addClickOutsideListener = () => {
        if (this._handleClickOutside) return;

        this._handleClickOutside = (event: MouseEvent) => {
            if (this._containerEl && !this._containerEl.contains(event.target as Node)) {
                this.close();
            }
        };

        document.addEventListener('mousedown', this._handleClickOutside);
    };

    private _removeClickOutsideListener = () => {
        if (this._handleClickOutside) {
            document.removeEventListener('mousedown', this._handleClickOutside);
            this._handleClickOutside = null;
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Cleanup
    // ─────────────────────────────────────────────────────────────────────────

    /** Dispose controller */
    dispose = () => {
        this._removeClickOutsideListener();
        this.dropdownCtrl.stop();
        this.pulseCtrl.stop();
    };
}
