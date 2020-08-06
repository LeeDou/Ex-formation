/**
 * author likang@sensorsdata.cn
 */

import sa from 'sa';

/**
 * logger
 */
export function logger() {
  if (sa.para.show_log) {
    if (typeof console === 'object' && console.log) {
      try {
        return console.log.apply(console, arguments);
      } catch (e) {
        console.log(arguments[0]);
      }
    }
  }
}
