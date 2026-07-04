import { usePathname, useRouter } from 'expo-router';

import { BottomNav, NavTab } from './BottomNav';

function tabFromPath(pathname: string): NavTab {
  return pathname.includes('circle-chat') ? 'chat' : 'feed';
}

export function MainBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const active = tabFromPath(pathname);

  return (
    <BottomNav
      active={active}
      onFeedPress={() => {
        if (active === 'feed') {
          return;
        }
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace('/home');
      }}
      onChatPress={() => {
        if (active === 'chat') {
          return;
        }
        router.push('/circle-chat');
      }}
    />
  );
}
