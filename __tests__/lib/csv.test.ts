import { parseCSVRows, deduplicateByHash } from '@/lib/csv/import';

const sampleCSV = `date,amount,currency,description
2026-03-01,120,NIS,Supermarket
2026-03-02,45.5,USD,Coffee
2026-03-01,120,NIS,Supermarket`;

describe('parseCSVRows', () => {
  it('parses header and data rows', () => {
    const rows = parseCSVRows(sampleCSV);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({
      date: '2026-03-01',
      amount: '120',
      currency: 'NIS',
      description: 'Supermarket',
    });
  });
});

describe('deduplicateByHash', () => {
  it('removes duplicate rows with same date+amount+description', () => {
    const rows = parseCSVRows(sampleCSV);
    const deduped = deduplicateByHash(rows);
    expect(deduped).toHaveLength(2);
  });
});
