'use strict';

module.exports = ($el) => {
  
  require.ensure([], (require) => {
  
    var Module = require('./info.main');
    new Module($el);
    
  });
  
};
