import ex from '../core/instance';
import { clearAllProps, clearAllRegister, clearAppRegister, registerApp, register } from './func';

ex.currentProps = {};
ex.properties = {
  $lib: ex.LIB_NAME,
  $lib_version: String(ex.LIB_VERSION)
};

ex.clearAllProps = clearAllProps;
ex.clearAllRegister = clearAllRegister;
ex.clearAppRegister = clearAppRegister;
ex.registerApp = registerApp;
ex.register = register;

export default ex;
