'use client';
import { useState } from 'react';
import { resetAllData } from '@/lib/db/queries';
import { seedDefaultCategories } from '@/lib/db/database';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ResetData() {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReset() {
    await resetAllData();
    await seedDefaultCategories();
    setDone(true);
    setTimeout(() => window.location.reload(), 1000);
  }

  if (done) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-center">
        <p className="text-sm text-green-500">כל הנתונים אופסו בהצלחה!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {!confirming ? (
        <Button
          variant="outline"
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 gap-2"
          onClick={() => setConfirming(true)}
        >
          <Trash2 size={14} />
          איפוס כל הנתונים
        </Button>
      ) : (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-sm text-destructive font-medium text-center">
            האם אתה בטוח? כל הנתונים יימחקו לצמיתות.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
              ביטול
            </Button>
            <Button
              className="flex-1 bg-destructive text-white hover:bg-destructive/90"
              onClick={handleReset}
            >
              מחק הכל
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
