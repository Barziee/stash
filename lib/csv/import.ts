type CSVRow = Record<string, string>;

export function parseCSVRows(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

export function deduplicateByHash(rows: CSVRow[]): CSVRow[] {
  const seen = new Set<string>();
  return rows.filter(row => {
    const hash = `${row.date}|${row.amount}|${row.description}`;
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });
}
