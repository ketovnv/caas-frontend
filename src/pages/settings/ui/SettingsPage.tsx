import { LoginButton } from 'features/auth';
import { PageLayout } from 'shared/ui';

export function SettingsPage() {
  return (
    <PageLayout centerContent className="p-4 sm:p-8">
      {/*<p className="text-white/50 text-center max-w-md text-sm sm:text-base px-4 mb-6">*/}
      {/*  Connect your wallet to access account settings and preferences*/}
      {/*</p>*/}
      <LoginButton />
    </PageLayout>
  );
}
