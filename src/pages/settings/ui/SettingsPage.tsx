import { observer } from 'mobx-react-lite';
import { useTrail, animated, config } from '@react-spring/web';
import { PageLayout, Panel } from 'shared/ui';
import { networkStore, settingsStore, themeStore } from 'shared/model';
import { cn } from 'shared/lib';
import type { NetworkId } from 'entities/wallet/config/networks.config';

// Toggle Switch Component

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
    return (
        <label className="flex items-center justify-between py-3 cursor-pointer">
            <div className="flex-1">
                <span className="text-sm font-medium text-zinc-200">{label}</span>
                {description && (
                    <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
                )}
            </div>
            <button
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full',
                    'transition-colors duration-200',
                    checked ? 'bg-violet-600' : 'bg-zinc-700'
                )}
            >
                <span
                    className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white',
                        'transition-transform duration-200',
                        checked ? 'translate-x-6' : 'translate-x-1'
                    )}
                />
            </button>
        </label>
    );
}

// Network Selector Component

const NetworkSelector = observer(function NetworkSelector() {
    const handleNetworkChange = async (networkId: NetworkId) => {
        await networkStore.setNetwork(networkId);
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                {networkStore.availableNetworks.map((network) => (
                    <button
                        key={network.id}
                        onClick={() => handleNetworkChange(network.id)}
                        disabled={networkStore.isSwitching}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2',
                            'py-2.5 px-4 rounded-xl',
                            'text-sm font-medium',
                            'transition-all duration-200',
                            'disabled:opacity-60 disabled:cursor-wait',
                            network.id === networkStore.selectedNetwork
                                ? 'bg-violet-600 text-white'
                                : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200'
                        )}
                    >
                        <span className={cn('w-2 h-2 rounded-full', network.badgeColor)} />
                        {network.name}
                    </button>
                ))}
            </div>
            {networkStore.faucetUrl && (
                <a
                    href={networkStore.faucetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Get test TRX and USDT from faucet
                </a>
            )}
        </div>
    );
});

// Theme Selector Component

const ThemeSelector = observer(function ThemeSelector() {
    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <button
                    onClick={() => themeStore.setScheme('dark')}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2',
                        'py-2.5 px-4 rounded-xl',
                        'text-sm font-medium',
                        'transition-all duration-200',
                        themeStore.colorScheme === 'dark'
                            ? 'bg-violet-600 text-white'
                            : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200'
                    )}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Dark
                </button>
                <button
                    onClick={() => themeStore.setScheme('light')}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2',
                        'py-2.5 px-4 rounded-xl',
                        'text-sm font-medium',
                        'transition-all duration-200',
                        themeStore.colorScheme === 'light'
                            ? 'bg-violet-600 text-white'
                            : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200'
                    )}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Light
                </button>
            </div>
        </div>
    );
});

// Settings Page - Desktop: cards in grid, with animations

export const SettingsPage = observer(function SettingsPage() {
    // Trail animation for cards (3 cards)
    const trail = useTrail(3, {
        from: { opacity: 0, y: 30, scale: 0.97 },
        to: { opacity: 1, y: 0, scale: 1 },
        config: config.gentle,
        delay: 80,
    });

    return (
        <PageLayout className="p-4 lg:p-8">
            {/* Mobile: 1, Tablet: 2, Desktop (1024px+): 3 */}
            <div className={cn(
                'w-full max-w-6xl mx-auto',
                'grid gap-6',
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            )}>
                {/* Network Card */}
                <animated.div
                    style={{
                        opacity: trail[0]?.opacity,
                        transform: trail[0]?.y.to(y => `translateY(${y}px)`),
                    }}
                >
                    <Panel
                        title="Network"
                        subtitle="Select blockchain network"
                        variant="default"
                        padding="lg"
                    >
                        <NetworkSelector />
                    </Panel>
                </animated.div>

                {/* Theme Card */}
                <animated.div
                    style={{
                        opacity: trail[1]?.opacity,
                        transform: trail[1]?.y.to(y => `translateY(${y}px)`),
                    }}
                >
                    <Panel
                        title="Appearance"
                        subtitle="Customize app theme"
                        variant="default"
                        padding="lg"
                    >
                        <ThemeSelector />
                    </Panel>
                </animated.div>

                {/* Display Card */}
                <animated.div
                    style={{
                        opacity: trail[2]?.opacity,
                        transform: trail[2]?.y.to(y => `translateY(${y}px)`),
                    }}
                >
                    <Panel
                        title="Display"
                        subtitle="UI preferences"
                        variant="default"
                        padding="lg"
                    >
                        <div className="divide-y divide-zinc-800/30">
                            <ToggleSwitch
                                checked={settingsStore.showNetworkBadge}
                                onChange={settingsStore.setShowNetworkBadge}
                                label="Network badge"
                                description="Show network indicator in header"
                            />
                            <ToggleSwitch
                                checked={settingsStore.showFpsMonitor}
                                onChange={settingsStore.setShowFpsMonitor}
                                label="FPS monitor"
                                description="Show performance overlay"
                            />
                        </div>
                    </Panel>
                </animated.div>
            </div>
        </PageLayout>
    );
});
