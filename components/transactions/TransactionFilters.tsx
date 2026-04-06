'use client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Category } from '@/types';

interface Props {
  categories: Category[];
  filterCategory: string;
  filterType: string;
  onCategoryChange: (v: string) => void;
  onTypeChange: (v: string) => void;
}

export function TransactionFilters({
  categories, filterCategory, filterType, onCategoryChange, onTypeChange
}: Props) {
  return (
    <div className="flex gap-2">
      <Select value={filterType} onValueChange={onTypeChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="expense">Expenses</SelectItem>
          <SelectItem value="income">Income</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map(c => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.icon} {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
