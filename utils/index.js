export * from './arr';
export * from './code';
export * from './date';
export * from './func';
export * from './obj';
export * from './proto';
export * from './str';

export function formatSystem(system) {
  var _system = system.toLowerCase();
  if (_system === 'ios') {
    return 'iOS';
  } else if (_system === 'android') {
    return 'Android';
  } else {
    return system;
  }
}

export function getUUID() {
  return (
    '' +
    Date.now() +
    '-' +
    Math.floor(1e7 * Math.random()) +
    '-' +
    Math.random().toString(16).replace('.', '') +
    '-' +
    String(Math.random() * 31242)
      .replace('.', '')
      .slice(0, 8)
  );
}
