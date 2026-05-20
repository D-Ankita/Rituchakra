import { db } from '../db/database';
import { companionMemory } from '../db/schema';

/**
 * Clears Dadi's conversation memory. Leaves cycle data and app
 * settings untouched. Wired into:
 *   - Settings → Data → "Clear Dadi's memory" (memory-only wipe)
 *   - Settings → Data → "Delete All Data" (full wipe also calls this)
 */
export async function clearCompanionMemory(): Promise<void> {
  db.delete(companionMemory).run();
}
