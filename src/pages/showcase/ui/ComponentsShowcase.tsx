import { useRef, useState } from 'react';
import {
  // Cards
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  FlipCard,
  // Buttons
  ShimmerButton,
  MagneticButton,
  RippleButton,
  // Inputs
  SpotlightInput,
  VanishInput,
  // Background
  AsphaltBackground,
  // Counter
  AnimatedCounter,
  // List
  AnimatedList,
  // Tabs
  AnimatedTabs,
  // Skeleton
  Skeleton,
  SkeletonCard,
  // Types
  type AnimatedCounterRef,
  type AnimatedListRef,
  type AnimatedTabsRef,
  type MagneticButtonRef,
  type VanishInputRef,
  type Tab,
} from 'shared/ui';

// ============================================================================
// Demo Data
// ============================================================================

const demoTransactions = [
  { id: '1', type: 'deposit', amount: 1500, currency: 'EUR', status: 'completed' },
  { id: '2', type: 'exchange', amount: 500, currency: 'USDC', status: 'pending' },
  { id: '3', type: 'withdrawal', amount: 200, currency: 'EUR', status: 'completed' },
  { id: '4', type: 'deposit', amount: 3000, currency: 'KZT', status: 'completed' },
];

const demoTabs: Tab[] = [
  { id: 'overview', label: 'Overview', content: <OverviewContent /> },
  { id: 'transactions', label: 'Transactions', content: <TransactionsContent /> },
  { id: 'settings', label: 'Settings', content: <SettingsContent /> },
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

export function ComponentsShowcase() {
  // Refs for imperative control
  const counterRef = useRef<AnimatedCounterRef>(null);
  const listRef = useRef<AnimatedListRef>(null);
  const tabsRef = useRef<AnimatedTabsRef>(null);
  const magneticRef = useRef<MagneticButtonRef>(null);
  const vanishRef = useRef<VanishInputRef>(null);

  // State
  const [balance, setBalance] = useState(12500.5);
  const [showSkeleton, setShowSkeleton] = useState(true);

  return (
    <AsphaltBackground className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">
            CaaS UI Components
          </h1>
          <p className="text-zinc-400">
            React Spring Imperative Animations + FSD Architecture
          </p>
        </header>

        {/* ================================================================ */}
        {/* Cards Section */}
        {/* ================================================================ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 3D Tilt Card */}
            <Card
              variant="glass"
              hover
              glow
              tiltIntensity={0.2}
              animationPreset="slideInUp"
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
              animationPreset="zoomIn"
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
              className="h-72"
            >
              {/* Front */}
              <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-600 to-purple-600 p-6">
                <span className="text-4xl mb-2">💳</span>
                <h3 className="text-xl font-bold text-white">Flip Me!</h3>
              </div>
              {/* Back is default */}
            </FlipCard>
          </div>
        </section>

        {/* ================================================================ */}
        {/* Buttons Section */}
        {/* ================================================================ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Buttons</h2>

          <div className="flex flex-wrap gap-4 items-center">
            <ShimmerButton
              shimmerColor="#3b82f6"
              shimmerSpeed={1.5}
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
          </div>
        </section>

        {/* ================================================================ */}
        {/* Inputs Section */}
        {/* ================================================================ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Inputs</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
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
          <h2 className="text-2xl font-semibold text-white">Animated Counter</h2>
          
          <div className="flex items-center gap-6">
            <div className="text-4xl font-bold text-white">
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Animated List</h2>
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
          <h2 className="text-2xl font-semibold text-white">Animated Tabs</h2>
          
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Skeleton Loading</h2>
            <RippleButton
              variant="ghost"
              onClick={() => setShowSkeleton((s) => !s)}
            >
              Toggle
            </RippleButton>
          </div>

          {showSkeleton && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonCard shimmerSpeed={1200} />

              <div className="space-y-4 p-4 bg-zinc-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div className="flex-1 space-y-2">
                    <Skeleton height={16} width="60%" />
                    <Skeleton height={12} width="40%" />
                  </div>
                </div>
                <Skeleton height={100} radius="lg" />
                <div className="flex gap-2">
                  <Skeleton height={36} width={100} radius="full" />
                  <Skeleton height={36} width={100} radius="full" />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center text-zinc-500 py-8">
          <p>Built with React Spring + Tailwind CSS + FSD</p>
        </footer>
      </div>
    </AsphaltBackground>
  );
}
