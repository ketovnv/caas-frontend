import {useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {} from './router';
import {authStore} from 'features/auth';
import {DefaultErrorFallback, ErrorBoundary} from 'features/error';
import {router, AppRouter} from 'app/router';
import {AnimatedThemeBackground} from "shared/ui/animated/background";
import {NavLinks} from "widgets/nav-links";
import {GlobalHeader} from "widgets/global-header";
import {logger} from "shared/lib";


// Syncs AuthStore state → router.isAuthenticated
const AuthSync = observer(function AuthSync() {
    const {isConnected} = authStore;

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
            <AnimatedThemeBackground fixed noise>
                <NavLinks/>
                <AuthSync/>
                <GlobalHeader/>
                <main className="flex-1 flex flex-col items-center overflow-y-auto scrollbar-hide px-3 sm:px-4 md:px-6 pb-24 gap-4">
                    <AppRouter/>
                </main>
            </AnimatedThemeBackground>
        </ErrorBoundary>
    );
}
