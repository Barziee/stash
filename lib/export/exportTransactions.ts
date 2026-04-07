'use client';
import type { Transaction, Category } from '@/types';

function buildRows(transactions: Transaction[], categories: Category[]) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
  return transactions.map(t => ({
    תאריך: t.date,
    קטגוריה: catMap[t.categoryId]?.name ?? '',
    סכום: t.type === 'expense' ? -t.amount : t.amount,
    מטבע: t.currency,
    סוג: t.type === 'expense' ? 'הוצאה' : 'הכנסה',
    הערה: t.notes ?? '',
    פיצול: t.splitWithName ? `עם ${t.splitWithName}` : '',
  }));
}

export async function exportToExcel(
  transactions: Transaction[],
  categories: Category[],
  month: string
) {
  const { utils, writeFile } = await import('xlsx');
  const rows = buildRows(transactions, categories);
  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, month);
  writeFile(wb, `stash-${month}.xlsx`);
}

export async function exportToPdf(
  transactions: Transaction[],
  categories: Category[],
  month: string
) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  doc.setFontSize(16);
  doc.text(`Stash — ${month}`, 14, 18);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  doc.setFontSize(10);
  doc.text(`Total income: NIS ${totalIncome.toFixed(2)}`, 14, 28);
  doc.text(`Total expenses: NIS ${totalExpenses.toFixed(2)}`, 14, 34);
  doc.text(`Balance: NIS ${(totalIncome - totalExpenses).toFixed(2)}`, 14, 40);

  let y = 50;
  doc.setFontSize(9);
  doc.text('Date', 14, y); doc.text('Category', 40, y); doc.text('Amount', 100, y); doc.text('Note', 130, y);
  y += 5;
  doc.line(14, y, 196, y);
  y += 4;

  for (const t of transactions) {
    if (y > 270) { doc.addPage(); y = 20; }
    const cat = catMap[t.categoryId]?.name ?? '';
    const amount = `${t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}`;
    doc.text(t.date, 14, y);
    doc.text(cat, 40, y);
    doc.text(amount, 100, y);
    doc.text(t.notes ?? '', 130, y);
    y += 6;
  }

  doc.save(`stash-${month}.pdf`);
}
