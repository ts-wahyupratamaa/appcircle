import { eventPastels } from '../theme';

import { ACCOUNTS } from './accounts';

export type Circle = {
  id: string;
  name: string;
  tag: string;
  pin: string;
  emoji: string;
  bgColor: string;
  members: string[];
  description: string;
};

export const HATERS_ASIA_ID = 'haters-asia';

export const HATERS_ASIA: Circle = {
  id: HATERS_ASIA_ID,
  name: 'circle kita',
  tag: '#haters-asia',
  pin: '8888',
  emoji: '🔥',
  bgColor: eventPastels.wedding,
  members: ACCOUNTS.map((account) => account.id),
  description:
    'Ruang ngobrol khusus anggota circle ini. Share cerita, foto, dan hal random bareng teman dekat.',
};

export function findCircleById(id: string): Circle | undefined {
  return id === HATERS_ASIA.id ? HATERS_ASIA : undefined;
}

export function findCircleByPin(pin: string): Circle | undefined {
  return pin === HATERS_ASIA.pin ? HATERS_ASIA : undefined;
}
