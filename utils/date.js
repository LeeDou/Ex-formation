import { isObject, isDate } from './proto';
import { each } from './arr';

export function formatDate(d) {
  function pad(n) {
    return n < 10 ? '0' + n : n;
  }

  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    ' ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':' +
    pad(d.getSeconds()) +
    '.' +
    pad(d.getMilliseconds())
  );
}

export function searchObjDate(o) {
  if (isObject(o)) {
    each(o, function (a, b) {
      if (isObject(a)) {
        searchObjDate(o[b]);
      } else {
        if (isDate(a)) {
          o[b] = formatDate(a);
        }
      }
    });
  }
}
