// Icon components for React
import WalletConnectSVG from './wallet-connect.svg';
import WalletDisconnectSVG from './wallet-disconnect.svg';
import MetaMaskSVG from './metamask.svg';
import WalletSVG from './wallet.svg';
import CoinbaseSVG from './coinbase.svg';

// Wallet Icons Export
export { default as WalletConnectIcon } from './wallet-connect.svg';
export { default as WalletDisconnectIcon } from './wallet-disconnect.svg';
export { default as MetaMaskIcon } from './metamask.svg';
export { default as WalletIcon } from './wallet.svg';
export { default as CoinbaseIcon } from './coinbase.svg';

export const WalletIcons = {
  connect: WalletConnectSVG,
  disconnect: WalletDisconnectSVG,
  metamask: MetaMaskSVG,
  wallet: WalletSVG,
  coinbase: CoinbaseSVG
};

// Usage example:
// import { WalletConnectIcon, WalletIcons } from '../assets/icons';
// <img src={WalletConnectIcon} alt="Connect Wallet" />
// or
// <img src={WalletIcons.connect} alt="Connect Wallet" />