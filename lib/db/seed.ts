import { db } from './database';
import { addTransaction, addRecurringTransaction, addSavingsGoal, upsertBudget, updateSettings } from './queries';
import { seedDefaultCategories } from './database';

function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export async function seedQAData(): Promise<void> {
  // Ensure categories exist
  await seedDefaultCategories();
  const categories = await db.categories.toArray();
  const catByName = Object.fromEntries(categories.map(c => [c.name, c.id!]));

  // Set salary
  await updateSettings({ salary: 15000 });

  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  // Generate transactions for last 4 months
  const months = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(year, currentMonth - 1 - i, 1);
    months.push({ y: d.getFullYear(), m: d.getMonth() + 1 });
  }

  const merchantNotes: Record<string, string[]> = {
    'סופרמרקט': ['רמי לוי', 'שופרסל', 'יינות ביתן', 'אושר עד'],
    'מסעדות': ['קפה גרג', 'מקדונלדס', 'פיצה האט', 'אגאדיר'],
    'תחבורה': ['רב קו', 'דלק סונול', 'דלק פז', 'גט טקסי'],
    'קניות': ['H&M', 'זארה', 'עלי אקספרס', 'אמזון'],
    'בידור': ['נטפליקס', 'סינמה סיטי', 'ספוטיפיי', 'YES'],
    'בריאות': ['סופר פארם', 'בית מרקחת', 'מכבי שירותי בריאות'],
    'דיור': ['שכר דירה', 'חשמל', 'מים', 'ארנונה', 'ועד בית'],
    'אחר': ['ביטוח', 'מתנות', 'תרומות'],
  };

  for (const { y, m } of months) {
    const daysInMonth = new Date(y, m, 0).getDate();
    const isCurrentMonth = y === year && m === currentMonth;
    const maxDay = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;

    // Supermarket: 6-8 transactions per month
    const superCount = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < superCount; i++) {
      const day = 1 + Math.floor(Math.random() * maxDay);
      const notes = merchantNotes['סופרמרקט'][Math.floor(Math.random() * merchantNotes['סופרמרקט'].length)];
      await addTransaction({
        amount: 80 + Math.floor(Math.random() * 250),
        currency: 'NIS', originalAmount: 80 + Math.floor(Math.random() * 250), originalCurrency: 'NIS',
        categoryId: catByName['סופרמרקט'], date: dateStr(y, m, day),
        notes, type: 'expense', source: 'manual',
      });
    }

    // Restaurants: 3-5
    const restCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < restCount; i++) {
      const day = 1 + Math.floor(Math.random() * maxDay);
      const notes = merchantNotes['מסעדות'][Math.floor(Math.random() * merchantNotes['מסעדות'].length)];
      await addTransaction({
        amount: 40 + Math.floor(Math.random() * 120),
        currency: 'NIS', originalAmount: 40 + Math.floor(Math.random() * 120), originalCurrency: 'NIS',
        categoryId: catByName['מסעדות'], date: dateStr(y, m, day),
        notes, type: 'expense', source: 'manual',
      });
    }

    // Transport: 3-4
    const transCount = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < transCount; i++) {
      const day = 1 + Math.floor(Math.random() * maxDay);
      const notes = merchantNotes['תחבורה'][Math.floor(Math.random() * merchantNotes['תחבורה'].length)];
      await addTransaction({
        amount: 20 + Math.floor(Math.random() * 180),
        currency: 'NIS', originalAmount: 20 + Math.floor(Math.random() * 180), originalCurrency: 'NIS',
        categoryId: catByName['תחבורה'], date: dateStr(y, m, day),
        notes, type: 'expense', source: 'manual',
      });
    }

    // Shopping: 2-3
    const shopCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < shopCount; i++) {
      const day = 1 + Math.floor(Math.random() * maxDay);
      const notes = merchantNotes['קניות'][Math.floor(Math.random() * merchantNotes['קניות'].length)];
      await addTransaction({
        amount: 50 + Math.floor(Math.random() * 300),
        currency: 'NIS', originalAmount: 50 + Math.floor(Math.random() * 300), originalCurrency: 'NIS',
        categoryId: catByName['קניות'], date: dateStr(y, m, day),
        notes, type: 'expense', source: 'manual',
      });
    }

    // Entertainment: 2
    for (let i = 0; i < 2; i++) {
      const day = 1 + Math.floor(Math.random() * maxDay);
      const notes = merchantNotes['בידור'][Math.floor(Math.random() * merchantNotes['בידור'].length)];
      await addTransaction({
        amount: 30 + Math.floor(Math.random() * 70),
        currency: 'NIS', originalAmount: 30 + Math.floor(Math.random() * 70), originalCurrency: 'NIS',
        categoryId: catByName['בידור'], date: dateStr(y, m, day),
        notes, type: 'expense', source: 'manual',
      });
    }

    // Health: 1-2
    const healthCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < healthCount; i++) {
      const day = 1 + Math.floor(Math.random() * maxDay);
      const notes = merchantNotes['בריאות'][Math.floor(Math.random() * merchantNotes['בריאות'].length)];
      await addTransaction({
        amount: 30 + Math.floor(Math.random() * 150),
        currency: 'NIS', originalAmount: 30 + Math.floor(Math.random() * 150), originalCurrency: 'NIS',
        categoryId: catByName['בריאות'], date: dateStr(y, m, day),
        notes, type: 'expense', source: 'manual',
      });
    }

    // Housing: rent + utilities
    await addTransaction({
      amount: 3500, currency: 'NIS', originalAmount: 3500, originalCurrency: 'NIS',
      categoryId: catByName['דיור'], date: dateStr(y, m, 1),
      notes: 'שכר דירה', type: 'expense', source: 'manual',
    });
    await addTransaction({
      amount: 250 + Math.floor(Math.random() * 150), currency: 'NIS',
      originalAmount: 250 + Math.floor(Math.random() * 150), originalCurrency: 'NIS',
      categoryId: catByName['דיור'], date: dateStr(y, m, 15),
      notes: 'חשמל', type: 'expense', source: 'manual',
    });

    // Income: salary on the 10th
    await addTransaction({
      amount: 15000, currency: 'NIS', originalAmount: 15000, originalCurrency: 'NIS',
      categoryId: catByName['משכורת'], date: dateStr(y, m, Math.min(10, maxDay)),
      notes: 'משכורת', type: 'income', source: 'manual',
    });

    // Other: 1-2
    const otherCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < otherCount; i++) {
      const day = 1 + Math.floor(Math.random() * maxDay);
      const notes = merchantNotes['אחר'][Math.floor(Math.random() * merchantNotes['אחר'].length)];
      await addTransaction({
        amount: 50 + Math.floor(Math.random() * 200),
        currency: 'NIS', originalAmount: 50 + Math.floor(Math.random() * 200), originalCurrency: 'NIS',
        categoryId: catByName['אחר'], date: dateStr(y, m, day),
        notes, type: 'expense', source: 'manual',
      });
    }
  }

  // Add recurring transactions
  await addRecurringTransaction({
    categoryId: catByName['דיור'], amount: 3500, dayOfMonth: 1,
    type: 'expense', notes: 'שכר דירה',
  });
  await addRecurringTransaction({
    categoryId: catByName['בידור'], amount: 50, dayOfMonth: 5,
    type: 'expense', notes: 'נטפליקס + ספוטיפיי',
  });
  await addRecurringTransaction({
    categoryId: catByName['בריאות'], amount: 180, dayOfMonth: 3,
    type: 'expense', notes: 'חדר כושר',
  });

  // Add savings goals
  await addSavingsGoal({
    name: 'חופשה ביוון', targetAmount: 8000, currentAmount: 3200,
    color: '#38bdf8', icon: '✈️',
  });
  await addSavingsGoal({
    name: 'מחשב נייד חדש', targetAmount: 5000, currentAmount: 1500,
    color: '#8b5cf6', icon: '💻',
  });

  // Add budgets for current month
  const cm = `${year}-${String(currentMonth).padStart(2, '0')}`;
  await upsertBudget({ categoryId: catByName['סופרמרקט'], month: cm, limitAmount: 2000 });
  await upsertBudget({ categoryId: catByName['מסעדות'], month: cm, limitAmount: 800 });
  await upsertBudget({ categoryId: catByName['בידור'], month: cm, limitAmount: 400 });
  await upsertBudget({ categoryId: catByName['קניות'], month: cm, limitAmount: 600 });
}
