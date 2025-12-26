import {useEffect} from 'react';
import {Web3AuthProvider, useWeb3Auth} from '@web3auth/modal/react';
import {observer} from 'mobx-react-lite';
import {} from './router';
import {web3AuthContextConfig} from 'features/auth';
import {DefaultErrorFallback, ErrorBoundary} from 'features/error';
import {router, AppRouter} from 'app/router';
import {AnimatedThemeBackground} from "shared/ui/animated/background";
import {NavLinks} from "widgets/nav-links";
import {logger} from "shared/lib";


// Syncs Web3Auth state → router.isAuthenticated
const AuthSync = observer(function AuthSync() {
    const {isConnected} = useWeb3Auth();

    useEffect(() => {
        router.setAuthenticated(isConnected);
    }, [isConnected]);

    return null;
});


export function App() {
    logger.time('Start...')
    logger.info(' 🐘Starting App...')
    router.setup()
    return (
        <ErrorBoundary
            fallback={DefaultErrorFallback}
            onError={(error, errorInfo) => {
                console.error('Error in App:', error, errorInfo);
            }}
        >
            <Web3AuthProvider config={web3AuthContextConfig}>
                <AnimatedThemeBackground fixed noise vignette>
                    <NavLinks/>
                    <AuthSync/>
                    <main className="flex flex-col items-center min-h-screen px-4 py-16 gap-4">
                        <AppRouter/>
                    </main>
                </AnimatedThemeBackground>
            </Web3AuthProvider>
        </ErrorBoundary>
    );
}
