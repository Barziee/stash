'use client';
import { useState } from 'react';
import { db } from '@/lib/db/database';
import { encrypt } from '@/lib/crypto/credentials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

const SUPPORTED_BANKS = [
  'hapoalim', 'leumi', 'discount', 'mizrahi', 'isracard', 'max', 'cal', 'amex'
];

export function BankAccountManager() {
  const accounts = useLiveQuery(() => db.bankCredentials.toArray(), [], []);
  const [bank, setBank] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!bank || !username || !password || !masterPassword) return;
    setSaving(true);
    const { ciphertext, iv } = await encrypt(password, masterPassword);
    await db.bankCredentials.add({ bankName: bank, username, encryptedPassword: ciphertext, iv });
    setBank(''); setUsername(''); setPassword(''); setSaving(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-sm">חשבונות בנק</h3>
      <p className="text-xs text-muted-foreground">
        פרטי הכניסה מוצפנים במכשיר ולא נשלחים לשום שרת.
      </p>
      {accounts?.map(a => (
        <div key={a.id} className="flex items-center justify-between">
          <span className="text-sm capitalize">{a.bankName} — {a.username}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => a.id && db.bankCredentials.delete(a.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <div className="flex flex-col gap-2 mt-2 border rounded-md p-3">
        <Label>בנק</Label>
        <Select value={bank} onValueChange={setBank}>
          <SelectTrigger><SelectValue placeholder="בחר בנק" /></SelectTrigger>
          <SelectContent>
            {SUPPORTED_BANKS.map(b => (
              <SelectItem key={b} value={b} className="capitalize">{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Label>שם משתמש / ת.ז.</Label>
        <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="שם משתמש" />
        <Label>סיסמה</Label>
        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="סיסמה" />
        <Label>סיסמת מאסטר (להצפנה מקומית)</Label>
        <Input type="password" value={masterPassword} onChange={e => setMasterPassword(e.target.value)} placeholder="סיסמת מאסטר שלך" />
        <Button onClick={handleAdd} disabled={saving}>
          {saving ? 'שומר...' : 'הוסף חשבון'}
        </Button>
      </div>
    </div>
  );
}
