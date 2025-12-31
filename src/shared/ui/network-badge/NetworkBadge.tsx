import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { networkStore, settingsStore } from 'shared/model';
import { cn } from 'shared/lib';
import { NetworkBadgeController } from './NetworkBadgeController';

// ============================================================================
// NetworkBadge - Header network indicator with dropdown
// ============================================================================

/** Singleton controller instance */
export const networkBadgeController = new NetworkBadgeController();

export const NetworkBadge = observer(function NetworkBadge() {
    const ctrl = networkBadgeController;
    const isVisible = settingsStore.showNetworkBadge;

    // Update pulse animation when switching state changes
    ctrl.updatePulse(networkStore.isSwitching);

    // Don't render if hidden in settings
    if (!isVisible) return null;

    return (
        <div ref={ctrl.setContainerRef} className="relative z-50">
            {/* Badge Button */}
            <animated.button
                style={{ transform: ctrl.buttonTransform }}
                onClick={ctrl.toggle}
                disabled={networkStore.isSwitching}
                className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
                    'text-xs font-medium text-white',
                    'transition-all duration-200',
                    'hover:opacity-90 active:scale-95',
                    'disabled:opacity-60 disabled:cursor-wait',
                    networkStore.badgeColor
                )}
            >
                {/* Network indicator dot */}
                <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    networkStore.isMainnet ? 'bg-white' : 'bg-white/80 animate-pulse'
                )} />

                {/* Network name */}
                <span>{networkStore.shortName}</span>

                {/* Dropdown arrow */}
                <svg
                    className={cn(
                        'w-3 h-3 transition-transform duration-200',
                        ctrl.isOpen && 'rotate-180'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </animated.button>

            {/* Dropdown */}
            {ctrl.isOpen && (
                <animated.div
                    style={ctrl.dropdownStyle}
                    className={cn(
                        'absolute top-full right-0 mt-2',
                        'min-w-[140px] p-1',
                        'bg-zinc-900/95 backdrop-blur-md',
                        'border border-zinc-700/50 rounded-xl',
                        'shadow-xl shadow-black/20'
                    )}
                >
                    {networkStore.availableNetworks.map((network) => (
                        <button
                            key={network.id}
                            onClick={() => ctrl.selectNetwork(network.id)}
                            className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
                                'text-sm text-left',
                                'transition-colors duration-150',
                                network.id === networkStore.selectedNetwork
                                    ? 'bg-zinc-700/50 text-white'
                                    : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
                            )}
                        >
                            {/* Network indicator */}
                            <span className={cn('w-2 h-2 rounded-full', network.badgeColor)} />

                            {/* Network name */}
                            <span className="flex-1">{network.name}</span>

                            {/* Checkmark for selected */}
                            {network.id === networkStore.selectedNetwork && (
                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}

                            {/* Testnet indicator */}
                            {network.isTestnet && (
                                <span className="text-[10px] text-orange-400/70 uppercase">Test</span>
                            )}
                        </button>
                    ))}

                    {/* Faucet link for testnet */}
                    {networkStore.faucetUrl && (
                        <>
                            <div className="border-t border-zinc-700/50 my-1" />
                            <a
                                href={networkStore.faucetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
                                    'text-xs text-zinc-400 hover:text-zinc-200',
                                    'transition-colors duration-150'
                                )}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Get test tokens
                            </a>
                        </>
                    )}
                </animated.div>
            )}
        </div>
    );
});
