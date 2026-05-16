const STORAGE_KEY = 'mika_my_claims';

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addClaim(giftId: string) {
  const claims = read();
  if (!claims.includes(giftId)) {
    claims.push(giftId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
  }
}

export function removeClaim(giftId: string) {
  const claims = read().filter((id) => id !== giftId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
}

export function isMyClaim(giftId: string): boolean {
  return read().includes(giftId);
}
