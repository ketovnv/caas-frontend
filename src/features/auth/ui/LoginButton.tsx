import { useWeb3Auth, useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from '@web3auth/modal/react';
import { useState, useEffect } from 'react';
import { getTronAccount, getTronBalance } from '@/features/auth';
import {ShimmerButton} from "shared/ui";

export function LoginButton() {
  const { isConnected, provider } = useWeb3Auth();
  const { userInfo } = useWeb3AuthUser();
  const { connect } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();

  const [tronAddress, setTronAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (isConnected && provider) {
        try {
          const address = await getTronAccount(provider);
          setTronAddress(address);

          const bal = await getTronBalance(provider);
          setBalance(bal);
        } catch (error) {
          console.error('Error fetching account info:', error);
        }
      }
    };

    fetchAccountInfo();
  }, [isConnected, provider]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await connect();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await disconnect();
      setTronAddress('');
      setBalance('');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-gray-800 rounded-xl max-w-md w-full">
        <div className="flex items-center gap-3">
          {userInfo?.profileImage && (
            <img
              src={userInfo.profileImage}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
          )}
          <div className="text-left">
            <p className="text-white font-medium">
              {userInfo?.name || userInfo?.email || 'Connected'}
            </p>
            {userInfo?.email && userInfo?.name && (
              <p className="text-gray-400 text-sm">{userInfo.email}</p>
            )}
          </div>
        </div>

        {tronAddress && (
          <div className="w-full bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">TRON Address</p>
            <p className="text-white text-sm font-mono break-all">{tronAddress}</p>
          </div>
        )}

        {balance && (
          <div className="w-full bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Balance</p>
            <p className="text-white text-lg font-semibold">{balance} TRX</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {loading ? 'Disconnecting...' : 'Disconnect'}
        </button>
      </div>
    );
  }

  return (
    <ShimmerButton
      onClick={handleLogin}
      disabled={loading}
    >
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </ShimmerButton>
  );
}
