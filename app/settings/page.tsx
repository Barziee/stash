'use client';
import { useState, useEffect } from 'react';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { BankAccountManager } from '@/components/settings/BankAccountManager';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { ResetData } from '@/components/settings/ResetData';
import { getSettings, updateSettings, resetAllData } from '@/lib/db/queries';
import { seedQAData } from '@/lib/db/seed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [salary, setSalary] = useState('');
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);

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

      <ThemeToggle />

      <Card>
        <CardHeader><CardTitle className="text-sm">משכורת חודשית (₪)</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="לדוגמה: 12000" />
          <Button onClick={handleSaveSalary}>{saved ? 'נשמר!' : 'שמור'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4"><CategoryManager /></CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4"><BankAccountManager /></CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4"><ResetData /></CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-sm">נתוני בדיקה</h3>
            <p className="text-xs text-muted-foreground">טען נתוני דמו (60+ תנועות, תקציבים, יעדי חיסכון)</p>
            <Button
              variant="outline"
              className="w-full"
              disabled={seeding}
              onClick={async () => {
                setSeeding(true);
                await resetAllData();
                await seedQAData();
                setSeeding(false);
                window.location.reload();
              }}
            >
              {seeding ? 'טוען נתונים...' : 'טען נתוני בדיקה'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
