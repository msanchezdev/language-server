export function deepMerge(target: any, ...sources: any[]) {
  if (!sources.length) return target;

  for (const source of sources) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return target;
}
function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}
