import {
  ConnectWalletButtonProps,
  SignErrorCode,
  UnavailableWalletVisibility,
} from '../../global/types';
import {
  Dropdown,
  Menu,
  MenuItem,
  MenuItemIcon,
  Button,
  DesktopMenuItem,
} from './StyledButtonElements';
import { getInstalledWalletExtensions, getWalletIcon } from '../../utils';
import { useCardano } from '../../hooks';
import { capitalize, formatSupportedWallets } from '../../common';
import Color from 'color';

const ConnectWalletButton = ({
  label = 'Connect Wallet',
  disabled,
  message,
  supportedWallets = ['Flint', 'Nami', 'Eternl', 'Yoroi', 'Typhon'],
  showUnavailableWallets = UnavailableWalletVisibility.SHOW_UNAVAILABLE_ON_MOBILE,
  primaryColor,
  borderRadius = 15,
  customCSS,
  customActions = [],
  hideActionMenu = false,
  afterComponent,
  beforeComponent,
  onConnect,
  onDisconnect,
  onSignMessage,
  onStakeAddressClick,
}: ConnectWalletButtonProps) => {
  const {
    isEnabled,
    stakeAddress,
    signMessage,
    connect,
    disconnect,
    isConnected,
  } = useCardano();

  const mobileWallets = ['flint'];
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  let availableWallets: Array<string> = [];
  const { HIDE_UNAVAILABLE, SHOW_UNAVAILABLE } = UnavailableWalletVisibility;

  if (showUnavailableWallets === HIDE_UNAVAILABLE) {
    availableWallets = getInstalledWalletExtensions(supportedWallets);
  } else if (showUnavailableWallets === SHOW_UNAVAILABLE) {
    availableWallets = supportedWallets;
  } else {
    if (isMobile) {
      availableWallets = supportedWallets;
    } else {
      availableWallets = getInstalledWalletExtensions(supportedWallets);
    }
  }

  const connectWallet = async (walletName: string) => {
    const onSuccess = () => {
      if (typeof onConnect === 'function') {
        onConnect();
      }
    };

    const onError = (code: SignErrorCode) => {
      if (code === SignErrorCode.WalletExtensionNotFound) {
        alert(
          `Please make sure you are using a modern browser and the ${walletName} browser extension has been installed.`
        );
      } else {
        alert(`Something went wrong. Please try again later.`);
      }
    };

    connect(walletName, onSuccess, onError);
  };

  const connectMobileWallet = async (walletName: string) => {
    if (!isMobile) {
      connectWallet(walletName);
    }

    if (!mobileWallets.includes(walletName.toLowerCase())) {
      return;
    }

    if (walletName.toLowerCase() === 'flint') {
      if (availableWallets.includes('flint')) {
        connectWallet(walletName);
      } else {
        window.location.href = `https://flint-wallet.app.link/browse?dappUrl=${encodeURIComponent(
          window.location.href
        )}`;
      }
    }
  };

  const themeColorObject = primaryColor
    ? Color(primaryColor)
    : Color('#0538AF');
  const buttonTitle =
    stakeAddress && isConnected ? `${stakeAddress.slice(0, 12)}...` : label;

  const clickStakeAddress = () => {
    if (
      stakeAddress &&
      isConnected &&
      typeof onStakeAddressClick === 'function'
    ) {
      onStakeAddressClick(stakeAddress);
    }
  };

  const walletMenu = (
    <Menu>
      {availableWallets ? (
        availableWallets.map((availableWallet) => {
          if (
            isMobile &&
            !mobileWallets.includes(availableWallet.toLowerCase())
          ) {
            return (
              <DesktopMenuItem
                borderRadius={borderRadius}
                key={availableWallet}
              >
                <MenuItemIcon src={getWalletIcon(availableWallet)} />
                {capitalize(availableWallet)}
                <span>Desktop Only</span>
              </DesktopMenuItem>
            );
          }

          return (
            <MenuItem
              borderRadius={borderRadius}
              primaryColor={themeColorObject.hex()}
              primaryColorLight={themeColorObject.alpha(0.2).hexa()}
              key={availableWallet}
              onClick={() => connectMobileWallet(availableWallet)}
            >
              <MenuItemIcon src={getWalletIcon(availableWallet)} />
              {capitalize(availableWallet)}
            </MenuItem>
          );
        })
      ) : (
        <span>{`Please install a wallet browser extension (${formatSupportedWallets(
          supportedWallets
        )} are supported)`}</span>
      )}
    </Menu>
  );

  const actionMenu = hideActionMenu ? null : (
    <Menu>
      {typeof message === 'string' && (
        <MenuItem
          borderRadius={borderRadius}
          primaryColor={themeColorObject.hex()}
          primaryColorLight={themeColorObject.alpha(0.1).hexa()}
          onClick={() => signMessage(message, onSignMessage)}
        >
          Sign a message
        </MenuItem>
      )}
      {customActions.map((customAction, index) => (
        <MenuItem
          borderRadius={borderRadius}
          key={`custom-action-${index}`}
          primaryColor={themeColorObject.hex()}
          primaryColorLight={themeColorObject.alpha(0.1).hexa()}
          onClick={customAction.onClick}
        >
          {customAction.label}
        </MenuItem>
      ))}
      <MenuItem
        borderRadius={borderRadius}
        primaryColor={themeColorObject.hex()}
        primaryColorLight={themeColorObject.alpha(0.1).hexa()}
        onClick={() => {
          disconnect();
          if (typeof onDisconnect === 'function') {
            onDisconnect();
          }
        }}
      >
        Disconnect
      </MenuItem>
    </Menu>
  );

  return (
    <Dropdown customCSS={customCSS} primaryColor={themeColorObject.hex()}>
      <Button
        onClick={clickStakeAddress}
        borderRadius={borderRadius}
        primaryColor={themeColorObject.hex()}
      >
        {beforeComponent}
        {buttonTitle}
        {afterComponent}
      </Button>
      {!disabled && (isEnabled && isConnected ? actionMenu : walletMenu)}
    </Dropdown>
  );
};

export default ConnectWalletButton;
