'use strict';

module.exports = ($el) => {

  require.ensure([], (require) => {

    var Module = require('./filter-toggle.main');
    new Module($el);

  });

};
