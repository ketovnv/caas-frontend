import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { authStore } from '../model/auth.store';
import { LoginOptions } from './LoginOptions';
import { RippleButton } from 'shared/ui';
import { web3AuthService } from '@/shared/lib/web3auth';
import { getTronAccount } from '../lib/tronRpc';

// Login Button Component// ============================================================================

export const LoginButton = observer(function LoginButton() {
  const { isConnected, profileImage, displayName, email, status } = authStore;

  const [tronAddress, setTronAddress] = useState<string>('');

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (isConnected && web3AuthService.provider) {
        try {
          const address = await getTronAccount(web3AuthService.provider);
          setTronAddress(address);
        } catch (error) {
          console.error('Error fetching account info:', error);
        }
      }
    };

    fetchAccountInfo();
  }, [isConnected]);

  const handleLogout = async () => {
    await authStore.disconnect();
    setTronAddress('');
  };

  // Connected state - show profile
  if (isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 p-6  backdrop-blur-sm border  rounded-2xl max-w-md w-full">
        <div className="flex items-center gap-3">
          {profileImage && (
            <img
              src={profileImage}
              alt="Profile"
              className="w-12 h-12 rounded-full ring-2 ring-zinc-700"
            />
          )}
          <div className="text-left">
            <p className="text-white font-medium">
              {displayName}
            </p>
            {email && displayName !== email && (
              <p className="text-zinc-400 text-sm">{email}</p>
            )}
          </div>
        </div>

        {tronAddress && (
          <div className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
            <p className="text-zinc-400 text-xs mb-1">TRON Address</p>
            <p className="text-white text-sm font-mono break-all">{tronAddress}</p>
          </div>
        )}

        {/*{balance && (*/}
        {/*  <div className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">*/}
        {/*    <p className="text-zinc-400 text-xs mb-1">Balance</p>*/}
        {/*    <p className="text-white text-lg font-semibold">{balance} TRX</p>*/}
        {/*  </div>*/}
        {/*)}*/}

        <RippleButton
          onClick={handleLogout}
          disabled={status === 'disconnecting'}
          variant="outline"
          className="w-full"
        >
          {status === 'disconnecting' ? 'Disconnecting...' : 'Disconnect'}
        </RippleButton>
      </div>
    );
  }

  // Not connected - show login options
  return <LoginOptions />;
});
