/**
 * author likang@sensorsdata.cn
 * 此模块包含一般的处理函数
 */
export function trim(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}
