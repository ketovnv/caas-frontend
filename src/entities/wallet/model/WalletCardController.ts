import { makeAutoObservable, reaction } from 'mobx';
import { Controller } from '@react-spring/web';
import { CARD_FLIP_CONFIG, CARD_FLIPPED_SCALE, CARD_DEFAULT_SCALE } from '../config/wallet-card.config';
import { walletStore } from './wallet.store';
import type { TokenId } from './types';

// ============================================================================
// WalletCard Controller - Animation & State Management
// ============================================================================

interface FlipSpringState {
  rotation: number;
  scale: number;
}

export class WalletCardController {
  // ─────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────

  /** Is card flipped (false = TRX, true = USDT) */
  isFlipped = false;

  /** Is flip locked (clicked) */
  isLocked = false;

  /** Is mobile device */
  isMobile = false;

  /** Spring controller */
  private springCtrl: Controller<FlipSpringState>;

  /** Cleanup functions */
  private disposers: (() => void)[] = [];

  // ─────────────────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────────────────

  constructor() {
    // Initialize spring
    this.springCtrl = new Controller<FlipSpringState>({
      rotation: 0,
      scale: CARD_DEFAULT_SCALE,
      config: CARD_FLIP_CONFIG,
    });

    makeAutoObservable<WalletCardController, 'springCtrl' | 'disposers'>(this, {
      springCtrl: false,
      disposers: false,
    });

    // Detect mobile on init
    this.checkMobile();

    // Listen to resize
    window.addEventListener('resize', this.checkMobile);
    this.disposers.push(() => window.removeEventListener('resize', this.checkMobile));

    // Sync spring with isFlipped
    const disposeReaction = reaction(
      () => this.isFlipped,
      (flipped) => {
        this.springCtrl.start({
          rotation: flipped ? 180 : 0,
          scale: flipped ? CARD_FLIPPED_SCALE : CARD_DEFAULT_SCALE,
          config: CARD_FLIP_CONFIG,
        });
        // Sync with walletStore
        walletStore.setSelectedToken(this.currentToken);
      }
    );
    this.disposers.push(disposeReaction);
  }

  // ─────────────────────────────────────────────────────────
  // Computed
  // ─────────────────────────────────────────────────────────

  /** Current token based on flip state */
  get currentToken(): TokenId {
    return this.isFlipped ? 'usdt' : 'native';
  }

  /** Spring values for animation */
  get springs() {
    return this.springCtrl.springs;
  }

  /** Rotation transform */
  get rotationTransform() {
    return this.springs.rotation.to((r) => `rotateY(${r}deg)`);
  }

  /** Scale value */
  get scaleValue() {
    return this.springs.scale;
  }

  /** Hint text */
  get hintText(): string {
    if (this.isMobile) return 'Tap to flip';
    if (this.isLocked) return 'Click to unlock';
    return 'Hover to preview, click to lock';
  }

  // ─────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────

  private checkMobile = () => {
    this.isMobile = window.matchMedia('(hover: none)').matches;
  };

  /** Handle mouse enter (desktop hover preview) */
  handleMouseEnter = () => {
    if (this.isMobile || this.isLocked) return;
    this.isFlipped = true;
  };

  /** Handle mouse leave (desktop hover end) */
  handleMouseLeave = () => {
    if (this.isMobile || this.isLocked) return;
    this.isFlipped = false;
  };

  /** Handle click (toggle/lock) */
  handleClick = () => {
    if (this.isMobile) {
      // Mobile: toggle flip
      this.isFlipped = !this.isFlipped;
      this.isLocked = true;
    } else {
      // Desktop: toggle lock
      if (this.isLocked) {
        // Unlock and flip back
        this.isLocked = false;
        this.isFlipped = false;
      } else {
        // Lock current state
        this.isLocked = true;
      }
    }
  };

  /** Programmatically flip to specific side */
  flipTo(token: TokenId) {
    this.isFlipped = token === 'usdt';
    this.isLocked = true;
  }

  /** Reset to initial state */
  reset() {
    this.isFlipped = false;
    this.isLocked = false;
  }

  // ─────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────

  dispose() {
    this.disposers.forEach((fn) => fn());
    this.springCtrl.stop();
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const walletCardController = new WalletCardController();
