const WATCHLIST_KEY = "skyflix_watchlist";

export function getWatchlist(): any[] {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isInWatchlist(id: string, type: string): boolean {
  return getWatchlist().some((item: any) => item.id === id && item.type === type);
}

export function toggleWatchlist(item: any): boolean {
  const list = getWatchlist();
  const idx = list.findIndex((i: any) => i.id === item.id && i.type === item.type);
  if (idx > -1) {
    list.splice(idx, 1);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    return false;
  }
  list.push({ ...item, addedAt: Date.now() });
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  return true;
}

export function removeFromWatchlist(id: string, type: string): void {
  const list = getWatchlist();
  const idx = list.findIndex((i: any) => i.id === id && i.type === type);
  if (idx > -1) {
    list.splice(idx, 1);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
  }
}
