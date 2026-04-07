'use client';
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
  const activePill = 'bg-[#34b87a18] border border-[#34b87a30] text-[#34b87a]';
  const idlePill = 'bg-[#16161e] text-[#4a4a5a] hover:text-[#8a8a9a]';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {(['all', 'expense', 'income'] as const).map(type => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-colors ${
              filterType === type ? activePill : idlePill
            }`}
          >
            {type === 'all' ? 'הכל' : type === 'expense' ? 'הוצאות' : 'הכנסות'}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onCategoryChange('all')}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterCategory === 'all' ? activePill : idlePill
          }`}
        >
          הכל
        </button>
        {categories.map(c => {
          const isActive = filterCategory === String(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onCategoryChange(String(c.id))}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={isActive
                ? { backgroundColor: c.color + '22', border: `1px solid ${c.color}44`, color: c.color }
                : { backgroundColor: '#16161e', color: '#4a4a5a' }
              }
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
