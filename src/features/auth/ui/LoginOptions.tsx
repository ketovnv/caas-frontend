import { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useTrail, useSpring, animated, config } from '@react-spring/web';
import { cn } from 'shared/lib';
import { GlowingEffect } from 'shared/ui/animated/glow/GlowingEffect';
import { authStore } from '../model/auth.store';
import { iconButtonStore } from '../model/IconButtonController';
import { getInputPanelController } from '../model/InputPanelController';
import type { LoginProvider } from '@/shared/lib/web3auth';

// Icons from svg-icons
import { Google, Facebook, Discord, Twitter, Email, Phone, Metamask, TronLink } from 'shared/ui/animated/svg-icons';

// ============================================================================
// Loading Spinner Component
// ============================================================================

interface LoadingSpinnerProps {
    color?: string;
    size?: number;
}

function LoadingSpinner({ color = '#fff', size = 96 }: LoadingSpinnerProps) {
    // Pulsing animation
    const pulse = useSpring({
        from: { scale: 0.8, opacity: 0.4 },
        to: async (next) => {
            while (true) {
                await next({ scale: 1.1, opacity: 0.8 });
                await next({ scale: 0.8, opacity: 0.4 });
            }
        },
        config: { tension: 120, friction: 14 },
    });

    // Rotation animation
    const rotation = useSpring({
        from: { rotate: 0 },
        to: { rotate: 360 },
        loop: true,
        config: { duration: 1500 },
    });

    return (
        <div className="relative" style={{ width: size, height: size }}>
            {/* Outer pulsing ring */}
            <animated.div
                className="absolute inset-0 rounded-full"
                style={{
                    scale: pulse.scale,
                    opacity: pulse.opacity,
                    border: `3px solid ${color}`,
                    filter: `drop-shadow(0 0 8px ${color})`,
                }}
            />
            {/* Inner spinning arc */}
            <animated.svg
                className="absolute inset-0"
                viewBox="0 0 100 100"
                style={{ rotate: rotation.rotate.to(r => `${r}deg`) }}
            >
                <defs>
                    <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="1" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#spinnerGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="180 360"
                />
            </animated.svg>
            {/* Center dot */}
            <animated.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    width: size * 0.15,
                    height: size * 0.15,
                    backgroundColor: color,
                    scale: pulse.scale,
                    boxShadow: `0 0 12px ${color}`,
                }}
            />
        </div>
    );
}

// ============================================================================
// Input Panel Controller Instance
// ============================================================================

const inputPanelController = getInputPanelController(() => authStore.inputMode);

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
    // DOM ref for bounds - acceptable use of useRef
    const cardRef = useRef<HTMLButtonElement>(null);

    // Get controller from store (no hooks needed!)
    const ctrl = iconButtonStore.getController(id);

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
                {(loading || isActive) ? (
                    <LoadingSpinner color={accentColor} size={96} />
                ) : (
                    icon
                )}
            </span>

            {/* Shine overlay */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0" />
            </div>
        </animated.button>
    );
});

// ============================================================================
// Login Options Component - Mobile-First Grid
// ============================================================================

export const LoginOptions = observer(function LoginOptions({ className }: LoginOptionsProps) {
    const { status, selectedProvider, error, inputMode, emailInput, phoneInput } = authStore;

    // Loading when provider is selected (button clicked) and not yet connected/errored
    const isLoading = selectedProvider !== null && status !== 'connected' && status !== 'error';
    const inputCtrl = inputPanelController;

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

    // Staggered entrance animations (useTrail is OK per project guidelines)
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
        <div className={cn(
            'flex flex-col gap-6 w-full px-4',
            // Mobile: centered, Tablet+: wider
            'max-w-sm mx-auto md:max-w-4xl xl:max-w-6xl',
            className
        )}>
            {/* Social logins - Mobile: 2x2, Tablet: 4, Desktop: 4 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Wallets + Passwordless - Tablet+: side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Wallets Section */}
                <div className="space-y-4">
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
                </div>

                {/* Passwordless Section */}
                <div className="space-y-4">
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
                </div>
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
