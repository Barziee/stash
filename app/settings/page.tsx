'use client';
import { useState, useEffect } from 'react';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { BankAccountManager } from '@/components/settings/BankAccountManager';
import { CsvImport } from '@/components/settings/CsvImport';
import { getSettings, updateSettings } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [salary, setSalary] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(s => setSalary(String(s.salary)));
  }, []);

  async function handleSaveSalary() {
    await updateSettings({ salary: parseFloat(salary) || 0 });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold">Settings</h2>

      <Card>
        <CardHeader><CardTitle className="text-sm">Monthly Salary (NIS)</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input
            type="number"
            value={salary}
            onChange={e => setSalary(e.target.value)}
            placeholder="e.g. 12000"
          />
          <Button onClick={handleSaveSalary}>{saved ? 'Saved!' : 'Save'}</Button>
        </CardContent>
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
