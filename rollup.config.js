var virtual = require('rollup-plugin-virtual');
var platfrom = `var type ='weapp'; export default type`;
// var pf = `export default 'weapp'`;

export default {
  input: 'core/index.js',
  plugins: [
    virtual({
      platfrom: platfrom,
    }),
  ],
  output: {
    file: 'bundle.js',
    format: 'cjs',
  },
};
