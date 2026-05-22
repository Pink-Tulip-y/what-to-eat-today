import { useState, useCallback } from 'react';

export interface HistoryEntry {
  location: string;
  category: string;
  time: number;
}

const KEY = 'wte_history';
const MAX = 20;

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(entries: HistoryEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function useHistory() {
  const [items, setItems] = useState<HistoryEntry[]>(load);

  const add = useCallback((entry: Omit<HistoryEntry, 'time'>) => {
    const next = [
      { ...entry, time: Date.now() },
      ...items.filter((e) => !(e.location === entry.location && e.category === entry.category)),
    ].slice(0, MAX);
    setItems(next);
    save(next);
  }, [items]);

  const clear = useCallback(() => {
    setItems([]);
    save([]);
  }, []);

  return { items, add, clear };
}
