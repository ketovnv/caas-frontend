import { observer } from 'mobx-react-lite';
import { useRef, useEffect } from 'react';
import { useTrail, animated, config, Controller } from '@react-spring/web';
import { cn } from 'shared/lib';
import { GlowingEffect } from 'shared/ui/animated/glow/GlowingEffect';
import { authStore } from '../model/auth.store';
import { IconButtonController } from './IconButtonController';
import { panelSpring, INPUT_PANEL_HIDDEN, INPUT_PANEL_VISIBLE, type InputPanelState } from '../config';
import type { LoginProvider } from '@/shared/lib/web3auth';

// ============================================================================
// Types
// ============================================================================

interface LoginIconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** ID кнопки для отслеживания активной */
  id: string;
}

interface LoginOptionsProps {
  className?: string;
}

// ============================================================================
// Icons (larger, optimized for icon-only display)
// ============================================================================

const GoogleIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#5865F2">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const EmailIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const MetaMaskIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24">
    <path fill="#E2761B" d="M21.87 2.17l-8.23 6.12 1.52-3.62 6.71-2.5z"/>
    <path fill="#E4761B" d="M2.13 2.17l8.15 6.18-1.44-3.68-6.71-2.5z"/>
    <path fill="#E4761B" d="M18.75 16.48l-2.19 3.35 4.69 1.29 1.35-4.57-3.85-.07z"/>
    <path fill="#E4761B" d="M1.41 16.55l1.34 4.57 4.69-1.29-2.19-3.35-3.84.07z"/>
    <path fill="#E4761B" d="M7.17 10.52l-1.31 1.98 4.67.21-.17-5.02-3.19 2.83z"/>
    <path fill="#E4761B" d="M16.83 10.52l-3.23-2.89-.11 5.08 4.66-.21-1.32-1.98z"/>
    <path fill="#E4761B" d="M7.44 19.83l2.81-1.37-2.43-1.9-.38 3.27z"/>
    <path fill="#E4761B" d="M13.75 18.46l2.81 1.37-.38-3.27-2.43 1.9z"/>
    <path fill="#D7C1B3" d="M16.56 19.83l-2.81-1.37.22 1.83-.02.77 2.61-1.23z"/>
    <path fill="#D7C1B3" d="M7.44 19.83l2.61 1.23-.02-.77.22-1.83-2.81 1.37z"/>
    <path fill="#233447" d="M10.11 14.98l-2.35-.69 1.66-.76.69 1.45z"/>
    <path fill="#233447" d="M13.89 14.98l.69-1.45 1.67.76-2.36.69z"/>
    <path fill="#CD6116" d="M7.44 19.83l.4-3.35-2.59.07 2.19 3.28z"/>
    <path fill="#CD6116" d="M16.16 16.48l.4 3.35 2.19-3.28-2.59-.07z"/>
    <path fill="#CD6116" d="M18.15 12.5l-4.66.21.43 2.27.69-1.45 1.67.76 1.87-1.79z"/>
    <path fill="#CD6116" d="M7.76 14.29l1.67-.76.69 1.45.43-2.27-4.66-.21 1.87 1.79z"/>
    <path fill="#E4751F" d="M5.86 12.5l1.96 3.83-.07-1.9-1.89-1.93z"/>
    <path fill="#E4751F" d="M16.25 14.43l-.07 1.9 1.97-3.83-1.9 1.93z"/>
    <path fill="#E4751F" d="M10.52 12.71l-.43 2.27.54 2.79.12-3.67-.23-1.39z"/>
    <path fill="#E4751F" d="M13.49 12.71l-.22 1.38.11 3.68.54-2.79-.43-2.27z"/>
    <path fill="#F6851B" d="M13.92 14.98l-.54 2.79.39.27 2.43-1.9.07-1.9-2.35.74z"/>
    <path fill="#F6851B" d="M7.76 14.24l.06 1.9 2.43 1.9.39-.27-.54-2.79-2.34-.74z"/>
    <path fill="#C0AD9E" d="M13.97 21.06l.02-.77-.21-.18h-3.56l-.21.18.02.77-2.59-1.23 .91.74 1.84 1.27h3.62l1.84-1.27.91-.74-2.59 1.23z"/>
    <path fill="#161616" d="M13.75 18.46l-.39-.27h-2.72l-.39.27-.22 1.83.21-.18h3.56l.21.18-.26-1.83z"/>
    <path fill="#763D16" d="M22.25 8.57l.7-3.36L21.87 2.17l-8.12 6.02 3.12 2.64 4.41 1.29.97-1.14-.42-.31.67-.62-.52-.4.67-.51-.44-.34z"/>
    <path fill="#763D16" d="M1.05 5.21l.7 3.36-.45.33.68.51-.51.4.67.62-.43.31.98 1.14 4.4-1.29 3.13-2.64-8.12-6.02-1.05 3.28z"/>
    <path fill="#F6851B" d="M21.28 12.12l-4.41-1.29 1.32 1.98-1.97 3.83 2.59-.03h3.87l-1.4-4.49z"/>
    <path fill="#F6851B" d="M7.14 10.83l-4.41 1.29-1.39 4.49h3.86l2.59.03-1.96-3.83 1.31-1.98z"/>
    <path fill="#F6851B" d="M13.49 12.71l.28-4.85 1.28-3.47H8.96l1.27 3.47.29 4.85.11 1.4.01 3.66h2.72l.01-3.66.12-1.4z"/>
  </svg>
);

const TronLinkIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24">
    <path fill="#FF0013" d="M12 2L2 7l3 11 7 4 7-4 3-11-10-5zm0 2.18l7.09 3.55L16.5 17.5 12 20l-4.5-2.5L4.91 7.73 12 4.18z"/>
    <path fill="#FF0013" d="M12 6l-5 2.5 1.5 6L12 16.5l3.5-2 1.5-6L12 6z"/>
  </svg>
);

// ============================================================================
// Login Icon Button with Imperative Controller
// ============================================================================

const LoginIconButton = observer(function LoginIconButton({
  icon,
  label,
  onClick,
  loading,
  disabled,
  id,
}: LoginIconButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Imperative controller (single instance per button)
  const ctrlRef = useRef<IconButtonController | null>(null);
  if (!ctrlRef.current) {
    ctrlRef.current = new IconButtonController();
  }
  const ctrl = ctrlRef.current;

  // Cleanup on unmount
  useEffect(() => () => ctrl.stop(), [ctrl]);

  // Состояние из стора
  const { activeButtonId } = authStore;
  const isActive = activeButtonId === id;
  const isOther = activeButtonId !== null && activeButtonId !== id;
  const isDisabled = disabled || loading || isOther;

  return (
    <animated.button
      ref={buttonRef}
      onClick={async () => {
        if (isDisabled || ctrl.isPressed) return;
        authStore.setActiveButton(id);
        await ctrl.press();
        authStore.setActiveButton(null);
        onClick();
      }}
      disabled={isDisabled}
      title={label}
      style={{
        transform: ctrl.transform,
        transformStyle: 'preserve-3d',
        opacity: isOther ? 0 : 1,
        filter: isActive ? 'brightness(1.3)' : 'brightness(1)',
        transition: 'opacity 0.2s ease-out, filter 0.2s ease-out',
      }}
      onMouseMove={(e) => {
        if (isOther) return;
        if (buttonRef.current) ctrl.updateBounds(buttonRef.current.getBoundingClientRect());
        ctrl.onMouseMove(e.clientX, e.clientY);
      }}
      onMouseEnter={() => {
        if (isOther) return;
        if (buttonRef.current) ctrl.updateBounds(buttonRef.current.getBoundingClientRect());
        ctrl.onMouseEnter();
      }}
      onMouseLeave={() => {
        if (isOther) return;
        ctrl.onMouseLeave();
      }}
      className={cn(
        'relative flex items-center justify-center',
        'w-16 h-16 rounded-2xl cursor-pointer',
        'bg-zinc-800/60 backdrop-blur-sm',
        'border border-zinc-700/50',
        'hover:bg-zinc-700/60',
        'disabled:cursor-not-allowed',
        'group',
        // Убираем pointer-events у исчезающих кнопок
        isOther && 'pointer-events-none'
      )}
    >
      {/* GlowingEffect border - усиливается при нажатии */}
      <GlowingEffect
        spread={isActive ? 80 : 40}
        proximity={isActive ? 200 : 50}
        inactiveZone={0.01}
        borderWidth={isActive ? 3 : 2}
        movementDuration={isActive ? 0.3 : 1}
        glow={isActive}
      />

      {/* Icon */}
      <span className="relative z-10 transition-transform duration-200">
        {loading ? (
          <svg className="w-7 h-7 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
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

      {/* Shine overlay */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />
      </div>
    </animated.button>
  );
});

// ============================================================================
// Input Panel Controller (for email/phone panel animation)
// ============================================================================

class InputPanelController {
  private ctrl: Controller<InputPanelState>;

  constructor() {
    this.ctrl = new Controller({
      ...INPUT_PANEL_HIDDEN,
      config: panelSpring,
    });
  }

  get springs() {
    return this.ctrl.springs;
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
// Login Options Component
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

  // All login options for trail animation
  const loginOptions = [
    { id: 'google', icon: <GoogleIcon />, label: 'Google', provider: 'google' as LoginProvider },
    { id: 'facebook', icon: <FacebookIcon />, label: 'Facebook', provider: 'facebook' as LoginProvider },
    { id: 'twitter', icon: <TwitterIcon />, label: 'X', provider: 'twitter' as LoginProvider },
    { id: 'discord', icon: <DiscordIcon />, label: 'Discord', provider: 'discord' as LoginProvider },
  ];

  const walletOptions = [
    { id: 'tronlink', icon: <TronLinkIcon />, label: 'TronLink' },
    { id: 'metamask', icon: <MetaMaskIcon />, label: 'MetaMask' },
  ];

  const passwordlessOptions = [
    { id: 'email', icon: <EmailIcon />, label: 'Email' },
    { id: 'phone', icon: <PhoneIcon />, label: 'Phone' },
  ];

  // Staggered entrance animation (useTrail is OK per user)
  const socialTrail = useTrail(loginOptions.length, {
    from: { opacity: 0, y: 30, scale: 0.8 },
    to: { opacity: 1, y: 0, scale: 1 },
    config: config.wobbly,
    delay: 100,
  });

  const walletTrail = useTrail(walletOptions.length, {
    from: { opacity: 0, y: 30, scale: 0.8 },
    to: { opacity: 1, y: 0, scale: 1 },
    config: config.wobbly,
    delay: 300,
  });

  const passwordlessTrail = useTrail(passwordlessOptions.length, {
    from: { opacity: 0, y: 30, scale: 0.8 },
    to: { opacity: 1, y: 0, scale: 1 },
    config: config.wobbly,
    delay: 500,
  });

  const handleConnect = (provider: LoginProvider) => {
    authStore.connect(provider);
  };

  return (
    <div className={cn('flex flex-col items-center gap-6 w-full max-w-xs', className)}>
      {/* Social logins - 4 columns */}
      <div className="flex gap-3 justify-center">
        {socialTrail.map((style, index) => {
          const option = loginOptions[index]!;
          return (
            <animated.div key={option.id} style={style}>
              <LoginIconButton
                id={option.id}
                icon={option.icon}
                label={option.label}
                onClick={() => handleConnect(option.provider)}
                loading={isLoading && selectedProvider === option.provider}
                disabled={isLoading}
              />
            </animated.div>
          );
        })}
      </div>

      {/* Wallets Divider */}
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-px bg-zinc-700/50" />
        <span className="text-zinc-500 text-xs uppercase tracking-wider">wallets</span>
        <div className="flex-1 h-px bg-zinc-700/50" />
      </div>

      {/* Wallet options - 2 columns */}
      <div className="flex gap-3 justify-center">
        {walletTrail.map((style, index) => {
          const option = walletOptions[index]!;
          return (
            <animated.div key={option.id} style={style}>
              <LoginIconButton
                id={option.id}
                icon={option.icon}
                label={option.label}
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
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-px bg-zinc-700/50" />
        <span className="text-zinc-500 text-xs uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-zinc-700/50" />
      </div>

      {/* Passwordless options - 2 columns */}
      <div className="flex gap-3 justify-center">
        {passwordlessTrail.map((style, index) => {
          const option = passwordlessOptions[index]!;
          return (
            <animated.div key={option.id} style={style}>
              <LoginIconButton
                id={option.id}
                icon={option.icon}
                label={option.label}
                onClick={() => authStore.setInputMode(option.id as 'email' | 'phone')}
                disabled={isLoading}
              />
            </animated.div>
          );
        })}
      </div>

      {/* Email/Phone Input */}
      {inputMode && (
        <animated.div
          className="w-full flex flex-col gap-3 mt-2"
          style={{
            opacity: inputCtrl.opacity,
            transform: inputCtrl.transform,
          }}
        >
          <input
            type={inputMode === 'email' ? 'email' : 'tel'}
            placeholder={inputMode === 'email' ? 'your@email.com' : '+7 999 123 4567'}
            value={inputMode === 'email' ? emailInput : phoneInput}
            onChange={(e) => inputMode === 'email'
              ? authStore.setEmailInput(e.target.value)
              : authStore.setPhoneInput(e.target.value)
            }
            onKeyDown={(e) => e.key === 'Enter' && authStore.submitInput()}
            className={cn(
              'w-full px-4 py-3 rounded-xl',
              'bg-zinc-800/50 border border-zinc-700/50',
              'text-white placeholder:text-zinc-500',
              'focus:outline-none focus:border-zinc-500',
              'transition-colors text-center'
            )}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => authStore.cancelInput()}
              className="flex-1 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => authStore.submitInput()}
              disabled={!authStore.currentInput.trim() || isLoading}
              className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors text-sm"
            >
              {isLoading ? 'Sending...' : 'Continue'}
            </button>
          </div>
        </animated.div>
      )}

      {/* Error display */}
      {error && (
        <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
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
