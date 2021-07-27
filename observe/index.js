import emitter from './emitter';
import subscribe from './sub';
import ex from '../core/instance';

ex.emitter = new emitter();
ex.eventSub = subscribe;

export default ex;
