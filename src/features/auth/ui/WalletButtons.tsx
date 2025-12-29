import {authStore} from '@/features/auth/model/auth.store';
import {observer} from 'mobx-react-lite';

export const WalletButtons = observer(() =>
    <div>
        {/* WalletConnect QR */}
        {authStore.isWalletConnectAvailable && (
            <button onClick={() => authStore.connectWalletConnect()}>
                📱 WalletConnect
            </button>
        )}

        {/* Specific wallets via Reown */}
        <button onClick={() => authStore.connectReownWallet('trust')}>
            Trust Wallet
        </button>
        <button onClick={() => authStore.connectReownWallet('rainbow')}>
            Rainbow
        </button>
    </div>
);