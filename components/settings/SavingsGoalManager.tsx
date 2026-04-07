'use client';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/database';
import { addSavingsGoal, deleteSavingsGoal, updateSavingsGoal } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

export function SavingsGoalManager() {
  const goals = useLiveQuery(() => db.savingsGoals.toArray(), [], []);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#4a9e78');

  async function handleAdd() {
    if (!name || !target) return;
    await addSavingsGoal({
      name,
      targetAmount: parseFloat(target),
      currentAmount: 0,
      color,
      icon,
    });
    setName(''); setTarget('');
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-sm">יעדי חיסכון</h3>

      {goals?.map(g => {
        const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
        return (
          <div key={g.id} className="bg-[#222224] rounded-xl p-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{g.icon}</span>
                <div>
                  <p className="text-sm font-medium text-[#d1d1d4]">{g.name}</p>
                  <p className="text-xs text-[#505052]">₪{g.currentAmount.toFixed(0)} / ₪{g.targetAmount.toFixed(0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost" size="icon" className="h-6 w-6 text-[#4a9e78]"
                  onClick={() => g.id && updateSavingsGoal(g.id, { currentAmount: Math.min(g.currentAmount + 100, g.targetAmount) })}
                  title="+₪100"
                >
                  <Plus size={12} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-[#404042] hover:text-[#a84444]"
                  onClick={() => g.id && deleteSavingsGoal(g.id)}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
            <div className="h-1.5 bg-[#191919] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: g.color }}
              />
            </div>
            <p className="text-[10px] text-[#404042] mt-1 text-end">{pct.toFixed(0)}%</p>
          </div>
        );
      })}

      <div className="flex flex-col gap-2 border border-[#272729] rounded-xl p-3 mt-1">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">שם היעד</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="לדוגמה: חופשה" />
          </div>
          <div>
            <Label className="text-xs">יעד (₪)</Label>
            <Input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div className="flex gap-2">
          <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🎯" className="w-16 text-center" />
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer" />
        </div>
        <Button onClick={handleAdd} className="w-full gap-1.5">
          <Plus size={14} /> הוסף יעד
        </Button>
      </div>
    </div>
  );
}
