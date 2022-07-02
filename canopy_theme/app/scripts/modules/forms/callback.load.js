'use strict';

module.exports = ($el) => {

  require.ensure([], (require) => {

    var Module = require('./callback.main');
    new Module($el);

  });

};
