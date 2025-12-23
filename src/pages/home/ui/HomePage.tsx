import { LoginButton } from 'features/auth';

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900">
      <h1 className="text-5xl font-bold mb-2 text-white">CaaS Platform</h1>
      <p className="text-xl text-gray-400 mb-8">Crypto-as-a-Service</p>
      <LoginButton />
    </div>
  );
}
