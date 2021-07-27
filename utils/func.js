export function trim(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}

export function isFunction(f) {
  try {
    return /^\s*\bfunction\b/.test(f);
  } catch (x) {
    return false;
  }
}
