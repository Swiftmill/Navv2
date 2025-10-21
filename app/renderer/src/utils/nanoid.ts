export function nanoid(size = 10): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let id = '';
  for (let i = 0; i < size; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
