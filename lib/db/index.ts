/**
 * Database factory.
 * To swap the implementation (e.g. to Supabase, Prisma, etc.), update the
 * import below and ensure the new class satisfies the IDatabase interface.
 */
import type { IDatabase } from '../types';
import { LocalStorageDB } from './localStorageDB';

let instance: IDatabase | null = null;

export function getDatabase(): IDatabase {
  if (!instance) {
    instance = new LocalStorageDB();
  }
  return instance;
}
