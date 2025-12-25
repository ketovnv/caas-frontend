import {LoginButton} from 'features/auth';
import {NavLinks} from 'widgets/nav-links';
import {AnimatedText} from 'shared/ui';
import {RAINBOWGRADIENT} from '@/shared';

export function HomePage() {
    return (
            <div className="flex flex-col items-center justify-center flex-1 p-8">
                <h1 className="text-5xl font-bold mb-2 text-yellow-200">CaaS Platform</h1>
                <AnimatedText text="Crypto as a Service"
                              colors={RAINBOWGRADIENT}
                />
                <div className="mt-8">
                    <LoginButton/>
                </div>
            </div>
    );
}
