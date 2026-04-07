'use client';
import { useState, useEffect } from 'react';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { BankAccountManager } from '@/components/settings/BankAccountManager';
import { CsvImport } from '@/components/settings/CsvImport';
import { RecurringManager } from '@/components/settings/RecurringManager';
import { SavingsGoalManager } from '@/components/settings/SavingsGoalManager';
import { ScrapeModal } from '@/components/settings/ScrapeModal';
import { getSettings, updateSettings } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [salary, setSalary] = useState('');
  const [saved, setSaved] = useState(false);
  const [scrapeOpen, setScrapeOpen] = useState(false);

  useEffect(() => {
    getSettings().then(s => setSalary(String(s.salary)));
  }, []);

  async function handleSaveSalary() {
    await updateSettings({ salary: parseFloat(salary) || 0 });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">הגדרות</h2>

      {/* Bank Sync section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">סנכרון מבנק</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            סרוק עסקאות ישירות מחשבון הבנק שלך. הפרטים לא נשלחים לשרת.
          </p>
          <Button onClick={() => setScrapeOpen(true)} className="w-full sm:w-auto">
            סרוק עסקאות
          </Button>
        </CardContent>
      </Card>

      <ScrapeModal open={scrapeOpen} onOpenChange={setScrapeOpen} />

      <Card>
        <CardHeader><CardTitle className="text-sm">משכורת חודשית (₪)</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="לדוגמה: 12000" />
          <Button onClick={handleSaveSalary}>{saved ? 'נשמר!' : 'שמור'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4"><SavingsGoalManager /></CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4"><RecurringManager /></CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4"><CategoryManager /></CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4"><BankAccountManager /></CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4"><CsvImport /></CardContent>
      </Card>
    </div>
  );
}
