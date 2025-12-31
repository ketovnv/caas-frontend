import { createRoot } from 'react-dom/client';
import { App } from './App';
import 'app/styles/index.css';
import { web3AuthService } from 'shared/lib/web3auth';

console.debug('Start')

// Dev helper: get private key for testing
if (import.meta.env.DEV) {
  (window as any).getPrivateKey = async () => {
    const key = await web3AuthService.getPrivateKey();
    if (key) {
      console.log('Private key (hex, 64 chars):', key);
      return key;
    }
    console.log('Not connected or no key available');
    return null;
  };
  console.log('💡 Dev mode: use getPrivateKey() in console');
}
createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <App />
  // </StrictMode>
);
