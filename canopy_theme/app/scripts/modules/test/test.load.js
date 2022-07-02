'use strict';

module.exports = ($el) => {

  require.ensure([], (require) => {

    var Module = require('./test.main');
    new Module($el);

  });

};
