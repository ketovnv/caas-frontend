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
    // Buttons
    ShimmerButton,
    MagneticButton,
    RippleButton,
    RainbowButton,
    // Inputs
    SpotlightInput,
    VanishInput,
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
    type VanishInputRef,
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
    const vanishRef = useRef<VanishInputRef>(null);
    const goldStyle= themeStore.goldStyle

    // State
    const [balance, setBalance] = useState(12500.5);
    const [showSkeleton, setShowSkeleton] = useState(true);

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 sm:space-y-12 p-4 sm:p-6 md:p-8">
            {/* Header */}
            <header className="text-center space-y-2">
                <animated.h1 style={goldStyle} className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    CaaS UI Components
                </animated.h1>
                <AnimatedText
                    text="React Spring Imperative Animations + FSD Architecture"
                    colors={[[0.645, 0.129, 101.6],[0.203, 0.141, 264.1]]}
                    className="text-xs sm:text-sm md:text-base"
                />
            </header>
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
                        shimmerBlur={10}
                        background="rgba(0, 0, 0, 0.95)"
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
                            <CardTitle>3D Tilt Card</CardTitle>
                            <CardDescription>With glow + magnetic effect</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <p className="text-zinc-300">
                                Move your cursor over this card to see the 3D tilt and glow effects.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Gradient Card */}
                    <Card
                        variant="gradient"
                        hover
                        morphing
                        className="p-6"
                    >
                        <CardHeader className="p-0 pb-4">
                            <CardTitle>Gradient Card</CardTitle>
                            <CardDescription className="text-white/70">
                                Morphing border radius
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <p className="text-white/90">
                                Watch the border radius morph on hover!
                            </p>
                        </CardContent>
                    </Card>

                    {/* Flip Card */}
                    <FlipCard
                        rotate="y"
                        back={
                            <div className="flex flex-col items-center justify-center h-full">
                                <span className="text-4xl mb-2">✨</span>
                                <h3 className="text-lg font-bold text-white">Card Details</h3>
                                <p className="text-zinc-400 text-sm mt-2">Move away to flip back</p>
                            </div>
                        }
                    >
                        <div
                            className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-600 to-purple-600 p-6">
                            <span className="text-4xl mb-2">💳</span>
                            <h3 className="text-xl font-bold text-white">Hover to Flip!</h3>
                        </div>
                    </FlipCard>
                </div>

                {/* Row 2: Advanced cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Glare Card */}
                    <GlareCard className="p-6 h-64">
                        <div className="flex flex-col justify-between h-full">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Glare Card</h3>
                                <p className="text-zinc-400 text-sm">
                                    Linear-style glare effect that follows your cursor
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"/>
                                <span className="text-zinc-300 text-sm">Hover me!</span>
                            </div>
                        </div>
                    </GlareCard>

                    {/* Glare Card with custom colors */}
                    <GlareCard
                        className="p-6 h-64"
                        borderColors={['#f59e0b', '#ef4444', '#ec4899']}
                        glareColor="rgba(251, 191, 36, 0.3)"
                    >
                        <div className="flex flex-col justify-between h-full">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Custom Glare</h3>
                                <p className="text-zinc-400 text-sm">
                                    With custom border and glare colors
                                </p>
                            </div>
                            <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                    amber
                  </span>
                                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                    red
                  </span>
                                <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-xs">
                    pink
                  </span>
                            </div>
                        </div>
                    </GlareCard>

                    {/* Wobble Card */}
                    <WobbleCard variant="gradient" className="p-6 h-64">
                        <div className="flex flex-col justify-between h-full">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Wobble Card</h3>
                                <p className="text-white/70 text-sm">
                                    Follows cursor with a soft wobble effect
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-3xl">🎯</span>
                                <span className="text-white/50 text-xs">Move cursor around</span>
                            </div>
                        </div>
                    </WobbleCard>
                </div>

                {/* Row 3: More wobble variants */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <WobbleCard variant="pink" className="p-8">
                        <div className="flex items-center gap-6">
                            <span className="text-5xl">🎨</span>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Pink Wobble</h3>
                                <p className="text-white/70 text-sm">
                                    Perfect for creative and playful sections
                                </p>
                            </div>
                        </div>
                    </WobbleCard>

                    <WobbleCard variant="blue" className="p-8">
                        <div className="flex items-center gap-6">
                            <span className="text-5xl">🚀</span>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Blue Wobble</h3>
                                <p className="text-white/70 text-sm">
                                    Great for technology and professional content
                                </p>
                            </div>
                        </div>
                    </WobbleCard>
                </div>
            </section>


            {/* ================================================================ */}
            {/* Inputs Section */}
            {/* ================================================================ */}
            <section className="space-y-4">
                <animated.h2 style={goldStyle} className="text-xl sm:text-2xl font-semibold">Inputs</animated.h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl">
                    <SpotlightInput
                        placeholder="Spotlight input..."
                        spotlightColor="rgba(139, 92, 246, 0.5)"
                        spotlightRadius={150}
                        pulse
                    />

                    <VanishInput
                        ref={vanishRef}
                        placeholders={[
                            'Type and press Enter...',
                            'Your text will vanish!',
                            'Particle effect demo',
                        ]}
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
