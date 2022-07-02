'use strict';

module.exports = ($el) => {

  require.ensure([], (require) => {

    var Module = require('./smart-link.main');
    new Module($el);

  });

};
