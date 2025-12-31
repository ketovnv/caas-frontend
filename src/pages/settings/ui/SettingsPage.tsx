import { observer } from 'mobx-react-lite';
import { LoginButton } from 'features/auth';
import { PageLayout } from 'shared/ui';
import { networkStore, settingsStore } from 'shared/model';
import { cn } from 'shared/lib';
import type { NetworkId } from 'entities/wallet/config/networks.config';

// ============================================================================
// Toggle Switch Component
// ============================================================================

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

// ============================================================================
// Settings Section Component
// ============================================================================

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className={cn(
        'bg-zinc-900/60 backdrop-blur-sm',
        'border border-zinc-800/50 rounded-2xl',
        'px-4 divide-y divide-zinc-800/30'
      )}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Network Selector Component
// ============================================================================

const NetworkSelector = observer(function NetworkSelector() {
  const handleNetworkChange = async (networkId: NetworkId) => {
    await networkStore.setNetwork(networkId);
  };

  return (
    <div className="py-3">
      <span className="block text-sm font-medium text-zinc-200 mb-3">
        Network
      </span>
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
          className="flex items-center gap-1 mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
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

// ============================================================================
// Settings Page
// ============================================================================

export const SettingsPage = observer(function SettingsPage() {
  return (
    <PageLayout className="p-4 sm:p-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Network Section */}
        <SettingsSection title="Network">
          <NetworkSelector />
        </SettingsSection>

        {/* Display Section */}
        <SettingsSection title="Display">
          <ToggleSwitch
            checked={settingsStore.showNetworkBadge}
            onChange={settingsStore.setShowNetworkBadge}
            label="Show network in header"
            description="Display current network badge in the app header"
          />
          <ToggleSwitch
            checked={settingsStore.showFpsMonitor}
            onChange={settingsStore.setShowFpsMonitor}
            label="Show FPS monitor"
            description="Display performance monitor overlay"
          />
        </SettingsSection>

        {/* Account Section */}
        <SettingsSection title="Account">
          <div className="py-3">
            <LoginButton />
          </div>
        </SettingsSection>
      </div>
    </PageLayout>
  );
});
