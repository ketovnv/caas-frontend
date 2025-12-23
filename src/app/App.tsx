import { BrowserRouter } from 'react-router-dom';
import { Web3AuthProvider } from '@web3auth/modal/react';
import { AppRouter } from './router';
import { web3AuthContextConfig } from 'features/auth';

export function App() {
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </Web3AuthProvider>
  );
}
