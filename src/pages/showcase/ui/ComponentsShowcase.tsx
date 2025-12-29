import {useRef, useState} from 'react';
import {
    // Cards
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    FlipCard,
    GlareCard,
    WobbleCard,
    // Glow Effects
    GlowBorder,
    GlowingEffectCard,
    // Buttons
    ShimmerButton,
    MagneticButton,
    RippleButton,
    RainbowButton,
    // Inputs
    AnimatedInput,
    // Counter
    AnimatedCounter,
    // List
    AnimatedList,
    // Tabs
    AnimatedTabs,
    // Skeleton
    Skeleton,
    SkeletonCard,
    // Theme
    ThemeToggle,
    // Types
    type AnimatedCounterRef,
    type AnimatedListRef,
    type AnimatedTabsRef,
    type MagneticButtonRef,
    type AnimatedInputRef,
    type Tab, AnimatedText,
} from 'shared/ui'
import {animated} from '@react-spring/web'
import {themeStore} from "@/shared";
import { observer } from "mobx-react-lite";
// ============================================================================
// Demo Data
// ============================================================================

const demoTransactions = [
    {id: '1', type: 'deposit', amount: 1500, currency: 'EUR', status: 'completed'},
    {id: '2', type: 'exchange', amount: 500, currency: 'USDC', status: 'pending'},
    {id: '3', type: 'withdrawal', amount: 200, currency: 'EUR', status: 'completed'},
    {id: '4', type: 'deposit', amount: 3000, currency: 'KZT', status: 'completed'},
];

const demoTabs: Tab[] = [
    {id: 'overview', label: 'Overview', content: <OverviewContent/>},
    {id: 'transactions', label: 'Transactions', content: <TransactionsContent/>},
    {id: 'settings', label: 'Settings', content: <SettingsContent/>},
];

function OverviewContent() {
    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Account Overview</h3>
            <p className="text-zinc-400">Your account summary and quick stats.</p>
        </div>
    );
}

function TransactionsContent() {
    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <p className="text-zinc-400">View your transaction history.</p>
        </div>
    );
}

function SettingsContent() {
    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Settings</h3>
            <p className="text-zinc-400">Manage your account preferences.</p>
        </div>
    );
}

// ============================================================================
// Main Showcase Component
// ============================================================================


export  const ComponentsShowcase = observer(() =>{
    // Refs for imperative control
    const counterRef = useRef<AnimatedCounterRef>(null);
    const listRef = useRef<AnimatedListRef>(null);
    const tabsRef = useRef<AnimatedTabsRef>(null);
    const magneticRef = useRef<MagneticButtonRef>(null);
    const inputRef = useRef<AnimatedInputRef>(null);
    const goldStyle= themeStore.goldStyle

    // State
    const [balance, setBalance] = useState(12500.5);
    const [showSkeleton, setShowSkeleton] = useState(true);

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 sm:space-y-12">
            {/* Header */}
            {/*<header className="text-center space-y-2">*/}
            {/*    <AnimatedText*/}
            {/*        text="React Spring Imperative Animations + FSD Architecture"*/}
            {/*        colors={[[0.65, 0.12, 220], [0.55, 0.10, 200]]}*/}
            {/*        className="text-xs sm:text-sm md:text-base"*/}
            {/*    />*/}
            {/*</header>*/}
            {/* ================================================================ */}
            {/* Buttons Section */}
            {/* ================================================================ */}
            <section className="space-y-4">
                <animated.h2 style={goldStyle} className="text-xl sm:text-2xl font-semibold">Buttons</animated.h2>
                <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center sm:justify-start">
                    <ShimmerButton
                        shimmerColor="#ffffff"
                        shimmerDuration={2.5}
                        shimmerSpread={90}
                        shimmerSize="0.15em"
                        shimmerBlur={4}
                    >
                        Shimmer Button
                    </ShimmerButton>

                    <MagneticButton
                        ref={magneticRef}
                        glow
                        strength={0.5}
                        onClick={() => magneticRef.current?.pulse()}
                    >
                        Magnetic Button
                    </MagneticButton>

                    <RippleButton variant="gradient">
                        Ripple Effect
                    </RippleButton>

                    <RippleButton variant="outline">
                        Outline Ripple
                    </RippleButton>

                    <RainbowButton>
                        Rainbow Button
                    </RainbowButton>
                </div>
            </section>
            {/* ================================================================ */}
            {/* Cards Section */}
            {/* ================================================================ */}
            <section className="space-y-4 sm:space-y-6">
                <animated.h2 style={goldStyle} className="text-xl sm:text-2xl font-semibold">Cards</animated.h2>

                {/* Row 1: Basic cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* 3D Tilt Card */}
                    <Card
                        variant="glass"
                        hover
                        glow
                        tiltIntensity={0.2}
                        className="p-6"
                    >
                        <CardHeader className="p-0 pb-4">
                            <CardTitle>Glass Tilt</CardTitle>
                            <CardDescription>3D tilt + glow on hover</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <p className="text-zinc-300">
                                Move cursor to see the 3D tilt and glow effects.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Glow Border Card */}
                    <GlowBorder
                        colors={['#0ea5e9', '#06b6d4', '#14b8a6']}
                        borderWidth={2}
                        duration={3}
                    >
                        <div className="bg-zinc-900 p-6 rounded-xl h-full">
                            <h3 className="text-xl font-bold text-white mb-2">Glow Border</h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                Animated gradient border effect
                            </p>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs">animated</span>
                                <span className="px-2 py-1 rounded bg-teal-500/20 text-teal-400 text-xs">css mask</span>
                            </div>
                        </div>
                    </GlowBorder>

                    {/* Flip Card */}
                    <FlipCard
                        rotate="y"
                        back={
                            <div className="flex flex-col items-center justify-center h-full">
                                <span className="text-4xl mb-2">✨</span>
                                <h3 className="text-lg font-bold text-white">Back Side</h3>
                                <p className="text-zinc-400 text-sm mt-2">Move away to flip back</p>
                            </div>
                        }
                    >
                        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-600 to-cyan-700 p-6">
                            <span className="text-4xl mb-2">💳</span>
                            <h3 className="text-xl font-bold text-white">Flip Card</h3>
                            <p className="text-white/70 text-sm mt-1">Hover to flip</p>
                        </div>
                    </FlipCard>
                </div>

                {/* Row 2: Advanced cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Glowing Effect Card */}
                    <GlowingEffectCard className="h-64">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Glowing Effect</h3>
                            <p className="text-zinc-400 text-sm">
                                Metallic gradient follows your cursor
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-pink-400 animate-pulse"/>
                            <span className="text-zinc-500 text-xs">Move cursor nearby</span>
                        </div>
                    </GlowingEffectCard>

                    {/* Glare Card */}
                    <GlareCard
                        className="p-6 h-64"
                        borderColors={['#0ea5e9', '#06b6d4', '#14b8a6']}
                        glareColor="rgba(14, 165, 233, 0.3)"
                    >
                        <div className="flex flex-col justify-between h-full">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Glare Card</h3>
                                <p className="text-zinc-400 text-sm">
                                    Glare highlight follows your cursor
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-400 text-xs">spotlight</span>
                                <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs">border</span>
                            </div>
                        </div>
                    </GlareCard>

                    {/* Wobble Card */}
                    <WobbleCard variant="gradient" className="p-6 h-64">
                        <div className="flex flex-col justify-between h-full">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Wobble Card</h3>
                                <p className="text-white/70 text-sm">
                                    Subtle 3D tilt following cursor
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl">🎯</span>
                                <span className="text-white/50 text-xs">Move cursor around</span>
                            </div>
                        </div>
                    </WobbleCard>
                </div>

                {/* Row 3: Glow Border variations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <GlowBorder
                        colors={['#f59e0b', '#eab308', '#84cc16']}
                        borderWidth={2}
                        duration={5}
                    >
                        <div className="bg-zinc-900 p-8 rounded-xl">
                            <div className="flex items-center gap-6">
                                <span className="text-5xl">☀️</span>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Warm Glow</h3>
                                    <p className="text-zinc-400 text-sm">
                                        Amber-yellow-lime gradient border
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlowBorder>

                    <GlowBorder
                        colors={['#8b5cf6', '#6366f1', '#3b82f6']}
                        borderWidth={3}
                        duration={4}
                    >
                        <div className="bg-zinc-900 p-8 rounded-xl">
                            <div className="flex items-center gap-6">
                                <span className="text-5xl">🌌</span>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Cosmic Glow</h3>
                                    <p className="text-zinc-400 text-sm">
                                        Violet-indigo-blue gradient border
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlowBorder>
                </div>
            </section>


            {/* ================================================================ */}
            {/* Inputs Section */}
            {/* ================================================================ */}
            <section className="space-y-4">
                <animated.h2 style={goldStyle} className="text-xl sm:text-2xl font-semibold">Inputs</animated.h2>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-xl">
                    <AnimatedInput
                        ref={inputRef}
                        placeholders={[
                            'Type and press Enter...',
                            'Your text will vanish!',
                            'Spotlight + Particle effect',
                        ]}
                        spotlightColor="rgba(14, 165, 233, 0.5)"
                        spotlightRadius={150}
                        onSubmit={(value) => console.log('Submitted:', value)}
                    />
                </div>
            </section>

            {/* ================================================================ */}
            {/* Counter Section */}
            {/* ================================================================ */}
            <section className="space-y-4">
                <animated.h2 style={goldStyle} className="text-xl sm:text-2xl font-semibold">Animated Counter</animated.h2>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                        <AnimatedCounter
                            ref={counterRef}
                            value={balance}
                            decimals={2}
                            prefix="€"
                            thousandsSeparator=" "
                            decimalSeparator=","
                            duration={1000}
                        />
                    </div>

                    <div className="flex gap-2">
                        <RippleButton
                            variant="outline"
                            onClick={() => setBalance((b) => b + 1000)}
                        >
                            +1000
                        </RippleButton>
                        <RippleButton
                            variant="ghost"
                            onClick={() => setBalance((b) => Math.max(0, b - 500))}
                        >
                            -500
                        </RippleButton>
                        <RippleButton
                            variant="ghost"
                            onClick={() => counterRef.current?.reset()}
                        >
                            Reset
                        </RippleButton>
                    </div>
                </div>
            </section>

            {/* ================================================================ */}
            {/* Animated List Section */}
            {/* ================================================================ */}
            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <animated.h2 style={goldStyle} className="text-xl sm:text-2xl font-semibold">Animated List</animated.h2>
                    <div className="flex gap-2">
                        <RippleButton
                            variant="ghost"
                            onClick={() => listRef.current?.animateIn()}
                        >
                            Replay
                        </RippleButton>
                    </div>
                </div>

                <AnimatedList
                    ref={listRef}
                    items={demoTransactions}
                    keyExtractor={(item) => item.id}
                    animation="slideLeft"
                    staggerDelay={80}
                    itemClass="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800"
                    renderItem={(item) => (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {item.type === 'deposit' ? '📥' : item.type === 'withdrawal' ? '📤' : '🔄'}
                  </span>
                                <div>
                                    <p className="text-white font-medium capitalize">{item.type}</p>
                                    <p className="text-zinc-500 text-sm">{item.currency}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-mono">
                                    {item.type === 'withdrawal' ? '-' : '+'}
                                    {item.amount.toLocaleString()}
                                </p>
                                <p className={`text-sm ${
                                    item.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                                }`}>
                                    {item.status}
                                </p>
                            </div>
                        </div>
                    )}
                />
            </section>

            {/* ================================================================ */}
            {/* Tabs Section */}
            {/* ================================================================ */}
            <section className="space-y-4">
                <animated.h2 style={goldStyle} className="text-xl sm:text-2xl font-semibold">Animated Tabs</animated.h2>

                <Card variant="elevated" className="overflow-hidden">
                    <AnimatedTabs
                        ref={tabsRef}
                        tabs={demoTabs}
                        transition="slide"
                        tabListClass="bg-zinc-900"
                        contentClass="min-h-[150px]"
                    />
                </Card>
            </section>

            {/* ================================================================ */}
            {/* Skeleton Section */}
            {/* ================================================================ */}
            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <animated.h2 style={goldStyle} className="text-xl sm:text-2xl font-semibold">Skeleton Loading</animated.h2>
                    <RippleButton
                        variant="ghost"
                        onClick={() => setShowSkeleton((s) => !s)}
                    >
                        Toggle
                    </RippleButton>
                </div>

                {showSkeleton && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <SkeletonCard shimmerSpeed={1200}/>

                        <div className="space-y-4 p-4 bg-zinc-900 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Skeleton variant="circular" width={48} height={48}/>
                                <div className="flex-1 space-y-2">
                                    <Skeleton height={16} width="60%"/>
                                    <Skeleton height={12} width="40%"/>
                                </div>
                            </div>
                            <Skeleton height={100} radius="lg"/>
                            <div className="flex gap-2">
                                <Skeleton height={36} width={100} radius="full"/>
                                <Skeleton height={36} width={100} radius="full"/>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* ================================================================ */}
            {/* Theme Toggle Section */}
            {/* ================================================================ */}
            <section className="space-y-4">
                <animated.h2 style={goldStyle} className="text-xl sm:text-2xl font-semibold">Theme Toggle</animated.h2>

                <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                    <div className="flex flex-col items-center gap-2">
                        <ThemeToggle size="sm"/>
                        <span className="text-zinc-400 text-sm">Small</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <ThemeToggle size="md"/>
                        <span className="text-zinc-400 text-sm">Medium</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <ThemeToggle size="lg"/>
                        <span className="text-zinc-400 text-sm">Large</span>
                    </div>
                </div>

                <animated.p className="text-zinc-500 text-sm">
                    Click to toggle between light and dark themes. The background gradient animates smoothly.
                </animated.p>
            </section>

            {/* Footer */}
            <footer className="text-center text-zinc-500 py-8">
                <animated.p style={{color:themeStore.color.value}}>Built with React Spring + Tailwind CSS + FSD</animated.p>
            </footer>
        </div>
    );
})
