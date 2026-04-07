'use client';
import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { addCategory, deleteCategory } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';

export function CategoryManager() {
  const categories = useCategories();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4ECDC4');
  const [icon, setIcon] = useState('📦');

  async function handleAdd() {
    if (!name.trim()) return;
    await addCategory({ name: name.trim(), color, icon });
    setName('');
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-sm">קטגוריות</h3>
      {categories.map(c => (
        <div key={c.id} className="flex items-center justify-between">
          <span>{c.icon} <span style={{ color: c.color }}>{c.name}</span></span>
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => c.id && deleteCategory(c.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🎯" className="w-16" />
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="שם קטגוריה" />
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer" />
        <Button onClick={handleAdd} size="icon"><Plus size={16} /></Button>
      </div>
    </div>
  );
}
