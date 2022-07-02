'use strict';

module.exports = ($el) => {

  require.ensure([], (require) => {

    var Module = require('./navbar.main');
    new Module($el);

  });

};
