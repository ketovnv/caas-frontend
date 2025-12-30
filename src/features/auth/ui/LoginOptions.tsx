import { observer } from 'mobx-react-lite';
import { useRef, useEffect } from 'react';
import { useTrail, animated, config, Controller } from '@react-spring/web';
import { cn } from 'shared/lib';
import { GlowingEffect } from 'shared/ui/animated/glow/GlowingEffect';
import { authStore } from '../model/auth.store';
import { IconButtonController } from '../model/IconButtonController.ts';
import { panelSpring, INPUT_PANEL_HIDDEN, INPUT_PANEL_VISIBLE, type InputPanelState } from '../config';
import type { LoginProvider } from '@/shared/lib/web3auth';

// Icons from svg-icons
import { Google, Facebook, Discord, Twitter, Email, Phone, Metamask, TronLink } from 'shared/ui/animated/svg-icons';

// ============================================================================
// Types
// ============================================================================

interface LoginCardProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  id: string;
  /** Accent color for glow */
  accentColor?: string;
}

interface LoginOptionsProps {
  className?: string;
}

// ============================================================================
// Login Card - Large Mobile-First Card
// ============================================================================

const LoginCard = observer(function LoginCard({
  icon,
  label: _label,
  onClick,
  loading,
  disabled,
  id,
  accentColor,
}: LoginCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);

  // Imperative controller
  const ctrlRef = useRef<IconButtonController | null>(null);
  if (!ctrlRef.current) {
    ctrlRef.current = new IconButtonController();
  }
  const ctrl = ctrlRef.current;

  // Cleanup on unmount
  useEffect(() => () => ctrl.stop(), [ctrl]);

  // State from store
  const { activeButtonId } = authStore;
  const isActive = activeButtonId === id;
  const isOther = activeButtonId !== null && activeButtonId !== id;
  const isDisabled = disabled || loading || isOther;

  return (
    <animated.button
      ref={cardRef}
      onClick={async () => {
        if (isDisabled || ctrl.isPressed) return;
        authStore.setActiveButton(id);
        await ctrl.press();
        authStore.setActiveButton(null);
        onClick();
      }}
      disabled={isDisabled}
      style={{
        transform: ctrl.transform,
        transformStyle: 'preserve-3d',
        opacity: isOther ? 0 : 1,
        filter: isActive ? 'brightness(1.2)' : 'brightness(1)',
        transition: 'opacity 0.3s ease-out, filter 0.2s ease-out',
        // Custom glow color
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        '--glow-color': accentColor,
      } as any}
      onMouseMove={(e) => {
        if (isOther) return;
        if (cardRef.current) ctrl.updateBounds(cardRef.current.getBoundingClientRect());
        ctrl.onMouseMove(e.clientX, e.clientY);
      }}
      onMouseEnter={() => {
        if (isOther) return;
        if (cardRef.current) ctrl.updateBounds(cardRef.current.getBoundingClientRect());
        ctrl.onMouseEnter();
      }}
      onMouseLeave={() => {
        if (isOther) return;
        ctrl.onMouseLeave();
      }}
      className={cn(
        // Layout
        'relative flex flex-col items-center justify-center gap-3',
        // Size - Large for mobile
        'w-full aspect-square min-h-[120px]',
        // Styling
        'rounded-3xl cursor-pointer',
        'bg-zinc-900/80 backdrop-blur-md',
        'border border-zinc-800/60',
        // Hover
        'hover:bg-zinc-800/80 hover:border-zinc-700/60',
        // Disabled
        'disabled:cursor-not-allowed',
        // Group for child animations
        'group',
        // Hide pointer events when fading out
        isOther && 'pointer-events-none'
      )}
    >
      {/* GlowingEffect border */}
      <GlowingEffect
        spread={isActive ? 100 : 60}
        proximity={isActive ? 200 : 80}
        inactiveZone={0.01}
        borderWidth={isActive ? 3 : 2}
        movementDuration={isActive ? 0.3 : 1.2}
        glow={isActive}
      />

      {/* Icon */}
      <span className="relative z-10 transition-transform duration-200 group-hover:scale-110">
        {loading ? (
          <svg className="w-24 h-24 animate-spin text-zinc-400" viewBox="0 0 32 32">
            <circle
              className="opacity-25"
              cx="24" cy="24" r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          icon
        )}
      </span>

      {/* Label */}
      {/*<span className={cn(*/}
      {/*  'relative z-10 text-sm font-medium',*/}
      {/*  'text-zinc-400 group-hover:text-zinc-200',*/}
      {/*  'transition-colors duration-200'*/}
      {/*)}>*/}
      {/*  {label}*/}
      {/*</span>*/}

      {/* Shine overlay */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0" />
      </div>
    </animated.button>
  );
});

// ============================================================================
// Input Panel Controller
// ============================================================================

class InputPanelController {
  private ctrl: Controller<InputPanelState>;

  constructor() {
    this.ctrl = new Controller({
      ...INPUT_PANEL_HIDDEN,
      config: panelSpring,
    });
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

  stop() {
    this.ctrl.stop();
  }
}

// ============================================================================
// Login Options Component - Mobile-First Grid
// ============================================================================

export const LoginOptions = observer(function LoginOptions({ className }: LoginOptionsProps) {
  const { status, selectedProvider, error, inputMode, emailInput, phoneInput } = authStore;

  const isLoading = status === 'connecting';

  // Input panel controller
  const inputCtrlRef = useRef<InputPanelController | null>(null);
  if (!inputCtrlRef.current) {
    inputCtrlRef.current = new InputPanelController();
  }
  const inputCtrl = inputCtrlRef.current;

  // Cleanup
  useEffect(() => () => inputCtrl.stop(), [inputCtrl]);

  // Animate input panel
  useEffect(() => {
    if (inputMode) {
      inputCtrl.show();
    } else {
      inputCtrl.hide();
    }
  }, [inputMode, inputCtrl]);

  // All login options
  const socialOptions = [
    { id: 'google', icon: <Google className="w-24 h-24" />, label: 'Google', provider: 'google' as LoginProvider, color: '#4285F4' },
    { id: 'facebook', icon: <Facebook className="w-24 h-24" />, label: 'Facebook', provider: 'facebook' as LoginProvider, color: '#1877F2' },
    { id: 'twitter', icon: <Twitter className="w-24 h-24" />, label: 'X', provider: 'twitter' as LoginProvider, color: '#fff' },
    { id: 'discord', icon: <Discord className="w-24 h-24" />, label: 'Discord', provider: 'discord' as LoginProvider, color: '#5865F2' },
  ];

  const walletOptions = [
    { id: 'metamask', icon: <Metamask className="w-24 h-24" />, label: 'MetaMask', color: '#E2761B' },
    { id: 'tronlink', icon: <TronLink className="w-24 h-24" />, label: 'TronLink', color: '#FF060A' },
  ];

  const passwordlessOptions = [
    { id: 'email', icon: <Email className="w-24 h-24 text-violet-400" />, label: 'Email', color: '#8B5CF6' },
    { id: 'phone', icon: <Phone className="w-24 h-24 text-emerald-400" />, label: 'Phone', color: '#10B981' },
  ];

  // Staggered entrance animations
  const socialTrail = useTrail(socialOptions.length, {
    from: { opacity: 0, y: 40, scale: 0.85 },
    to: { opacity: 1, y: 0, scale: 1 },
    config: config.wobbly,
    delay: 100,
  });

  const walletTrail = useTrail(walletOptions.length, {
    from: { opacity: 0, y: 40, scale: 0.85 },
    to: { opacity: 1, y: 0, scale: 1 },
    config: config.wobbly,
    delay: 350,
  });

  const passwordlessTrail = useTrail(passwordlessOptions.length, {
    from: { opacity: 0, y: 40, scale: 0.85 },
    to: { opacity: 1, y: 0, scale: 1 },
    config: config.wobbly,
    delay: 550,
  });

  const handleConnect = (provider: LoginProvider) => {
    authStore.connect(provider);
  };

  return (
    <div className={cn('flex flex-col gap-6 w-full max-w-sm px-4', className)}>
      {/* Social logins - 2x2 grid */}
      <div className="grid grid-cols-2 gap-4">
        {socialTrail.map((style, index) => {
          const option = socialOptions[index]!;
          return (
            <animated.div key={option.id} style={style}>
              <LoginCard
                id={option.id}
                icon={option.icon}
                label={option.label}
                accentColor={option.color}
                onClick={() => handleConnect(option.provider)}
                loading={isLoading && selectedProvider === option.provider}
                disabled={isLoading}
              />
            </animated.div>
          );
        })}
      </div>

      {/* Wallets Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
        <span className="text-zinc-500 text-xs uppercase tracking-widest font-medium">Wallets</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
      </div>

      {/* Wallet options - 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        {walletTrail.map((style, index) => {
          const option = walletOptions[index]!;
          return (
            <animated.div key={option.id} style={style}>
              <LoginCard
                id={option.id}
                icon={option.icon}
                label={option.label}
                accentColor={option.color}
                onClick={() => {
                  if (option.id === 'tronlink') authStore.connectTronLink();
                  if (option.id === 'metamask') authStore.connectMetaMask();
                }}
                loading={isLoading && selectedProvider === option.id}
                disabled={isLoading}
              />
            </animated.div>
          );
        })}
      </div>

      {/* Passwordless Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
        <span className="text-zinc-500 text-xs uppercase tracking-widest font-medium">Or</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
      </div>

      {/* Passwordless options - 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        {passwordlessTrail.map((style, index) => {
          const option = passwordlessOptions[index]!;
          return (
            <animated.div key={option.id} style={style}>
              <LoginCard
                id={option.id}
                icon={option.icon}
                label={option.label}
                accentColor={option.color}
                onClick={() => authStore.setInputMode(option.id as 'email' | 'phone')}
                disabled={isLoading}
              />
            </animated.div>
          );
        })}
      </div>

      {/* Email/Phone Input Panel */}
      {inputMode && (
        <animated.div
          className="w-full flex flex-col gap-4 mt-2"
          style={{
            opacity: inputCtrl.opacity,
            transform: inputCtrl.transform,
          }}
        >
          <div className="relative">
            <input
              type={inputMode === 'email' ? 'email' : 'tel'}
              placeholder={inputMode === 'email' ? 'your@email.com' : '+380 99 123 4567'}
              value={inputMode === 'email' ? emailInput : phoneInput}
              onChange={(e) => inputMode === 'email'
                ? authStore.setEmailInput(e.target.value)
                : authStore.setPhoneInput(e.target.value)
              }
              onKeyDown={(e) => e.key === 'Enter' && authStore.submitInput()}
              className={cn(
                'w-full px-5 py-4 rounded-2xl',
                'bg-zinc-900/80 border border-zinc-700/50',
                'text-white text-lg placeholder:text-zinc-500',
                'focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20',
                'transition-all text-center'
              )}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => authStore.cancelInput()}
              className={cn(
                'flex-1 px-5 py-3.5 rounded-2xl',
                'bg-zinc-800/80 text-zinc-400',
                'hover:bg-zinc-700/80 hover:text-zinc-300',
                'transition-colors text-base font-medium',
                'border border-zinc-700/30'
              )}
            >
              Cancel
            </button>
            <button
              onClick={() => authStore.submitInput()}
              disabled={!authStore.currentInput.trim() || isLoading}
              className={cn(
                'flex-1 px-5 py-3.5 rounded-2xl',
                'bg-violet-600 text-white',
                'hover:bg-violet-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors text-base font-medium'
              )}
            >
              {isLoading ? 'Sending...' : 'Continue'}
            </button>
          </div>
        </animated.div>
      )}

      {/* Error display */}
      {error && (
        <div className={cn(
          'w-full p-4 rounded-2xl',
          'bg-red-500/10 border border-red-500/20',
          'text-red-400 text-sm text-center'
        )}>
          {error.message}
          <button
            onClick={() => authStore.clearError()}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
});
