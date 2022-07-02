'use strict';

module.exports = ($el) => {

  require.ensure([], (require) => {

    var Module = require('./filter-newsroom.main');
    new Module($el);

  });

};
