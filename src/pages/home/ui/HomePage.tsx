import { observer } from 'mobx-react-lite';
import { useTrail, animated, config } from '@react-spring/web';
import { LoginButton, authStore } from 'features/auth';
import { WalletCard, walletStore, TransactionForm, TransactionCost, TokenSelector } from 'entities/wallet';
import { transactionFormStore } from 'entities/wallet/model/TransactionFormStore';
import { PageLayout, Panel } from 'shared/ui';
import { cn } from 'shared/lib';

// ============================================================================
// Home Page - Desktop: 3 panels, Mobile: stacked
// ============================================================================

export const HomePage = observer(function HomePage() {
    const { isConnected } = authStore;

    // Handle send transaction
    const handleSend = async (amount: string, address: string): Promise<string> => {
        const txHash = await walletStore.sendTransaction(address, amount);
        console.log('Transaction sent:', txHash);
        return txHash;
    };

    // Trail animation for panels (3 panels)
    const trail = useTrail(3, {
        from: { opacity: 0, y: 40, scale: 0.95 },
        to: {
            opacity: isConnected ? 1 : 0,
            y: isConnected ? 0 : 40,
            scale: isConnected ? 1 : 0.95,
        },
        config: config.gentle,
        delay: 100,
    });

    // Connected - show wallet panels
    if (isConnected) {
        return (
            <PageLayout className="p-4 lg:p-8">
                {/* Desktop: 3 columns, Mobile: single column */}
                <div className={cn(
                    'w-full max-w-7xl mx-auto',
                    'grid gap-6',
                    // Mobile: single column centered
                    'grid-cols-1 justify-items-center',
                    // Tablet: 2 columns
                    'md:grid-cols-2 md:justify-items-stretch',
                    // Desktop (1024px+): 3 columns
                    'lg:grid-cols-[minmax(260px,1fr)_minmax(340px,1.3fr)_minmax(260px,1fr)]',
                    'items-start'
                )}>
                    {/* Panel 1: Wallet Card + Token Selector */}
                    <animated.div
                        style={{
                            opacity: trail[0]?.opacity,
                            transform: trail[0]?.y.to(y => `translateY(${y}px)`),
                        }}
                        className="flex flex-col items-center gap-4"
                    >
                        {/* Wallet Card */}
                        <WalletCard className="mb-2" />

                        {/* Address */}
                        <AddressDisplay address={walletStore.balances.get('tron')?.address || ''} />

                        {/* Token Selector */}
                        <Panel variant="glass" padding="sm" className="w-full max-w-[288px]">
                            <TokenSelector className="justify-center" />
                        </Panel>

                        {/* Disconnect - mobile only */}
                        <button
                            onClick={() => authStore.disconnect()}
                            className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors mt-2 lg:hidden"
                        >
                            Отключиться
                        </button>
                    </animated.div>

                    {/* Panel 2: Transaction Form */}
                    <animated.div
                        style={{
                            opacity: trail[1]?.opacity,
                            transform: trail[1]?.y.to(y => `translateY(${y}px)`),
                        }}
                    >
                        <Panel
                            title="Send Transaction"
                            subtitle={`Transfer ${walletStore.currentSymbol} to any address`}
                            variant="default"
                            padding="lg"
                        >
                            <TransactionForm
                                onSend={handleSend}
                                isActive={true}
                            />
                        </Panel>

                        {/* Error - below form */}
                        {walletStore.sendError && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <p className="text-red-400 text-sm">{walletStore.sendError}</p>
                                    <button
                                        onClick={() => walletStore.clearSendError()}
                                        className="text-red-400 hover:text-red-300 ml-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </animated.div>

                    {/* Panel 3: Transaction Cost (adapts to TRX/USDT) */}
                    <animated.div
                        style={{
                            opacity: trail[2]?.opacity,
                            transform: trail[2]?.y.to(y => `translateY(${y}px)`),
                        }}
                        className="space-y-4"
                    >
                        <TransactionCost
                            recipientAddress={transactionFormStore.address}
                            amount={transactionFormStore.amount}
                        />

                        {/* Disconnect - desktop only */}
                        <button
                            onClick={() => authStore.disconnect()}
                            className="hidden lg:block w-full text-zinc-500 text-sm hover:text-zinc-300 transition-colors text-center py-3"
                        >
                            Отключиться
                        </button>
                    </animated.div>
                </div>
            </PageLayout>
        );
    }

    // Not connected - show login
    return (
        <PageLayout centerContent>
            <LoginButton />
        </PageLayout>
    );
});

// ============================================================================
// Address Display Component
// ============================================================================

interface AddressDisplayProps {
    address: string;
    className?: string;
}

const AddressDisplay = observer(function AddressDisplay({ address, className }: AddressDisplayProps) {
    if (!address) return null;

    const shortAddress = `${address.slice(0, 8)}...${address.slice(-6)}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(address);
    };

    return (
        <button
            onClick={copyToClipboard}
            className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl',
                'bg-zinc-800/50 border border-zinc-700/50',
                'hover:bg-zinc-700/50 hover:border-zinc-600/50',
                'transition-colors group',
                className
            )}
        >
            <span className="font-mono text-sm text-zinc-400 group-hover:text-zinc-300">
                {shortAddress}
            </span>
            <svg
                className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
            </svg>
        </button>
    );
});

