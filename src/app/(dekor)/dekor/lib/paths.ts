export function ensureLeadingSlash(path: string) {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}
