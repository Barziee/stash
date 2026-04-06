import 'fake-indexeddb/auto';
import { db, seedDefaultCategories } from '@/lib/db/database';

describe('seedDefaultCategories', () => {
  beforeEach(async () => {
    await db.categories.clear();
  });

  it('seeds 10 default categories on first run', async () => {
    await seedDefaultCategories();
    const count = await db.categories.count();
    expect(count).toBe(10);
  });

  it('does not duplicate if called twice', async () => {
    await seedDefaultCategories();
    await seedDefaultCategories();
    const count = await db.categories.count();
    expect(count).toBe(10);
  });
});
