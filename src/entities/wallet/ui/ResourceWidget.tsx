import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { themeStore } from 'shared/model';
import { cn } from 'shared/lib';
import { resourceStore } from '../model/resource.store';
import { walletStore } from '../model/wallet.store';

// ============================================================================
// Icons
// ============================================================================

function EnergyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function BandwidthIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

// ============================================================================
// Resource Bar Component
// ============================================================================

interface ResourceBarProps {
  label: string;
  icon: React.ReactNode;
  available: number;
  total: number;
  colorClass?: string;
}

function ResourceBar({ label, icon, available, total, colorClass = 'bg-emerald-500' }: ResourceBarProps) {
  const percentage = total > 0 ? Math.min(100, (available / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-zinc-300 tabular-nums font-medium">
          {available.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Time Since Update Helper
// ============================================================================

function formatTimeSince(timestamp: number | null): string {
  if (!timestamp) return '';

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'щойно';
  if (seconds < 120) return '1 хв тому';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} хв тому`;

  return `${Math.floor(seconds / 3600)} год тому`;
}

// ============================================================================
// Main Component
// ============================================================================

interface ResourceWidgetProps {
  className?: string;
  /** Show compact version */
  compact?: boolean;
}

export const ResourceWidget = observer(function ResourceWidget({
  className,
  compact = false,
}: ResourceWidgetProps) {
  const {
    resources,
    availableEnergy,
    totalEnergy,
    availableBandwidth,
    totalBandwidth,
    freeBandwidthRemaining,
    isLoadingResources,
    lastUpdated,
  } = resourceStore;

  const { currentAddress, selectedToken } = walletStore;
  const isNative = selectedToken === 'native';

  // Manual refresh handler
  const handleRefresh = async () => {
    if (currentAddress && !isLoadingResources) {
      await resourceStore.refresh(currentAddress);
    }
  };

  // Force re-render every 30 seconds to update "time since"
  useEffect(() => {
    const interval = setInterval(() => {
      // Just trigger re-render
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Don't render if not connected
  if (!currentAddress) {
    return null;
  }

  // Loading state
  if (!resources && isLoadingResources) {
    return (
      <div className={cn(
        'p-4 rounded-2xl',
        'bg-zinc-900/60 backdrop-blur-sm',
        'border border-zinc-800/50',
        className
      )}>
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Error state
  if (resourceStore.resourcesError && !resources) {
    return (
      <div className={cn(
        'p-4 rounded-2xl',
        'bg-zinc-900/60 backdrop-blur-sm',
        'border border-red-500/30',
        className
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-400">Помилка завантаження</span>
          <button
            onClick={handleRefresh}
            disabled={isLoadingResources}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          >
            <RefreshIcon className={cn('w-4 h-4', isLoadingResources && 'animate-spin')} />
          </button>
        </div>
        <p className="text-xs text-zinc-500">
          Не вдалося отримати ресурси. Спробуйте оновити.
        </p>
      </div>
    );
  }

  // No resources yet
  if (!resources) {
    return null;
  }

  return (
    <div className={cn(
      'p-4 rounded-2xl space-y-3',
      'bg-zinc-900/60 backdrop-blur-sm',
      'border border-zinc-800/50',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <animated.span style={themeStore.grayStyle} className="text-sm font-medium">
          {isNative ? 'Bandwidth' : 'Ресурси'}
        </animated.span>
        <div className="flex items-center gap-2">
          {/* Last updated */}
          {lastUpdated && (
            <span className="text-xs text-zinc-500">
              {formatTimeSince(lastUpdated)}
            </span>
          )}
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isLoadingResources}
            className={cn(
              'p-1.5 rounded-lg',
              'text-zinc-500 hover:text-zinc-300',
              'hover:bg-zinc-800/50',
              'transition-colors duration-200',
              'disabled:opacity-50'
            )}
          >
            <RefreshIcon className={cn(
              'w-4 h-4',
              isLoadingResources && 'animate-spin'
            )} />
          </button>
        </div>
      </div>

      {/* Resource Bars */}
      <div className={cn('space-y-3', compact && 'space-y-2')}>
        {/* Energy - only for USDT */}
        {!isNative && (
          <ResourceBar
            label="Енергія"
            icon={<EnergyIcon className="w-3.5 h-3.5" />}
            available={availableEnergy}
            total={totalEnergy || availableEnergy}
            colorClass="bg-amber-500"
          />
        )}

        {/* Bandwidth - always shown */}
        <ResourceBar
          label="Bandwidth"
          icon={<BandwidthIcon className="w-3.5 h-3.5" />}
          available={availableBandwidth}
          total={totalBandwidth || availableBandwidth}
          colorClass="bg-blue-500"
        />
      </div>

      {/* Free bandwidth hint - for TRX */}
      {isNative && freeBandwidthRemaining > 0 && !compact && (
        <p className="text-xs text-zinc-500">
          Безкоштовний: {freeBandwidthRemaining.toLocaleString()} bytes
        </p>
      )}
    </div>
  );
});
