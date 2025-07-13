import React from 'react';
import PropTypes from 'prop-types';

// Import SVG icons
import WalletConnectSVG from '../assets/icons/wallet-connect.svg';
import WalletDisconnectSVG from '../assets/icons/wallet-disconnect.svg';
import MetaMaskSVG from '../assets/icons/metamask.svg';
import WalletSVG from '../assets/icons/wallet.svg';

const iconMap = {
  'connect': WalletConnectSVG,
  'disconnect': WalletDisconnectSVG,
  'metamask': MetaMaskSVG,
  'wallet': WalletSVG,
  'default': WalletSVG
};

const WalletIcon = ({ 
  type = 'wallet', 
  size = 24, 
  className = '', 
  alt = 'Wallet Icon',
  onClick,
  style = {} 
}) => {
  const iconSrc = iconMap[type] || iconMap.default;
  
  const iconStyle = {
    width: size,
    height: size,
    cursor: onClick ? 'pointer' : 'default',
    ...style
  };

  return (
    <img 
      src={iconSrc} 
      alt={alt}
      className={className}
      style={iconStyle}
      onClick={onClick}
    />
  );
};

WalletIcon.propTypes = {
  type: PropTypes.oneOf(['connect', 'disconnect', 'metamask', 'wallet']),
  size: PropTypes.number,
  className: PropTypes.string,
  alt: PropTypes.string,
  onClick: PropTypes.func,
  style: PropTypes.object
};

export default WalletIcon;

// Usage examples:
// <WalletIcon type="connect" size={32} onClick={handleConnect} />
// <WalletIcon type="metamask" size={24} className="wallet-icon" />
// <WalletIcon type="disconnect" size={20} />