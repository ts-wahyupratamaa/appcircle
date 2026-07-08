import { usePathname, useRouter } from 'expo-router';

import { BottomNav, NavTab } from './BottomNav';

function tabFromPath(pathname: string): NavTab {
  if (pathname.includes('circle-chat')) return 'chat';
  if (pathname.includes('budget')) return 'budget';
  return 'feed';
}

export function MainBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const active = tabFromPath(pathname);

  return (
    <BottomNav
      active={active}
      onFeedPress={() => {
        if (active === 'feed') return;
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace('/home');
      }}
      onBudgetPress={() => {
        if (active === 'budget') return;
        router.push('/budget');
      }}
      onChatPress={() => {
        if (active === 'chat') return;
        router.push('/circle-chat');
      }}
    />
  );
}
