// ============================================================================
// RPC Provider Status Component
// ============================================================================
// Shows current RPC provider status, health, and rate limiting info

import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { themeStore } from 'shared/model';
import { cn } from 'shared/lib';
import { rpcProviderManager } from 'shared/lib/tron';

// ============================================================================
// Types
// ============================================================================

interface RpcStatusProps {
  /** Show detailed info */
  detailed?: boolean;
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

function SignalIcon({ className, level }: { className?: string; level: 'good' | 'warn' | 'bad' }) {
  const colors = {
    good: 'text-emerald-400',
    warn: 'text-amber-400',
    bad: 'text-red-400',
  };

  return (
    <svg className={cn('w-4 h-4', colors[level], className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C7.05 3 3 7.05 3 12s4.05 9 9 9 9-4.05 9-9-4.05-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" />
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

// ============================================================================
// Compact Status (for header/footer)
// ============================================================================

export const RpcStatusCompact = observer(function RpcStatusCompact({ className }: { className?: string }) {
  const { activeProvider, remainingRequests, canMakeRequest } = rpcProviderManager;
  const health = activeProvider ? rpcProviderManager.health.get(activeProvider.id) : null;

  if (!activeProvider) {
    return (
      <div className={cn('flex items-center gap-1.5 text-xs', className)}>
        <SignalIcon level="bad" />
        <span className="text-red-400">No RPC</span>
      </div>
    );
  }

  const level = health?.isHealthy
    ? (remainingRequests > 5 ? 'good' : 'warn')
    : 'bad';

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', className)}>
      <SignalIcon level={level} />
      <span className={cn(
        level === 'good' && 'text-emerald-400',
        level === 'warn' && 'text-amber-400',
        level === 'bad' && 'text-red-400',
      )}>
        {activeProvider.name}
      </span>
      {activeProvider.rateLimit > 0 && canMakeRequest && (
        <span className="text-zinc-500 tabular-nums">
          ({remainingRequests}/{activeProvider.rateLimit})
        </span>
      )}
    </div>
  );
});

// ============================================================================
// Detailed Status (for settings/debug)
// ============================================================================

export const RpcStatus = observer(function RpcStatus({ detailed = false, className }: RpcStatusProps) {
  const { providers, activeProviderId, stats } = rpcProviderManager;

  return (
    <div className={cn(
      'p-4 rounded-2xl space-y-4',
      'bg-zinc-900/60 backdrop-blur-sm',
      'border border-zinc-800/50',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <animated.span style={themeStore.grayStyle} className="text-sm font-medium">
          RPC Providers
        </animated.span>
        <span className="text-xs text-zinc-500 tabular-nums">
          {stats.totalRequests} requests / {stats.totalErrors} errors
        </span>
      </div>

      {/* Provider List */}
      <div className="space-y-2">
        {providers.map(provider => {
          const health = rpcProviderManager.health.get(provider.id);
          const isActive = provider.id === activeProviderId;

          return (
            <div
              key={provider.id}
              className={cn(
                'p-3 rounded-xl',
                'border transition-colors',
                isActive
                  ? 'bg-zinc-800/60 border-zinc-700/50'
                  : 'bg-zinc-900/40 border-zinc-800/30',
                !provider.enabled && 'opacity-50'
              )}
            >
              {/* Provider Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <SignalIcon
                    level={health?.isHealthy ? 'good' : 'bad'}
                  />
                  <span className={cn(
                    'text-sm font-medium',
                    isActive ? 'text-zinc-200' : 'text-zinc-400'
                  )}>
                    {provider.name}
                  </span>
                  {isActive && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {provider.rateLimit > 0 && (
                    <span className="text-xs text-zinc-500 tabular-nums">
                      {provider.rateLimit} req/s
                    </span>
                  )}
                  <button
                    onClick={() => rpcProviderManager.setProviderEnabled(provider.id, !provider.enabled)}
                    className={cn(
                      'w-8 h-4 rounded-full transition-colors',
                      provider.enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                    )}
                  >
                    <div className={cn(
                      'w-3 h-3 rounded-full bg-white transition-transform',
                      provider.enabled ? 'translate-x-4' : 'translate-x-0.5'
                    )} />
                  </button>
                </div>
              </div>

              {/* Detailed Stats */}
              {detailed && health && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-zinc-500">Requests</span>
                    <p className="text-zinc-300 tabular-nums">{health.totalRequests}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Errors</span>
                    <p className={cn(
                      'tabular-nums',
                      health.totalErrors > 0 ? 'text-red-400' : 'text-zinc-300'
                    )}>
                      {health.totalErrors}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Avg Time</span>
                    <p className="text-zinc-300 tabular-nums">
                      {health.avgResponseTime > 0 ? `${Math.round(health.avgResponseTime)}ms` : '—'}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {health?.lastErrorMessage && !health.isHealthy && (
                <p className="mt-2 text-xs text-red-400 truncate">
                  {health.lastErrorMessage}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {detailed && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => rpcProviderManager.checkHealth()}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg',
              'text-xs font-medium',
              'bg-zinc-800 text-zinc-300',
              'hover:bg-zinc-700 transition-colors'
            )}
          >
            Check Health
          </button>
          <button
            onClick={() => rpcProviderManager.resetStats()}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg',
              'text-xs font-medium',
              'bg-zinc-800 text-zinc-300',
              'hover:bg-zinc-700 transition-colors'
            )}
          >
            Reset Stats
          </button>
        </div>
      )}
    </div>
  );
});

export default RpcStatus;
