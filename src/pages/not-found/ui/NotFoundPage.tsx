import { PageLayout } from 'shared/ui';
import { router } from 'app/router';

export function NotFoundPage() {
  return (
    <PageLayout centerContent className="p-4 sm:p-8">
      <p className="text-white/50 text-center max-w-md text-sm sm:text-base px-4 mb-6">
        The page you're looking for doesn't exist or has been moved
      </p>
      <button
        onClick={() => router.navigate('home')}
        className="px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm sm:text-base"
      >
        Back to Home
      </button>
    </PageLayout>
  );
}
