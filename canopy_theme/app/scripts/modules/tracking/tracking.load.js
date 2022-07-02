'use strict';

module.exports = ($el) => {

  require.ensure([], (require) => {

    var Module = require('./tracking.main');
    new Module($el);

  });

};
