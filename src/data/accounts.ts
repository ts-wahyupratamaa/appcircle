export type Account = {
  id: string;
  email: string;
  pin: string;
};

export const ACCOUNTS: Account[] = [
  { id: 'aody.dev', email: 'aody.dev', pin: '1001' },
  { id: 'piki.dev', email: 'piki.dev', pin: '1002' },
  { id: 'sarah.qa', email: 'sarah.qa', pin: '1003' },
  { id: 'meita.bl', email: 'meita.bl', pin: '1004' },
  { id: 'sshdkey.dev', email: 'sshdkey.dev', pin: '1005' },
];

export function findAccountByPin(pin: string): Account | undefined {
  return ACCOUNTS.find((account) => account.pin === pin);
}

export function findAccountById(id: string): Account | undefined {
  return ACCOUNTS.find((account) => account.id === id);
}
