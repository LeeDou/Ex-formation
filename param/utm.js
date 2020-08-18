/**
 * author likang@sensorsdata.cn
 */
import { extend } from '../utils'

/**
 * 
 * @param  para 
 * @param  prop 
 * 在此函数内修改 prop 并不合理，将返回一个对象，调用函数返回
 */
export function setUtm(para, prop) {
  var utms = {};
  var query = _.getMixedQuery(para);
  var pre1 = _.getCustomUtmFromQuery(query, '$', '_', '$');
  var pre2 = _.getCustomUtmFromQuery(query, '$latest_', '_latest_', '$latest_');
  utms.pre1 = pre1;
  utms.pre2 = pre2;
  extend(prop, pre1);
  return utms;
}
