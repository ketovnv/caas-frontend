import { Controller } from '@react-spring/web';
import { reaction } from 'mobx';
import {
    panelSpring,
    INPUT_PANEL_HIDDEN,
    INPUT_PANEL_VISIBLE,
    type InputPanelState,
} from '../config';

// ============================================================================
// Input Panel Controller - Animation for email/phone input panel
// ============================================================================

export class InputPanelController {
    private ctrl: Controller<InputPanelState>;
    private disposer: (() => void) | null = null;

    constructor(getInputMode?: () => string | null) {
        this.ctrl = new Controller({
            ...INPUT_PANEL_HIDDEN,
            config: panelSpring,
        });

        // Auto-animate when inputMode changes
        if (getInputMode) {
            this.disposer = reaction(
                () => getInputMode(),
                (mode) => {
                    if (mode) {
                        this.show();
                    } else {
                        this.hide();
                    }
                },
                { fireImmediately: false }
            );
        }
    }

    get opacity() {
        return this.ctrl.springs.opacity;
    }

    get transform() {
        return this.ctrl.springs.y.to(y => `translateY(${y}px)`);
    }

    show() {
        return this.ctrl.start(INPUT_PANEL_VISIBLE);
    }

    hide() {
        return this.ctrl.start(INPUT_PANEL_HIDDEN);
    }

    dispose() {
        this.disposer?.();
        this.disposer = null;
        this.ctrl.stop();
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let _inputPanelController: InputPanelController | null = null;

export function getInputPanelController(getInputMode?: () => string | null): InputPanelController {
    if (!_inputPanelController) {
        _inputPanelController = new InputPanelController(getInputMode);
    }
    return _inputPanelController;
}
