import { Web3AuthContextConfig } from '@web3auth/modal/react';
import { WALLET_CONNECTORS, WEB3AUTH_NETWORK } from '@web3auth/modal';

const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || 'YOUR_CLIENT_ID';

export const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    modalConfig: {
      connectors: {
        [WALLET_CONNECTORS.AUTH]: {
          label: 'auth',
          loginMethods: {
            google: {
              name: 'Google',
              showOnModal: true,
            },
            facebook: {
              name: 'Facebook',
              showOnModal: true,
            },
            twitter: {
              name: 'Twitter',
              showOnModal: true,
            },
            discord: {
              name: 'Discord',
              showOnModal: true,
            },
            email_passwordless: {
              name: 'Email',
              showOnModal: true,
            },
            sms_passwordless: {
              name: 'SMS',
              showOnModal: true,
            },
          },
          showOnModal: true,
        },
      },
      hideWalletDiscovery: true,
    },
  },
};
