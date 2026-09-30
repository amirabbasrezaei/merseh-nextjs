export function toPathSlug(value: string) {
  return value.trim().replaceAll(" ", "-");
}
