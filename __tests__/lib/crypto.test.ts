// Node 24 has built-in Web Crypto — no polyfill needed in test env
import { encrypt, decrypt } from '@/lib/crypto/credentials';

describe('credentials crypto', () => {
  const masterPassword = 'test-master-password-123';
  const plaintext = 'myBankPassword!';

  it('encrypts and decrypts round-trip correctly', async () => {
    const { ciphertext, iv } = await encrypt(plaintext, masterPassword);
    expect(ciphertext).not.toBe(plaintext);
    const result = await decrypt(ciphertext, iv, masterPassword);
    expect(result).toBe(plaintext);
  });

  it('produces different ciphertext each time (random IV)', async () => {
    const a = await encrypt(plaintext, masterPassword);
    const b = await encrypt(plaintext, masterPassword);
    expect(a.ciphertext).not.toBe(b.ciphertext);
    expect(a.iv).not.toBe(b.iv);
  });

  it('throws on wrong master password', async () => {
    const { ciphertext, iv } = await encrypt(plaintext, masterPassword);
    await expect(decrypt(ciphertext, iv, 'wrong-password')).rejects.toThrow();
  });
});
