import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/database';
import type { Category } from '@/types';

export function useCategories(): Category[] {
  return useLiveQuery(() => db.categories.toArray(), [], []);
}
