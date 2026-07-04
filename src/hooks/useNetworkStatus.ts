import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
};

function resolveOnline(state: NetInfoState): boolean {
  if (state.isConnected === false) {
    return false;
  }

  if (state.isInternetReachable === false) {
    return false;
  }

  return true;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: NetInfoStateType.unknown,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus({
        isConnected: resolveOnline(state),
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    NetInfo.fetch().then((state) => {
      setStatus({
        isConnected: resolveOnline(state),
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    return unsubscribe;
  }, []);

  return status;
}
