'use strict';

module.exports = ($el) => {

  require.ensure([], (require) => {

    var Module = require('./smart-button.main');
    new Module($el);

  });

};
