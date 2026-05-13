import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Gift, GiftInput } from '../types';
import { SEED_GIFTS } from '../seed';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : null;

const STORAGE_KEY = 'mika_wishlist_gifts_v1';
const BROADCAST_CHANNEL = 'mika_wishlist_sync';

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function readLocal(): Gift[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded: Gift[] = SEED_GIFTS.map((g, i) => ({
        ...g,
        id: uuid(),
        created_at: new Date(Date.now() + i).toISOString(),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as Gift[];
  } catch {
    return [];
  }
}

function writeLocal(gifts: Gift[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gifts));
  try {
    const bc = new BroadcastChannel(BROADCAST_CHANNEL);
    bc.postMessage({ type: 'gifts:update' });
    bc.close();
  } catch {
    // BroadcastChannel may be unavailable; storage event still fires across tabs
  }
}

export async function listGifts(): Promise<Gift[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as Gift[];
  }
  return readLocal().sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function claimGift(id: string, name: string): Promise<Gift> {
  if (supabase) {
    const { data, error } = await supabase
      .from('gifts')
      .update({ claimed_by: name })
      .eq('id', id)
      .is('claimed_by', null)
      .select()
      .single();
    if (error) throw error;
    if (!data) throw new Error('המתנה כבר נתפסה על ידי מישהו אחר');
    return data as Gift;
  }
  const gifts = readLocal();
  const idx = gifts.findIndex((g) => g.id === id);
  if (idx === -1) throw new Error('מתנה לא נמצאה');
  if (gifts[idx].claimed_by) throw new Error('המתנה כבר נתפסה');
  gifts[idx] = { ...gifts[idx], claimed_by: name };
  writeLocal(gifts);
  return gifts[idx];
}

export async function releaseGift(id: string): Promise<Gift> {
  if (supabase) {
    const { data, error } = await supabase
      .from('gifts')
      .update({ claimed_by: null })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Gift;
  }
  const gifts = readLocal();
  const idx = gifts.findIndex((g) => g.id === id);
  if (idx === -1) throw new Error('מתנה לא נמצאה');
  gifts[idx] = { ...gifts[idx], claimed_by: null };
  writeLocal(gifts);
  return gifts[idx];
}

export async function createGift(input: GiftInput): Promise<Gift> {
  if (supabase) {
    const { data, error } = await supabase.from('gifts').insert(input).select().single();
    if (error) throw error;
    return data as Gift;
  }
  const gifts = readLocal();
  const next: Gift = {
    ...input,
    id: uuid(),
    created_at: new Date().toISOString(),
  };
  writeLocal([...gifts, next]);
  return next;
}

export async function updateGift(id: string, input: Partial<GiftInput>): Promise<Gift> {
  if (supabase) {
    const { data, error } = await supabase
      .from('gifts')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Gift;
  }
  const gifts = readLocal();
  const idx = gifts.findIndex((g) => g.id === id);
  if (idx === -1) throw new Error('מתנה לא נמצאה');
  gifts[idx] = { ...gifts[idx], ...input };
  writeLocal(gifts);
  return gifts[idx];
}

export async function deleteGift(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('gifts').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const gifts = readLocal().filter((g) => g.id !== id);
  writeLocal(gifts);
}

export function subscribeToGifts(onChange: () => void): () => void {
  if (supabase) {
    const channel = supabase
      .channel('public:gifts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, () => {
        onChange();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }

  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(BROADCAST_CHANNEL);
    bc.onmessage = () => onChange();
  } catch {
    // ignore
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    bc?.close();
    window.removeEventListener('storage', onStorage);
  };
}
